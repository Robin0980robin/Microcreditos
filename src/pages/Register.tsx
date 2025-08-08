import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Home, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });

  const validateForm = () => {
    const { email, password, confirmPassword, full_name } = formData;
    const newErrors = { email: "", password: "", confirmPassword: "", full_name: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Este campo es obligatorio.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Debe ingresar un correo válido.";
    }

    if (!password) {
      newErrors.password = "Este campo es obligatorio.";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres, 1 mayúscula y 1 símobolo.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Debe confirmar la contraseña.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (!full_name.trim()) {
      newErrors.full_name = "Este campo es obligatorio.";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { email, password, full_name } = formData;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });

    if (signUpError || !signUpData.user) {
      const message = signUpError?.message || "";
      if (message.includes("already registered")) {
        setErrors((prev) => ({ ...prev, email: "Este correo ya está registrado." }));
      } else if (message.toLowerCase().includes("password")) {
        setErrors((prev) => ({ ...prev, password: "La contraseña no cumple los requisitos." }));
      } else {
        toast({
          title: "Registro fallido",
          description: message || "Error desconocido",
          variant: "destructive",
        });
      }
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: signUpData.user.id,
        full_name,
        role: "prestatario",
      },
    ]);

    if (profileError) {
      toast({
        title: "Error al guardar perfil",
        description: profileError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Registro exitoso",
      description: "Ahora puedes iniciar sesión.",
    });
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/img/fondo-inicio.jpg')" }}
    >
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/70 backdrop-blur-lg shadow-lg space-y-6">
        <Link to="/" className="absolute top-4 left-4">
          <Button variant="ghost" size="icon" className="hover:bg-green-100" title="Volver al inicio">
            <Home className="w-5 h-5 text-gray-700" />
          </Button>
        </Link>

        <div className="flex justify-center mb-2">
          <img src="/img/icon-text.png" alt="Logo" className="h-12" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800">Crear cuenta</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ingrese su correo"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Cree una contraseña segura"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repita la contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              placeholder="Ingrese su nombre completo"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            Registrarse
          </Button>
        </form>

        <p className="text-sm text-center text-gray-700">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;