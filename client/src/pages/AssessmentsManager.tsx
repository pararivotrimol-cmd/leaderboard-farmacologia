import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Clock,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AssessmentsManager() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "multiple_choice" as const,
    timePerQuestion: 120,
    allowRetrocess: false,
    enableLockdown: true,
    passingScore: 60,
    maxAttempts: 1,
    startsAt: "",
    endsAt: "",
  });

  // Fetch assessments for selected class
  const { data: assessments = [], isLoading } = trpc.assessments.getAssessmentsByClass.useQuery(
    { classId: selectedClass ? parseInt(selectedClass) : 0 },
    { enabled: !!selectedClass }
  );

  // Mutations
  const createMutation = trpc.assessments.create.useMutation({
    onSuccess: () => {
      toast.success("Atividade criada com sucesso!");
      setFormData({
        title: "",
        description: "",
        type: "multiple_choice",
        timePerQuestion: 120,
        allowRetrocess: false,
        enableLockdown: true,
        passingScore: 60,
        maxAttempts: 1,
        startsAt: "",
        endsAt: "",
      });
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const publishMutation = trpc.assessments.publish.useMutation({
    onSuccess: () => {
      toast.success("Atividade publicada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.assessments.delete.useMutation({
    onSuccess: () => {
      toast.success("Atividade deletada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleCreateAssessment = async () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (!selectedClass) {
      toast.error("Selecione uma turma");
      return;
    }

    createMutation.mutate({
      classId: parseInt(selectedClass),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      timePerQuestion: formData.timePerQuestion,
      allowRetrocess: formData.allowRetrocess,
      enableLockdown: formData.enableLockdown,
      passingScore: formData.passingScore,
      maxAttempts: formData.maxAttempts,
      startsAt: formData.startsAt ? new Date(formData.startsAt) : undefined,
      endsAt: formData.endsAt ? new Date(formData.endsAt) : undefined,
    });
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">
          Gerenciar Atividades Avaliativas
        </h1>
        <p className="text-muted-foreground">
          Crie, configure e publique provas com sistema de lockdown
        </p>
      </div>

      {/* Class Selection */}
      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Selecionar Turma
          </label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma turma..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Farmacologia I - Turma A</SelectItem>
              <SelectItem value="2">Farmacologia I - Turma B</SelectItem>
              <SelectItem value="3">Farmacologia I - Turma C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              Nova Atividade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Atividade Avaliativa</DialogTitle>
              <DialogDescription>
                Configure os parâmetros da prova com sistema de lockdown
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Título da Atividade *
                </label>
                <Input
                  placeholder="Ex: Prova 1 - Farmacocinética"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Descrição
                </label>
                <Textarea
                  placeholder="Descrição da atividade, instruções, etc..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Tipo de Questão
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">
                      Múltipla Escolha
                    </SelectItem>
                    <SelectItem value="essay">Dissertativa</SelectItem>
                    <SelectItem value="mixed">Mista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time per Question */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Tempo por Questão (segundos)
                </label>
                <Input
                  type="number"
                  min="30"
                  max="600"
                  value={formData.timePerQuestion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timePerQuestion: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              {/* Passing Score */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Nota de Aprovação (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passingScore: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              {/* Max Attempts */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Máximo de Tentativas
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxAttempts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxAttempts: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Início
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startsAt: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Término
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.endsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, endsAt: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Lockdown Options */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Lock size={16} />
                  Opções de Lockdown
                </h3>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableLockdown}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enableLockdown: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">
                    Ativar Navegador Travado
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowRetrocess}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowRetrocess: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">
                    Permitir Retrocesso entre Questões
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateAssessment}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Criando..." : "Criar Atividade"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assessments List */}
      {!selectedClass ? (
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="text-muted-foreground">
            Selecione uma turma para visualizar as atividades
          </p>
        </Card>
      ) : isLoading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-3">Carregando atividades...</p>
        </Card>
      ) : assessments.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma atividade criada para esta turma
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {assessments.map((assessment: any) => (
            <Card
              key={assessment.id}
              className="p-4 flex items-center justify-between hover:border-primary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">
                    {assessment.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      assessment.status === "published"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {assessment.status === "published"
                      ? "Publicada"
                      : "Rascunho"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {assessment.description || "Sem descrição"}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {assessment.timePerQuestion}s por questão
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock size={14} />
                    {assessment.enableLockdown
                      ? "Lockdown ativo"
                      : "Sem lockdown"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    // TODO: Navigate to questions editor
                  }}
                >
                  <Edit2 size={16} />
                  Questões
                </Button>

                {assessment.status === "draft" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() =>
                      publishMutation.mutate({
                        assessmentId: assessment.id,
                      })
                    }
                    disabled={publishMutation.isPending}
                  >
                    <CheckCircle size={16} />
                    Publicar
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    // TODO: Navigate to results
                  }}
                >
                  <Eye size={16} />
                  Resultados
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (
                      confirm(
                        "Tem certeza que deseja deletar esta atividade?"
                      )
                    ) {
                      deleteMutation.mutate({
                        assessmentId: assessment.id,
                      });
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
