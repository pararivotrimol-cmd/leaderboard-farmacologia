import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Copy,
  Eye,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import QuestionEditor from "@/components/QuestionEditor";

export default function QuestionsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  // Fetch questions
  const { data: questions = [], isLoading, refetch } = trpc.questions.list.useQuery({
    category: selectedCategory || undefined,
    difficulty: (selectedDifficulty as any) || undefined,
    search: searchTerm || undefined,
    limit: 100,
  });

  // Fetch categories
  const { data: categories = [] } = trpc.questions.getCategories.useQuery();

  // Fetch single question for viewing
  const { data: viewingQuestion } = trpc.questions.getById.useQuery(
    { id: viewingId || 0 },
    { enabled: !!viewingId }
  );

  // Fetch single question for editing
  const { data: editingQuestion } = trpc.questions.getById.useQuery(
    { id: editingId || 0 },
    { enabled: !!editingId }
  );

  // Mutations
  const createMutation = trpc.questions.create.useMutation({
    onSuccess: () => {
      toast.success("Questão criada com sucesso!");
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.questions.update.useMutation({
    onSuccess: () => {
      toast.success("Questão atualizada com sucesso!");
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.questions.delete.useMutation({
    onSuccess: () => {
      toast.success("Questão deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const publishMutation = trpc.questions.publish.useMutation({
    onSuccess: () => {
      toast.success("Questão publicada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const duplicateMutation = trpc.questions.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Questão duplicada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: any) => {
    if (!editingId) return;
    await updateMutation.mutateAsync({ id: editingId, ...data });
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">
          Banco de Questões
        </h1>
        <p className="text-muted-foreground">
          Crie, edite e gerencie questões reutilizáveis para suas provas
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Categoria
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {categories.map((cat: string) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Dificuldade
            </label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                Nova Questão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Questão</DialogTitle>
                <DialogDescription>
                  Preencha todos os campos obrigatórios. Questões de múltipla escolha devem ter 5 alternativas.
                </DialogDescription>
              </DialogHeader>
              <QuestionEditor
                onSave={handleCreate}
                onCancel={() => setIsCreating(false)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-3">Carregando questões...</p>
        </Card>
      ) : questions.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="text-muted-foreground">Nenhuma questão encontrada</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {(questions as any[]).map((question: any) => (
            <Card key={question.id} className="p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">
                      {question.title}
                    </h3>
                    {question.isPublished ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Publicada
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600">
                        Rascunho
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {question.questionText}
                  </p>

                  <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded-full bg-secondary">
                      {question.category}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-secondary">
                      {question.difficulty === "easy"
                        ? "Fácil"
                        : question.difficulty === "medium"
                        ? "Médio"
                        : "Difícil"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-secondary">
                      {question.points} ponto{question.points !== 1 ? "s" : ""}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-secondary">
                      Usada {question.timesUsed} vez{question.timesUsed !== 1 ? "es" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => setViewingId(question.id)}
                  >
                    <Eye size={16} />
                  </Button>

                  <Dialog open={editingId === question.id} onOpenChange={(open) => {
                    if (!open) setEditingId(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => setEditingId(question.id)}
                      >
                        <Edit2 size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Questão</DialogTitle>
                      </DialogHeader>
                      {editingQuestion && (
                        <QuestionEditor
                          initialData={editingQuestion}
                          onSave={handleUpdate}
                          onCancel={() => setEditingId(null)}
                          isLoading={updateMutation.isPending}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => duplicateMutation.mutate({ id: question.id })}
                    disabled={duplicateMutation.isPending}
                  >
                    <Copy size={16} />
                  </Button>

                  {!question.isPublished && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => publishMutation.mutate({ id: question.id })}
                      disabled={publishMutation.isPending}
                    >
                      <CheckCircle size={16} />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja deletar esta questão?")) {
                        deleteMutation.mutate({ id: question.id });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Question Dialog */}
      <Dialog open={!!viewingId} onOpenChange={(open) => {
        if (!open) setViewingId(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualizar Questão</DialogTitle>
          </DialogHeader>
          {viewingQuestion && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {viewingQuestion.title}
                </h2>
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {viewingQuestion.category}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {viewingQuestion.difficulty === "easy"
                      ? "Fácil"
                      : viewingQuestion.difficulty === "medium"
                      ? "Médio"
                      : "Difícil"}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {viewingQuestion.points} ponto{viewingQuestion.points !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {viewingQuestion.imageUrl && (
                <img
                  src={viewingQuestion.imageUrl}
                  alt="Questão"
                  className="max-w-full max-h-64 rounded-lg object-contain"
                />
              )}

              <div className="text-foreground whitespace-pre-wrap">
                {viewingQuestion.questionText}
              </div>

              {viewingQuestion.questionType === "multiple_choice" &&
                viewingQuestion.alternatives && (
                  <div className="space-y-2">
                    {viewingQuestion.alternatives.map((alt: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-2 ${
                          alt.isCorrect
                            ? "border-green-500 bg-green-500/10"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-bold text-foreground">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <div className="flex-1">
                            <p className="text-foreground">{alt.text}</p>
                            {alt.explanation && (
                              <p className="text-xs text-muted-foreground mt-1">
                                💡 {alt.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
