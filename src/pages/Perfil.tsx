import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { LogOut, Pencil, Save, X, Lock } from "lucide-react";
import { toast } from "sonner";

const MiPerfil = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    grupo: "",
  });

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user?.id) {
          console.warn("No hay sesión activa o usuario no definido");
          setLoading(false);
          return;
        }

        const userId = session.user.id;
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("uid, full_name, rol, grupo")
          .eq("uuid", userId)
          .single();

        if (profileError || !profile) {
          console.warn("No se encontró perfil real. Usando datos simulados.");

          const perfilSimulado = {
            uid: userId,
            full_name: "Robinson Moreira",
            email: session.user.email || "robinson@gmail.com",
            rol: "Prestatario",
            grupo: "Grupo Esperanza",
          };

          setUser(perfilSimulado);
          setForm({
            full_name: perfilSimulado.full_name,
            grupo: perfilSimulado.grupo,
          });
          setLoading(false);
          return;
        }

        const perfilCompleto = {
          ...profile,
          email: session.user.email,
        };

        setUser(perfilCompleto);
        setForm({
          full_name: perfilCompleto.full_name || "",
          grupo: perfilCompleto.grupo || "",
        });
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Si prefieres forzar siempre modo simulado:
    /*
    const perfilSimulado = {
      uid: "demo-uuid-123",
      full_name: "Robinson Moreira",
      email: "maria@demo.com",
      rol: "usuario",
      grupo: "Grupo Esperanza",
    };

    setUser(perfilSimulado);
    setForm({
      full_name: perfilSimulado.full_name,
      grupo: perfilSimulado.grupo,
    });
    setLoading(false);
    */
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setForm({ full_name: user?.full_name || "", grupo: user?.grupo || "" });
    setEditing(false);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        grupo: form.grupo.trim(),
      })
      .eq("uuid", user.uid);

    if (error) {
      toast.error("Error al actualizar perfil");
    } else {
      toast.success("Perfil actualizado");
      setUser((prev: any) => ({ ...prev, ...form }));
      setEditing(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword.length < 6) {
      return toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Las contraseñas no coinciden.");
    }

    // Si quieres que funcione normalmente con Supabase, usa este bloque:
    const { error } = await supabase.auth.updateUser({
      password: passwords.newPassword,
    });

    if (error) {
      toast.error("Error al cambiar la contraseña.");
    } else {
      toast.success("Contraseña actualizada con éxito.");
      setPasswords({ newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    }

    // Si prefieres simular el cambio de contraseña sin hacer nada real:
    /*
    toast.success("Contraseña actualizada con éxito (simulada).");
    setPasswords({ newPassword: "", confirmPassword: "" });
    setShowPasswordForm(false);
    */
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-primary">Mi Perfil</h2>

      <Card className="p-6">
        <CardContent className="flex flex-col items-center gap-4">
          {loading ? (
            <Skeleton className="w-24 h-24 rounded-full" />
          ) : user?.full_name ? (
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`}
              alt="avatar"
              className="w-24 h-24 rounded-full border shadow"
            />
          ) : null}

          <div className="text-center space-y-2 w-full">
            {loading ? (
              <>
                <Skeleton className="w-40 h-4" />
                <Skeleton className="w-48 h-4" />
              </>
            ) : editing ? (
              <>
                <Input
                  placeholder="Nombre completo"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                />
                <Input
                  placeholder="Grupo solidario"
                  value={form.grupo}
                  onChange={(e) => setForm((f) => ({ ...f, grupo: e.target.value }))}
                />
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">{user?.full_name ?? "Sin nombre"}</p>
                <p className="text-sm text-muted-foreground">{user?.email ?? "Sin correo"}</p>
                <p className="text-sm">Rol: {user?.rol ?? "Desconocido"}</p>
                <p className="text-sm text-muted-foreground">Grupo Solidario: {user?.grupo ?? "Sin grupo"}</p>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-4 w-full">
            {editing ? (
              <>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" /> Guardar
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleEdit}>
                <Pencil className="w-4 h-4 mr-2" /> Editar datos
              </Button>
            )}

            <Button variant="secondary" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              <Lock className="w-4 h-4 mr-2" /> Cambiar contraseña
            </Button>

            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
            </Button>
          </div>

          {showPasswordForm && (
            <div className="mt-6 w-full space-y-3 border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground text-center">Cambiar contraseña</h3>
              <Input
                type="password"
                placeholder="Nueva contraseña"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Confirmar contraseña"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange} className="flex-1">
                  Guardar nueva contraseña
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswords({ newPassword: "", confirmPassword: "" });
                    setShowPasswordForm(false);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MiPerfil;
