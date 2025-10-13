import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NewUserBonusDialog = () => {
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const checkNewUser = async () => {
      // Check if dialog has been shown before (in localStorage)
      const dialogShown = localStorage.getItem('newUserBonusShown');
      if (dialogShown) {
        setHasShown(true);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user account is less than 24 hours old
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);

      // Show dialog only for users less than 24 hours old who haven't seen it
      if (hoursSinceCreation < 24 && !dialogShown) {
        setOpen(true);
      }
    };

    checkNewUser();
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('newUserBonusShown', 'true');
    setHasShown(true);
  };

  if (hasShown) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">Welcome to Vayno! 🎉</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            We've added <span className="font-semibold text-primary">+2 bonus generations</span> to your account as a welcome gift! 
            <br /><br />
            You now have <span className="font-semibold">5 total generations</span> to create amazing email campaigns. This is a one-time bonus to help you get started.
            <br /><br />
            Have fun creating! 🚀
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleClose} className="w-full">
          Got it, thanks!
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewUserBonusDialog;
