import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Global redirector for password recovery flow.
 * If a user lands on any route with a Supabase recovery hash (type=recovery),
 * we immediately redirect them to /auth?type=recovery while preserving the hash.
 */
export default function RecoveryRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check hash fragment from Supabase: e.g. #access_token=...&type=recovery
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const isRecovery = hash.get("type") === "recovery";

    if (isRecovery && location.pathname !== "/auth") {
      // Preserve the entire hash so Supabase can finalize the recovery session
      navigate(`/auth?type=recovery${window.location.hash}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}
