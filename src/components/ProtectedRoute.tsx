import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const [sessionExists, setSessionExists] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionExists(!!data.session);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) return <div className="text-center mt-10">Cargando...</div>;

  return sessionExists ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
