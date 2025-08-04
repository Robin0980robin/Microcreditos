import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Home, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const { email, password } = formData;
    const newErrors = { email: "", password: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Este campo es obligatorio.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Debe ingresar un correo válido.";
    }

    if (!password) {
      newErrors.password = "Este campo es obligatorio.";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const { email, password } = formData;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        setErrors({
          email: "Correo o contraseña incorrectos.",
          password: "Correo o contraseña incorrectos.",
        });
      } else {
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Sesión iniciada",
        description: "Bienvenido de nuevo",
      });
      navigate("/");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/img/fondo-inicio.jpg')" }}
    >
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/70 backdrop-blur-lg shadow-lg space-y-6">
        {/* Botón de regreso */}
        <Link to="/" className="absolute top-4 left-4">
          <Button variant="ghost" size="icon" className="hover:bg-green-100" title="Volver al inicio">
            <Home className="w-5 h-5 text-gray-700" />
          </Button>
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img src="/img/icon-text.png" alt="Logo" className="h-12" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ingrese su correo"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingrese su contraseña"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            Iniciar Sesión
          </Button>
        </form>

        <p className="text-sm text-center text-gray-700">
          ¿No tienes una cuenta?{" "}
          <Link to="/registro" className="text-green-600 hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
