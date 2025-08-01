import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Home,
  DollarSign,
  FileText,
  Calendar,
  Users,
  BarChart3,
  User,
  Menu,
  X
} from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        const name = data.user.user_metadata?.full_name || data.user.email || "Usuario";
        setFullName(name);
      }
    };
    fetchUser();
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Solicitar Préstamo", href: "/solicitar", icon: DollarSign },
    { name: "Mis Solicitudes", href: "/solicitudes", icon: FileText },
    { name: "Calendario de Pagos", href: "/calendario", icon: Calendar },
    { name: "Grupo Solidario", href: "/grupo", icon: Users },
    { name: "Reportes", href: "/reportes", icon: BarChart3 },
    { name: "Mi Perfil", href: "/perfil", icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-primary">COOPERATIVA</h1>
            <p className="text-sm text-muted-foreground">Microcrédito Solidario</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar>
                <AvatarFallback>
                  {fullName?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fullName ?? "Cargando..."}</p>
                <p className="text-xs text-muted-foreground truncate">Prestatario</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 mt-2"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login");
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
