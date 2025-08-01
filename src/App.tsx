import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import SolicitarPrestamo from "./pages/SolicitarPrestamo";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MisSolicitudes from "./pages/MisSolicitudes";
import CalendarioPagos from "./pages/CalendarioPagos";
import GrupoSolidario from "./pages/GrupoSolidario";
import Reportes from "@/pages/Reportes";
import Perfil from "@/pages/Perfil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/solicitar" element={
            <Layout>
              <SolicitarPrestamo />
            </Layout>
          } />
          <Route path="/registro" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/solicitudes" element={
            <Layout>
              <MisSolicitudes />
            </Layout>
          } />
          <Route path="/calendario" element={
            <Layout>
              <CalendarioPagos />
            </Layout>
          } />
          <Route path="/grupo" element={
            <Layout>
              <GrupoSolidario />
            </Layout>
          } />
          <Route path="/reportes" element={
            <Layout>
              <Reportes />
            </Layout>
          } />
          <Route path="/perfil" element={
            <Layout>
              <Perfil />
            </Layout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;