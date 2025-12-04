import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface KlaviyoConnection {
  id: string;
  user_id: string;
  is_connected: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export const useKlaviyoConnection = () => {
  const [connection, setConnection] = useState<KlaviyoConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const fetchConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("klaviyo_connections")
        .select("id, user_id, is_connected, last_sync_at, created_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching Klaviyo connection:", error);
      } else if (data) {
        setConnection(data);
        setIsConnected(data.is_connected);
      }
    } catch (error) {
      console.error("Error fetching Klaviyo connection:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnection();
  }, []);

  const refresh = () => {
    setLoading(true);
    fetchConnection();
  };

  const disconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { error } = await supabase
        .from("klaviyo_connections")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error disconnecting Klaviyo:", error);
        return false;
      }

      setConnection(null);
      setIsConnected(false);
      return true;
    } catch (error) {
      console.error("Error disconnecting Klaviyo:", error);
      return false;
    }
  };

  return {
    connection,
    loading,
    isConnected,
    refresh,
    disconnect,
  };
};