import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CheckCircle, XCircle } from "lucide-react";

interface Prestamo {
  id: number;
  amount: number;
  purpose: string;
  term: number;
  status: string;
  created_at: string;
  votes_positive?: number;
  votes_total?: number;
}

const MisSolicitudes = () => {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  useEffect(() => {
    const fetchPrestamos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("prestamos")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener préstamos:", error.message);
      } else {
        setPrestamos(data || []);
      }
    };

    fetchPrestamos();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "voting":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "voting":
        return "En votación";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Mis Solicitudes</h1>

      {prestamos.length === 0 ? (
        <p className="text-muted-foreground">Aún no tienes solicitudes registradas.</p>
      ) : (
        prestamos.map((sol) => (
          <Card key={sol.id}>
            <CardHeader>
              <CardTitle>
                Monto: ${sol.amount} | Plazo: {sol.term} mes{sol.term > 1 ? "es" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Motivo:</strong> {sol.purpose}</p>
              <p><strong>Fecha:</strong> {new Date(sol.created_at).toLocaleDateString()}</p>

              <div className="flex items-center gap-2">
                {getStatusIcon(sol.status)}
                <Badge variant={getStatusColor(sol.status)}>
                  {getStatusText(sol.status)}
                </Badge>
              </div>

              {(sol.status === "voting" || sol.status === "approved" || sol.status === "rejected") && (
                <p className={`text-sm ${getVoteColor(sol.status)}`}>
                  Votos positivos: {sol.votes_positive ?? 0} / {sol.votes_total ?? 0}
                </p>
              )}

              {sol.status === "rejected" && (
                <p className="text-sm text-red-600">
                  Tu solicitud fue rechazada. Puedes enviar una nueva.
                </p>
              )}

              {sol.status === "approved" && (
                <p className="text-sm text-green-600">
                  ¡Felicidades! Tu préstamo fue aprobado. En breve aparecerá el calendario de pagos.
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="w-4 h-4 text-green-600 mr-1" />;
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-500 mr-1" />;
    case "voting":
      return <Users className="w-4 h-4 text-blue-600 mr-1" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-red-600 mr-1" />;
    default:
      return null;
  }
};

const getVoteColor = (status: string) => {
  switch (status) {
    case "approved":
      return "text-green-600";
    case "rejected":
      return "text-red-600";
    case "voting":
      return "text-blue-600";
    default:
      return "text-muted-foreground";
  }
};

export default MisSolicitudes;
