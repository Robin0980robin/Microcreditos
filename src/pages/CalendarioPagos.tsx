import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Pago {
  id: string;
  monto: number;
  fecha_pago: string;
  estado: string;
  prestamo_id: string;
}

const CalendarioPagos = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);

  useEffect(() => {
    const fetchPagos = async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("pagos")
        .select("*")
        .eq("user_id", user.user?.id)
        .order("fecha_pago", { ascending: true });

      if (error) {
        console.error("Error al obtener pagos:", error.message);
      } else {
        setPagos(data || []);
      }
    };

    fetchPagos();
  }, []);

  const estadoColor = (estado: string) => {
    switch (estado) {
      case "pagado":
        return "default";
      case "pendiente":
        return "secondary";
      case "atrasado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const estadoTexto = (estado: string) => {
    switch (estado) {
      case "pagado":
        return "Pagado";
      case "pendiente":
        return "Pendiente";
      case "atrasado":
        return "Atrasado";
      default:
        return estado;
    }
  };

  const estadoIcono = (estado: string) => {
    switch (estado) {
      case "pagado":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pendiente":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "atrasado":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const calcularDiasRestantes = (fecha: string) => {
    const hoy = new Date();
    const fechaPago = new Date(fecha);
    const diff = Math.ceil((fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Calendario de Pagos</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Pagos
          </CardTitle>
          <CardDescription>Revisa las fechas de tus próximos pagos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pagos.length === 0 ? (
            <p className="text-muted-foreground">No tienes pagos registrados.</p>
          ) : (
            pagos.map((pago) => {
              const dias = calcularDiasRestantes(pago.fecha_pago);
              const mensajeTiempo =
                dias > 0
                  ? `En ${dias} día${dias > 1 ? "s" : ""}`
                  : pago.estado === "pagado"
                  ? "Pago realizado"
                  : `Atrasado hace ${Math.abs(dias)} día${Math.abs(dias) > 1 ? "s" : ""}`;

              return (
                <div
                  key={pago.id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">Préstamo: {pago.prestamo_id}</p>
                    <p className="text-sm text-muted-foreground">
                      Monto: ${pago.monto.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fecha: {new Date(pago.fecha_pago).toLocaleDateString()}
                    </p>
                    <p className="text-xs flex items-center gap-1 mt-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {mensajeTiempo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {estadoIcono(pago.estado)}
                    <Badge variant={estadoColor(pago.estado)}>
                      {estadoTexto(pago.estado)}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarioPagos;
