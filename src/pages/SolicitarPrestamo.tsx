import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { AlertCircle, Calendar, DollarSign, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";

const SolicitarPrestamo = () => {
  const { toast } = useToast();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    term: "",
    description: "",
    category: ""
  });

  const [errors, setErrors] = useState({
    amount: "",
    purpose: "",
    term: "",
    category: ""
  });

  const categories = [
    "Negocio/Inventario",
    "Educación",
    "Salud",
    "Vivienda",
    "Transporte",
    "Agricultura",
    "Emergencia",
    "Otro"
  ];

  const terms = [
    { value: "1", label: "1 mes" },
    { value: "3", label: "3 meses" },
    { value: "6", label: "6 meses" },
    { value: "12", label: "12 meses" }
  ];

  const validate = () => {
    const newErrors: any = {};
    if (!formData.amount) newErrors.amount = "Este campo es obligatorio";
    else if (parseFloat(formData.amount) < 50 || parseFloat(formData.amount) > 5000)
      newErrors.amount = "El monto debe estar entre $50 y $5000";

    if (!formData.category) newErrors.category = "Selecciona una categoría";

    if (!formData.purpose) newErrors.purpose = "Este campo es obligatorio";

    if (!formData.term) newErrors.term = "Selecciona un plazo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const confirmed = window.confirm("¿Estás seguro de enviar esta solicitud de préstamo?");
    if (!confirmed) return;

    if (!user || !user.profile?.group_id) {
      toast({
        title: "Error de autenticación o grupo",
        description: "Debes iniciar sesión y tener un grupo asignado para enviar una solicitud.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.from("solicitudes").insert({
      user_id: user.id,
      group_id: user.profile.group_id, // ✅ Se añade aquí
      amount: parseFloat(formData.amount),
      purpose: formData.purpose,
      term: parseInt(formData.term),
      category: formData.category,
      description: formData.description,
      status: "pendiente",
      created_at: new Date().toISOString()
    });

    if (error) {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de préstamo ha sido registrada exitosamente."
      });

      setFormData({
        amount: "",
        purpose: "",
        term: "",
        description: "",
        category: ""
      });
      setErrors({
        amount: "",
        purpose: "",
        term: "",
        category: ""
      });
    }
  };

  const calculateMonthlyPayment = () => {
    if (!formData.amount || !formData.term) return 0;
    const amount = parseFloat(formData.amount);
    const months = parseInt(formData.term);
    return (amount / months).toFixed(2);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Solicitar Préstamo</h1>
        {user?.profile?.group_id && (
          <p className="text-sm text-muted-foreground mt-1">
            Grupo solidario asignado: <strong>{user.profile.group_id}</strong>
          </p>
        )}
        <p className="text-muted-foreground">
          Completa el formulario para solicitar un préstamo al grupo solidario
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Información del Préstamo
          </CardTitle>
          <CardDescription>
            Proporciona los detalles de tu solicitud de préstamo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Monto */}
            <div className="space-y-1">
              <Label htmlFor="amount">Monto solicitado *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  className="pl-8"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
              <p className="text-xs text-muted-foreground">Rango: $50 - $5,000</p>
            </div>

            {/* Categoría */}
            <div className="space-y-1">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Propósito */}
            <div className="space-y-1">
              <Label htmlFor="purpose">Propósito del préstamo *</Label>
              <Input
                id="purpose"
                placeholder="Ej: Compra de inventario para mi negocio"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
              />
              {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
              <p className="text-xs text-muted-foreground">
                {formData.purpose.length}/100 caracteres
              </p>
            </div>

            {/* Plazo */}
            <div className="space-y-1">
              <Label htmlFor="term">Plazo de pago *</Label>
              <Select
                value={formData.term}
                onValueChange={(value) =>
                  setFormData({ ...formData, term: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el plazo" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.term && <p className="text-sm text-red-500">{errors.term}</p>}
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <Label htmlFor="description">Descripción detallada (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Proporciona más detalles sobre cómo utilizarás el préstamo..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 caracteres
              </p>
            </div>

            {/* Resumen de Pagos */}
            {formData.amount && formData.term && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Resumen de Pagos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monto total:</span>
                    <span className="font-medium">${formData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plazo:</span>
                    <span className="font-medium">
                      {formData.term} {parseInt(formData.term) === 1 ? "mes" : "meses"}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Pago mensual:</span>
                    <span>${calculateMonthlyPayment()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-900">Proceso de Aprobación</p>
                    <p className="text-sm text-blue-700">
                      Tu solicitud será revisada por el grupo solidario. Se necesitan al menos
                      6 votos positivos de 10 miembros para su aprobación. El proceso toma
                      entre 3-5 días hábiles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enviar */}
            <Button type="submit" className="w-full" size="lg">
              <FileText className="mr-2 h-4 w-4" />
              Enviar Solicitud
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolicitarPrestamo;
