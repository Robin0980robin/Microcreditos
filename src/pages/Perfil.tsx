import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Pencil } from "lucide-react";

const MiPerfil = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const getUser = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error al obtener sesión:", sessionError);
        return;
      }

      if (!session || !session.user) {
        console.warn("No hay sesión activa.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, rol, grupo")
        .eq("uuid", session.user.id)
        .single();

      if (profileError) {
        console.error("Error al obtener perfil:", profileError);
        return;
      }

      setUser({
        ...profile,
        email: session.user.email,
      });
    } catch (err) {
      console.error("Error inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  getUser();
}, []);



  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-primary mb-4">Mi Perfil</h2>
      <Card className="p-4">
        <CardContent className="flex flex-col items-center gap-4">
          {loading ? (
            <Skeleton className="w-24 h-24 rounded-full" />
          ) : user?.full_name ? (
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`}
              alt="avatar"
              className="w-24 h-24 rounded-full border"
            />
          ) : null}

          <div className="text-center space-y-1">
            <p className="text-lg font-semibold">
              {loading ? <Skeleton className="w-40 h-4" /> : user?.full_name ?? "Sin nombre"}
            </p>
            <p className="text-sm text-muted-foreground">
              {loading ? <Skeleton className="w-48 h-4" /> : user?.email ?? "Sin correo"}
            </p>
            <p className="text-sm">
              {loading ? <Skeleton className="w-20 h-4" /> : `Rol: ${user?.rol ?? "Desconocido"}`}
            </p>
            {user?.grupo && (
              <p className="text-sm text-muted-foreground">
                {`Grupo Solidario: ${user.grupo}`}
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline">
              <Pencil className="w-4 h-4 mr-2" /> Editar datos
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MiPerfil;
