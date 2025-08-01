import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password, full_name, role } = formData;

    if (!email || !password || !full_name || !role) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    // Registrar usuario en auth con nombre completo en user_metadata
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (signUpError || !signUpData.user) {
      toast({ title: "Registro fallido", description: signUpError?.message || "Error desconocido", variant: "destructive" });
      return;
    }

    // Insertar perfil en la tabla "profiles"
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: signUpData.user.id,
        full_name,
        role,
      },
    ]);

    if (profileError) {
      toast({ title: "Error al guardar perfil", description: profileError.message, variant: "destructive" });
      return;
    }

    toast({ title: "Registro exitoso", description: "Ahora puedes iniciar sesión." });
    navigate("/"); // Redirige al dashboard o login
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg bg-white space-y-6">
      <h1 className="text-2xl font-bold text-center">Crear Cuenta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="full_name">Nombre completo</Label>
          <Input id="full_name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
        </div>

        <div className="space-y-1">
          <Label>Rol</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prestamista">Prestamista</SelectItem>
              <SelectItem value="prestatario">Prestatario</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">Registrarse</Button>
      </form>
    </div>
  );
};

export default Register;
