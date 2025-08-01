import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Solicitud {
  id: string;
  amount: number;
  purpose: string;
  term: string;
  status: string;
  created_at: string;
}

const MisSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      const {
        data,
        error,
      } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener solicitudes:", error.message);
      } else {
        setSolicitudes(data || []);
      }
    };

    fetchSolicitudes();
  }, []);

  const getColor = (status: string) => {
    switch (status) {
      case "aprobado":
        return "default";
      case "pendiente":
        return "secondary";
      case "rechazado":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Mis Solicitudes</h1>

      {solicitudes.length === 0 ? (
        <p className="text-muted-foreground">Aún no tienes solicitudes registradas.</p>
      ) : (
        solicitudes.map((sol) => (
          <Card key={sol.id}>
            <CardHeader>
              <CardTitle>
                Monto: ${sol.amount} | Plazo: {sol.term} mes(es)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Motivo:</strong> {sol.purpose}</p>
              <p><strong>Fecha:</strong> {new Date(sol.created_at).toLocaleDateString()}</p>
              <Badge variant={getColor(sol.status)}>{sol.status}</Badge>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default MisSolicitudes;
