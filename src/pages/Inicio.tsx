import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, HandCoins, ShieldCheck } from "lucide-react";

const Inicio = () => (
  <div
    className="relative min-h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/img/fondo-inicio.jpg')" }}
  >
    {/* Header */}
    <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-white/70 backdrop-blur-md shadow-md z-10">
      {/* Logo e Identidad */}
      <div className="flex items-center gap-3">
        <img src="/img/icon-text.png" alt="Logo" className="h-12 w-auto" />
      </div>

      {/* Botones de sesión */}
      <div className="space-x-4">
        <Link to="/login">
          <Button
            variant="outline"
            className="hover:bg-gray-200 hover:text-black transition-colors duration-200"
          >
            Iniciar sesión
          </Button>
        </Link>
        <Link to="/registro">
          <Button className="bg-green-600 hover:bg-green-700 transition-colors duration-200">
            Registrarse
          </Button>
        </Link>
      </div>
    </header>

    {/* Hero del centro */}
    <main className="flex flex-col justify-center items-center text-center text-white h-screen bg-black/50 px-4">
      <h1 className="text-5xl font-bold mb-4">Microcréditos Solidarios</h1>
      <p className="text-xl max-w-2xl mb-8">
        Plataforma para solicitar préstamos, apoyar a tu comunidad y crecer juntos como grupo.
      </p>
      <Link to="/registro">
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          Únete ahora
        </Button>
      </Link>
    </main>

    {/* Sección de beneficios */}
    <section className="bg-white py-16 px-6 text-gray-800">
      <h2 className="text-3xl font-semibold mb-12 text-center">
        ¿Qué ofrece nuestra plataforma?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Tarjeta 1 */}
        <div className="flex flex-col items-center text-center bg-white rounded-2xl shadow-md border p-6 transition hover:shadow-lg">
          <HandCoins className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-xl font-medium">Préstamos accesibles</h3>
          <p className="mt-2 text-muted-foreground">Hasta $5 000 en pocos pasos.</p>
        </div>

        {/* Tarjeta 2 */}
        <div className="flex flex-col items-center text-center bg-white rounded-2xl shadow-md border p-6 transition hover:shadow-lg">
          <Users className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-xl font-medium">Participa en votaciones</h3>
          <p className="mt-2 text-muted-foreground">
            Aprueba o rechaza solicitudes del grupo.
          </p>
        </div>

        {/* Tarjeta 3 */}
        <div className="flex flex-col items-center text-center bg-white rounded-2xl shadow-md border p-6 transition hover:shadow-lg">
          <ShieldCheck className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-xl font-medium">Seguridad y transparencia</h3>
          <p className="mt-2 text-muted-foreground">
            Control total sobre pagos y calificaciones.
          </p>
        </div>
      </div>
    </section>
  </div>
);

export default Inicio;
