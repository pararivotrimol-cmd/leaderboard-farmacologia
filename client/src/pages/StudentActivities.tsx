import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, Link2, FileText, CheckCircle, Clock, AlertCircle,
  ArrowLeft, Send, Eye, EyeOff
} from "lucide-react";

export default function StudentActivities() {
  const [activeTab, setActiveTab] = useState<"available" | "submitted">("available");
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [responseType, setResponseType] = useState<"text" | "file" | "link">("text");
  const [responseContent, setResponseContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch activities
  const { data: activities = [], isLoading: activitiesLoading } = trpc.studentActivities.getAll.useQuery();

  // Fetch student submissions
  const { data: submissions = [], isLoading: submissionsLoading } = trpc.studentActivities.getStudentSubmissions.useQuery({
    activityId: selectedActivity || undefined,
  });

  // Submit response mutation
  const submitResponseMutation = trpc.studentActivities.submitResponse.useMutation({
    onSuccess: () => {
      toast.success("Resposta submetida com sucesso!");
      setResponseContent("");
      setFileUrl("");
      setLinkUrl("");
      setSelectedActivity(null);
      setResponseType("text");
    },
    onError: (error: any) => {
      toast.error(`Erro ao submeter: ${error.message}`);
    },
  });

  const handleSubmitResponse = async () => {
    if (!selectedActivity) {
      toast.error("Selecione uma atividade");
      return;
    }

    if (responseType === "text" && !responseContent.trim()) {
      toast.error("Digite sua resposta");
      return;
    }

    if (responseType === "file" && !fileUrl.trim()) {
      toast.error("Forneça a URL do arquivo");
      return;
    }

    if (responseType === "link" && !linkUrl.trim()) {
      toast.error("Forneça o link");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitResponseMutation.mutateAsync({
        activityId: selectedActivity,
        content: responseType === "text" ? responseContent : undefined,
        fileUrl: responseType === "file" ? fileUrl : undefined,
        linkUrl: responseType === "link" ? linkUrl : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedActivityData = activities.find(a => a.id === selectedActivity);
  const activitySubmissions = submissions.filter(s => s.activityId === selectedActivity);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedActivity(null)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-muted-foreground" />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Atividades</h1>
              <p className="text-xs text-muted-foreground">Submeta suas respostas e acompanhe feedback</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "available"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Disponíveis ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab("submitted")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "submitted"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Minhas Submissões ({submissions.length})
          </button>
        </div>

        {/* Available Activities */}
        {activeTab === "available" && (
          <div className="space-y-3">
            {activitiesLoading ? (
              <Card className="p-4">
                <p className="text-center text-muted-foreground">Carregando atividades...</p>
              </Card>
            ) : activities.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <AlertCircle size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma atividade disponível no momento</p>
                </div>
              </Card>
            ) : (
              activities.map(activity => (
                <Card
                  key={activity.id}
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedActivity(activity.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground">{activity.name}</h3>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="inline-block px-2 py-1 rounded bg-secondary">
                          {activity.type}
                        </span>
                        <span className="font-mono">+{activity.maxXP} PF</span>
                        {activity.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(activity.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline">
                        Responder
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Submitted Activities */}
        {activeTab === "submitted" && (
          <div className="space-y-3">
            {submissionsLoading ? (
              <Card className="p-4">
                <p className="text-center text-muted-foreground">Carregando submissões...</p>
              </Card>
            ) : submissions.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <FileText size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Você ainda não submeteu nenhuma atividade</p>
                </div>
              </Card>
            ) : (
              submissions.map(submission => (
                <Card key={submission.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-semibold text-foreground">
                          {activities.find(a => a.id === submission.activityId)?.name || "Atividade"}
                        </h3>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            submission.status === "graded"
                              ? "bg-green-500/20 text-green-700"
                              : submission.status === "reviewed"
                              ? "bg-blue-500/20 text-blue-700"
                              : "bg-yellow-500/20 text-yellow-700"
                          }`}
                        >
                          {submission.status === "graded"
                            ? "Avaliado"
                            : submission.status === "reviewed"
                            ? "Em revisão"
                            : "Submetido"}
                        </span>
                      </div>

                      {submission.feedback && (
                        <div className="mt-3 p-3 rounded bg-secondary">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Feedback do Professor:</p>
                          <p className="text-sm text-foreground">{submission.feedback}</p>
                        </div>
                      )}

                      {submission.xpAwarded && parseFloat(submission.xpAwarded as any) > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle size={16} />
                          <span>+{submission.xpAwarded} PF</span>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-3">
                        Submetido em {new Date(submission.submittedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedActivity && selectedActivityData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">{selectedActivityData.name}</h2>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Eye size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {selectedActivityData.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Descrição:</p>
                  <p className="text-sm text-foreground">{selectedActivityData.description}</p>
                </div>
              )}

              <div className="flex items-center gap-4 p-3 rounded bg-secondary">
                <span className="text-sm">Tipo: <strong>{selectedActivityData.type}</strong></span>
                <span className="text-sm">Pontos: <strong>+{selectedActivityData.maxXP} PF</strong></span>
              </div>

              {/* Response Type Selector */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Tipo de Resposta:</p>
                <div className="flex gap-2">
                  {(["text", "file", "link"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setResponseType(type)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        responseType === type
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {type === "text" && <FileText size={16} />}
                      {type === "file" && <Upload size={16} />}
                      {type === "link" && <Link2 size={16} />}
                      <span className="capitalize">{type === "text" ? "Texto" : type === "file" ? "Arquivo" : "Link"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Input */}
              {responseType === "text" && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Sua Resposta:</label>
                  <Textarea
                    value={responseContent}
                    onChange={e => setResponseContent(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="min-h-[150px]"
                  />
                </div>
              )}

              {responseType === "file" && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">URL do Arquivo:</label>
                  <Input
                    value={fileUrl}
                    onChange={e => setFileUrl(e.target.value)}
                    placeholder="https://example.com/seu-arquivo.pdf"
                    type="url"
                  />
                </div>
              )}

              {responseType === "link" && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Link:</label>
                  <Input
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setSelectedActivity(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitResponse}
                  disabled={isSubmitting || submitResponseMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {isSubmitting || submitResponseMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
