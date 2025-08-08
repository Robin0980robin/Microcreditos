import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";

const USE_SIMULATED_DATA = true; // Cambiar a false cuando conectes Supabase

interface Miembro {
  id: number;
  nombre: string;
  rol: string;
}

interface Solicitud {
  id: number;
  nombre: string;
  amount: number;
  purpose: string;
  status: string;
  votes_positive: number;
  votes_negative: number;
}

const GrupoSolidario = () => {
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    if (USE_SIMULATED_DATA) {
      // Simulación de miembros
      setMiembros([
        { id: 1, nombre: "Robinson Moreira", rol: "Líder" },
        { id: 2, nombre: "Cinthia Zambrano", rol: "Tesorera" },
        { id: 3, nombre: "Anderson Santiana", rol: "Miembro" },
        { id: 3, nombre: "Ruddy Pico", rol: "Miembro" },
      ]);

      // Simulación de solicitudes
      setSolicitudes([
        {
          id: 1,
          nombre: "Anderson Santiana",
          amount: 300,
          purpose: "Compra de materiales",
          status: "voting",
          votes_positive: 2,
          votes_negative: 1,
        },
        {
          id: 2,
          nombre: "Cinthia Zambrano",
          amount: 150,
          purpose: "Reparación de máquina",
          status: "voting",
          votes_positive: 1,
          votes_negative: 2,
        },
      ]);
    }
  }, []);

  const handleVote = (id: number, type: "positive" | "negative") => {
    if (USE_SIMULATED_DATA) {
      setSolicitudes((prev) =>
        prev.map((sol) =>
          sol.id === id
            ? {
                ...sol,
                votes_positive:
                  type === "positive" ? sol.votes_positive + 1 : sol.votes_positive,
                votes_negative:
                  type === "negative" ? sol.votes_negative + 1 : sol.votes_negative,
              }
            : sol
        )
      );

      alert(
        type === "positive"
          ? "Voto positivo registrado"
          : "Voto negativo registrado"
      );
      return;
    }

    // --- Aquí iría la lógica real con Supabase ---
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Grupo Solidario</h1>

      {USE_SIMULATED_DATA && (
        <p className="text-sm text-muted-foreground italic">
        </p>
      )}

      {/* === Miembros del grupo === */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros del grupo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {miembros.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{m.nombre.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{m.nombre}</p>
                <p className="text-sm text-muted-foreground">{m.rol}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* === Solicitudes de préstamo === */}
      {solicitudes.length === 0 ? (
        <p className="text-muted-foreground">No hay solicitudes en este momento.</p>
      ) : (
        solicitudes.map((sol) => (
          <Card key={sol.id}>
            <CardHeader>
              <CardTitle>
                {sol.nombre} — ${sol.amount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Motivo:</strong> {sol.purpose}</p>
              <div className="flex gap-4 mt-3 items-center">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleVote(sol.id, "positive")}
                >
                  <Check className="w-4 h-4 mr-1" /> Positivo ({sol.votes_positive})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleVote(sol.id, "negative")}
                >
                  <X className="w-4 h-4 mr-1" /> Negativo ({sol.votes_negative})
                </Button>
                <Badge variant="outline">{sol.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default GrupoSolidario;
