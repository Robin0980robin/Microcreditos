import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, Clock, CheckCircle, TrendingUp, Users, FileText
} from "lucide-react";

type Solicitud = {
  id: number;
  monto: number;
  motivo: string;
  estado: string;
  fecha_limite: string;
  votos_positivos: number;
  votos_totales: number;
};

type Pago = {
  id: number;
  prestamo_id: number;
  monto: number;
  fecha_pago: string;
  estado: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: solicitudesData } = await supabase
        .from("solicitudes")
        .select("*")
        .order("fecha_limite", { ascending: true })
        .limit(5);

      const { data: pagosData } = await supabase
        .from("pagos")
        .select("*")
        .eq("usuario_id", user.id)
        .order("fecha_pago", { ascending: true })
        .limit(5);

      setSolicitudes(solicitudesData || []);
      setPagos(pagosData || []);
    };

    fetchData();
  }, [user]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "aprobado": return "default";
      case "pendiente": return "secondary";
      case "votacion": return "outline";
      default: return "secondary";
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case "aprobado": return "Aprobado";
      case "pendiente": return "Pendiente";
      case "votacion": return "En votación";
      default: return estado;
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido a tu cooperativa de microcrédito</p>
        </div>
        <Button onClick={() => navigate("/solicitar")}>
          <DollarSign className="mr-2 h-4 w-4" />
          Solicitar Préstamo
        </Button>
      </div>

      {/* Stats (pueden ajustarse con datos calculados en el futuro) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Estimado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,200</div>
            <p className="text-xs text-muted-foreground">Para nuevos préstamos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solicitudes.filter(s => s.estado === "aprobado").length}</div>
            <p className="text-xs text-muted-foreground">En proceso de pago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagos.filter(p => p.estado === "pagado").length}
            </div>
            <p className="text-xs text-muted-foreground">Tasa de cumplimiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivel de Confianza</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">★★★★☆</div>
            <p className="text-xs text-muted-foreground">Estimación basada en comportamiento</p>
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes Recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Solicitudes Recientes del Grupo
          </CardTitle>
          <CardDescription>Últimas solicitudes de préstamo para revisar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {solicitudes.map((loan) => (
            <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">${loan.monto}</p>
                <p className="text-sm text-muted-foreground">{loan.motivo}</p>
                <p className="text-xs text-muted-foreground">
                  Votos: {loan.votos_positivos}/{loan.votos_totales}
                </p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant={getStatusColor(loan.estado)}>
                  {getStatusText(loan.estado)}
                </Badge>
                <p className="text-xs text-muted-foreground">{loan.fecha_limite}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Próximos Pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Próximos Pagos
          </CardTitle>
          <CardDescription>Fechas importantes que no debes olvidar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pagos.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Préstamo #{p.prestamo_id}</p>
                <p className="text-sm text-muted-foreground">${p.monto.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline">Próximo</Badge>
                <p className="text-xs text-muted-foreground">{p.fecha_pago}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => navigate("/calendario")}>
            Ver Calendario Completo
          </Button>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Actividad del Grupo Solidario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => navigate("/grupo")}>
              Ver Solicitudes Pendientes
            </Button>
            <Button variant="outline" onClick={() => navigate("/reportes")}>
              Revisar Reportes
            </Button>
            <Button variant="outline" onClick={() => navigate("/perfil")}>
              Actualizar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
