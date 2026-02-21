import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Users, ChevronDown, ChevronUp, Save, Loader2,
  Search, Filter, AlertCircle
} from "lucide-react";

/**
 * Componente de Pontuação Jigsaw para o painel admin
 * Permite que professores atribuam notas de apresentação e participação aos grupos
 */
export function JigsawScoringManager() {
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scores, setScores] = useState<Record<number, { presentation: number; participation: number }>>({});
  const [loadingGroupId, setLoadingGroupId] = useState<number | null>(null);

  // Nota: Turmas são obtidas através dos grupos de especialistas disponíveis

  // Buscar grupos de especialistas da turma selecionada
  const { data: expertGroups = [], isLoading: loadingGroups } = trpc.jigsawComplete.expertGroups.getByClass.useQuery(
    { classId: selectedClass! },
    { enabled: selectedClass !== null }
  );

  // Buscar notas de um grupo específico
  const getScoresQuery = trpc.jigsawComplete.expertGroups.getScores.useQuery(
    { expertGroupId: expandedGroup! },
    { enabled: expandedGroup !== null }
  );

  // Mutation para atribuir notas
  const scoreGroupMutation = trpc.jigsawComplete.expertGroups.scorePresentation.useMutation({
    onSuccess: () => {
      toast.success("Notas atribuídas com sucesso!");
      setScores({});
      setExpandedGroup(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atribuir notas");
    },
  });

  // Filtrar grupos por busca
  const filteredGroups = expertGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.topicTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScoreChange = (memberId: number, type: "presentation" | "participation", value: number) => {
    setScores(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [type]: value,
      },
    }));
  };

  const handleSubmitScores = async () => {
    if (!expandedGroup) return;

    const scoresArray = Object.entries(scores).map(([memberId, scoreData]) => ({
      memberId: Number(memberId),
      presentationScore: scoreData.presentation,
      participationScore: scoreData.participation,
    }));

    if (scoresArray.length === 0) {
      toast.error("Nenhuma nota foi preenchida");
      return;
    }

    setLoadingGroupId(expandedGroup);
    await scoreGroupMutation.mutateAsync({
      expertGroupId: expandedGroup,
      scores: scoresArray,
    });
    setLoadingGroupId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Award size={24} className="text-primary" />
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">Pontuação Jigsaw</h2>
          <p className="text-xs text-muted-foreground">Atribua notas de apresentação e participação aos grupos de especialistas</p>
        </div>
      </div>

      {/* Busca */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Buscar Grupo</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Nome do grupo ou tópico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Lista de Grupos */}
      <div className="space-y-3">
        {loadingGroups ? (
          <div className="text-center py-8 text-muted-foreground">Carregando grupos...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {selectedClass ? "Nenhum grupo encontrado" : "Selecione uma turma"}
          </div>
        ) : (
          filteredGroups.map(group => (
            <motion.div
              key={group.id}
              className="border border-border rounded-lg overflow-hidden bg-secondary/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header do Grupo */}
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
              >
                <Users size={20} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground">{group.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Tópico: {group.topicTitle}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{group.members?.length || 0} membros</span>
                {expandedGroup === group.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {/* Conteúdo Expandido */}
              <AnimatePresence>
                {expandedGroup === group.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-border/50"
                  >
                    <div className="p-4 space-y-4">
                      {/* Informação de Escala */}
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex gap-2">
                        <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-foreground">
                          <strong>Escala:</strong> Apresentação (0-5) | Participação (0-2)
                        </div>
                      </div>

                      {/* Membros e Notas */}
                      {getScoresQuery.isLoading ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">Carregando membros...</div>
                      ) : group.members && group.members.length > 0 ? (
                        <div className="space-y-3">
                          {group.members.map((member: any) => (
                            <div key={member.id} className="flex items-end gap-3 p-3 rounded-lg bg-secondary/30">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{member.name}</p>
                                {member.role === "coordinator" && (
                                  <span className="text-xs text-primary">Coordenador</span>
                                )}
                              </div>

                              {/* Input de Apresentação */}
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">Apresentação</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="5"
                                  step="0.5"
                                  value={scores[member.id]?.presentation ?? ""}
                                  onChange={(e) => handleScoreChange(member.id, "presentation", parseFloat(e.target.value) || 0)}
                                  placeholder="0-5"
                                  className="w-16 px-2 py-1 rounded border border-border bg-background text-foreground text-sm text-center"
                                />
                              </div>

                              {/* Input de Participação */}
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">Participação</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="2"
                                  step="0.5"
                                  value={scores[member.id]?.participation ?? ""}
                                  onChange={(e) => handleScoreChange(member.id, "participation", parseFloat(e.target.value) || 0)}
                                  placeholder="0-2"
                                  className="w-16 px-2 py-1 rounded border border-border bg-background text-foreground text-sm text-center"
                                />
                              </div>

                              {/* Total */}
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">Total</label>
                                <div className="w-16 px-2 py-1 rounded bg-primary/10 text-foreground text-sm text-center font-semibold">
                                  {((scores[member.id]?.presentation ?? 0) + (scores[member.id]?.participation ?? 0)).toFixed(1)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhum membro neste grupo</p>
                      )}

                      {/* Botão de Salvar */}
                      {group.members && group.members.length > 0 && (
                        <button
                          onClick={handleSubmitScores}
                          disabled={scoreGroupMutation.isPending || loadingGroupId === group.id}
                          className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          {(scoreGroupMutation.isPending || loadingGroupId === group.id) && (
                            <Loader2 size={16} className="animate-spin" />
                          )}
                          <Save size={16} />
                          Salvar Notas
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
