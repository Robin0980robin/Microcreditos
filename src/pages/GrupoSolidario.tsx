import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useUser } from "@/hooks/useUser";

type Solicitud = {
  id: number;
  amount: number;
  category: string;
  purpose: string;
  description?: string;
  status: string;
  votes_positive: number;
  votes_total: number;
  user_id: string;
};

type Miembro = {
  id: string;
  full_name: string;
  role: string;
};

const statusOptions = [
  { label: "Pendientes", value: "pending" },
  { label: "En votación", value: "voting" },
  { label: "Aprobadas", value: "approved" },
  { label: "Rechazadas", value: "rejected" },
  { label: "Todas", value: "all" },
];

const GrupoSolidario = () => {
  const { toast } = useToast();
  const { user } = useUser(); // Obtener usuario logueado

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [loadingMiembros, setLoadingMiembros] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");

  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchSolicitudes(filterStatus);
    fetchMiembros();
  }, [filterStatus]);

  const fetchSolicitudes = async (status: string) => {
    setLoadingSolicitudes(true);

    if (!user?.profile?.group_id) {
      toast({
        title: "Error",
        description: "No tienes un grupo asignado",
        variant: "destructive",
      });
      setLoadingSolicitudes(false);
      return;
    }

    let query = supabase
      .from("prestamos")
      .select("*")
      .eq("group_id", user.profile.group_id)
      .order("id", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
        variant: "destructive",
      });
    } else {
      setSolicitudes(data as Solicitud[]);
    }
    setLoadingSolicitudes(false);
  };

  const fetchMiembros = async () => {
    setLoadingMiembros(true);
    const { data, error } = await supabase.from("profiles").select("id, full_name, role").order("full_name");
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los miembros",
        variant: "destructive",
      });
    } else {
      setMiembros(data as Miembro[]);
    }
    setLoadingMiembros(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "voting": return "outline";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved": return "Aprobado";
      case "pending": return "Pendiente";
      case "voting": return "En votación";
      case "rejected": return "Rechazado";
      default: return status;
    }
  };

  // Abrir modal con detalles
  const openDetails = (sol: Solicitud) => {
    setSelectedSolicitud(sol);
    setModalOpen(true);
  };

  // Función para votar
  const votar = async (vote: boolean) => {
    if (!selectedSolicitud || !user) {
      toast({ title: "Error", description: "Usuario o solicitud no disponible", variant: "destructive" });
      return;
    }

    if (selectedSolicitud.user_id === user.id) {
      toast({
        title: "No permitido",
        description: "No puedes votar en tu propia solicitud",
        variant: "destructive",
      });
      return;
    }

    // Primero verificar si ya votó
    const { data: existingVote, error: voteError } = await supabase
      .from("votos")
      .select("*")
      .eq("prestamo_id", selectedSolicitud.id)
      .eq("user_id", user.id)
      .single();

    if (voteError && voteError.code !== "PGRST116") { // PGRST116 = no encontrado, ok para nosotros
      toast({ title: "Error", description: "Error al verificar voto previo", variant: "destructive" });
      return;
    }

    if (existingVote) {
      toast({ title: "Aviso", description: "Ya has votado esta solicitud", variant: "default" });
      return;
    }

    // Insertar voto
    const { error: insertError } = await supabase.from("votos").insert({
      prestamo_id: selectedSolicitud.id,
      user_id: user.id,
      vote,
    });

    if (insertError) {
      toast({ title: "Error", description: "No se pudo registrar el voto", variant: "destructive" });
      return;
    }

    // Actualizar votos en prestamos
    const newVotesPositive = vote ? selectedSolicitud.votes_positive + 1 : selectedSolicitud.votes_positive;
    const newVotesTotal = selectedSolicitud.votes_total + 1;

    // Si se alcanzan 6 votos positivos de 10 (o 6/10), actualizar status
    let newStatus = selectedSolicitud.status;
    if (newVotesTotal >= 10) {
      if (newVotesPositive >= 6) newStatus = "approved";
      else newStatus = "rejected";
    } else {
      newStatus = "voting";
    }

    const { error: updateError } = await supabase
      .from("prestamos")
      .update({
        votes_positive: newVotesPositive,
        votes_total: newVotesTotal,
        status: newStatus,
      })
      .eq("id", selectedSolicitud.id);

    if (updateError) {
      toast({ title: "Error", description: "No se pudo actualizar la solicitud", variant: "destructive" });
      return;
    }

    toast({ title: "Voto registrado", description: `Has votado ${vote ? "positivo" : "negativo"}` });

    // Refrescar lista y cerrar modal
    setModalOpen(false);
    fetchSolicitudes(filterStatus);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Grupo Solidario</h1>

      {/* Filtro de estado */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {statusOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={filterStatus === opt.value ? "default" : "outline"}
            onClick={() => setFilterStatus(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes</CardTitle>
          <CardDescription>Revisa las solicitudes de préstamo según el filtro seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSolicitudes ? (
            <p>Cargando solicitudes...</p>
          ) : solicitudes.length === 0 ? (
            <p>No hay solicitudes para mostrar.</p>
          ) : (
            solicitudes.map((sol) => (
              <div key={sol.id} className="flex justify-between items-center p-4 border-b last:border-none cursor-pointer hover:bg-muted"
                onClick={() => openDetails(sol)}
              >
                <div>
                  <p className="font-semibold">${sol.amount} - {sol.purpose}</p>
                  <p className="text-sm text-muted-foreground">
                    Categoría: {sol.category} | Votos: {sol.votes_positive}/{sol.votes_total}
                  </p>
                </div>
                <Badge variant={getStatusColor(sol.status)}>{getStatusText(sol.status)}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Miembros */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros del Grupo</CardTitle>
          <CardDescription>Lista de integrantes del grupo solidario</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMiembros ? (
            <p>Cargando miembros...</p>
          ) : miembros.length === 0 ? (
            <p>No hay miembros registrados.</p>
          ) : (
            miembros.map((miembro) => (
              <div key={miembro.id} className="flex justify-between items-center border-b p-3 last:border-none">
                <p>{miembro.full_name}</p>
                <Badge variant="outline">{miembro.role}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal detalles y votación */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud</DialogTitle>
            <DialogDescription>
              {selectedSolicitud ? (
                <>
                  <p><strong>Monto:</strong> ${selectedSolicitud.amount}</p>
                  <p><strong>Categoría:</strong> {selectedSolicitud.category}</p>
                  <p><strong>Propósito:</strong> {selectedSolicitud.purpose}</p>
                  {selectedSolicitud.description && (
                    <p><strong>Descripción:</strong> {selectedSolicitud.description}</p>
                  )}
                  <p><strong>Estado:</strong> {getStatusText(selectedSolicitud.status)}</p>
                  <p><strong>Votos positivos:</strong> {selectedSolicitud.votes_positive}</p>
                  <p><strong>Votos totales:</strong> {selectedSolicitud.votes_total}</p>
                </>
              ) : "Cargando..."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-4">
            <Button variant="destructive" onClick={() => votar(false)}>
              Votar Negativo
            </Button>
            <Button variant="default" onClick={() => votar(true)}>
              Votar Positivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GrupoSolidario;
