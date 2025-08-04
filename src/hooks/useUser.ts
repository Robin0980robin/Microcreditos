// hooks/useUser.ts

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const useUser = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error) {
          setUser({ ...user, profile });
        }
      }
    };

    fetchUser();
  }, []);

  return { user };
};
