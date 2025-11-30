import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { trackFormSubmission, trackFunnelStep, trackConversion } from "@/lib/analytics";
import vaynoIcon from "@/assets/vayno-icon.png";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    // Detect password recovery from query OR hash params
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    if (searchParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery') {
      setIsUpdatingPassword(true);
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsUpdatingPassword(true);
        return;
      }
      if (event === "SIGNED_IN" && session) {
        // Avoid claiming during recovery flow
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const isRecovery = hash.get('type') === 'recovery';
        if (isRecovery || isUpdatingPassword) return;
        // Defer any Supabase calls to prevent deadlocks
        setTimeout(() => {
          claimGuestCampaign(session.user.id);
        }, 0);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const isRecovery = hash.get('type') === 'recovery';
        if (!isRecovery && !isUpdatingPassword) {
          claimGuestCampaign(session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isUpdatingPassword]);

  const claimGuestCampaign = async (userId: string) => {
    const guestCampaignId = localStorage.getItem("guestCampaignId");
    
    try {
      // Check if onboarding is completed first
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", userId)
        .single();

      if (guestCampaignId) {
        // Update campaign with user_id
        const { error: updateError } = await supabase
          .from("campaigns")
          .update({ user_id: userId })
          .eq("id", guestCampaignId)
          .is("user_id", null);

        if (!updateError) {
          // Increment user generations
          await supabase.rpc("increment_user_generations", {
            user_id: userId,
          });

          // Clear guest campaign ID
          localStorage.removeItem("guestCampaignId");
          
          toast.success("Your campaign has been unlocked!");
          
          // Navigate to the campaign after plan selection
          localStorage.setItem("pendingCampaignId", guestCampaignId);
        }
      }

      // Always check onboarding status
      setTimeout(() => {
        if (!profile?.onboarding_completed) {
          navigate("/onboarding");
        } else {
          navigate("/choose-plan");
        }
      }, 1000);
    } catch (err) {
      console.error("Error in claimGuestCampaign:", err);
      // Still check onboarding even if there's an error
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", userId)
          .single();

        if (!profile?.onboarding_completed) {
          navigate("/onboarding");
        } else {
          navigate("/choose-plan");
        }
      } catch {
        navigate("/onboarding");
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      nameSchema.parse(fullName);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        trackFormSubmission('signup', false);
      } else {
        toast.success("Check your email to verify your account!", { 
          duration: 6000,
          description: "We've sent a verification link to your email address."
        });
        trackFormSubmission('signup', true);
        trackFunnelStep('signup');
        trackConversion('signup');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("An error occurred during sign up");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        trackFormSubmission('signin', false);
      } else {
        toast.success("Signed in successfully!");
        trackFormSubmission('signin', true);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("An error occurred during sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setResetEmailSent(true);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      passwordSchema.parse(newPassword);

      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully! Please sign in.");
        setIsUpdatingPassword(false);
        setNewPassword("");
        setConfirmPassword("");
        // Sign out to ensure the user returns to the sign-in screen
        await supabase.auth.signOut();
        navigate("/auth", { replace: true });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // If user is updating password from reset email
  if (isUpdatingPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">Create New Password</h1>
              <p className="text-muted-foreground">Enter your new password below</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" className="w-full btn-premium shadow-lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8">
          <div className="text-center mb-8">
            <img src={vaynoIcon} alt="Vayno" className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Sign in</h1>
            <p className="text-muted-foreground">Welcome back</p>
          </div>

          <div className="w-full">
            {!resetMode ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                <Button type="submit" className="w-full btn-premium shadow-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth?view=signup")}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            ) : resetEmailSent ? (
              <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Check your email</h3>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the link in the email to reset your password.
                  </p>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setResetEmailSent(false);
                  }}
                  className="w-full text-sm text-primary hover:underline mt-4"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      We'll send you a password reset link
                    </p>
                  </div>
                  <Button type="submit" className="w-full btn-premium shadow-lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="w-full text-sm text-muted-foreground hover:text-primary"
                >
                  Back to sign in
                </button>
              </form>
            )}
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};


export default Auth;