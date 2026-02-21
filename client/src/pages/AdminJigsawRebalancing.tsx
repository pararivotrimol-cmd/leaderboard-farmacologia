import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Shuffle, Eye, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RebalancingStrategy = "size" | "specialties" | "performance";

interface RebalancingPlan {
  strategy: RebalancingStrategy;
  moves: Array<{
    memberId: number;
    memberName: string;
    fromGroupId: number;
    fromGroupName: string;
    toGroupId: number;
    toGroupName: string;
    reason: string;
  }>;
  statistics: {
    totalMoves: number;
    groupSizesBefore: Record<number, number>;
    groupSizesAfter: Record<number, number>;
    avgGroupSize: number;
    balanceImprovement: number;
  };
}

export default function JigsawRebalancingManager() {
  const [selectedStrategy, setSelectedStrategy] = useState<RebalancingStrategy>("size");
  const [showPreview, setShowPreview] = useState(false);
  const [rebalancingPlan, setRebalancingPlan] = useState<RebalancingPlan | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Buscar grupos Jigsaw (mock data por enquanto)
  const mockGroups = useMemo(() => [
    {
      id: 1,
      name: "Grupo Jigsaw A",
      members: [
        { id: 1, name: "Alice Silva", xp: 450, specialty: "Farmacologia" },
        { id: 2, name: "Bob Santos", xp: 380, specialty: "Biologia" },
        { id: 3, name: "Carol Costa", xp: 520, specialty: "Química" },
        { id: 4, name: "David Oliveira", xp: 410, specialty: "Farmacologia" },
      ],
    },
    {
      id: 2,
      name: "Grupo Jigsaw B",
      members: [
        { id: 5, name: "Eve Martins", xp: 390, specialty: "Biologia" },
        { id: 6, name: "Frank Pereira", xp: 470, specialty: "Química" },
      ],
    },
    {
      id: 3,
      name: "Grupo Jigsaw C",
      members: [
        { id: 7, name: "Grace Lima", xp: 510, specialty: "Farmacologia" },
        { id: 8, name: "Henry Rocha", xp: 440, specialty: "Biologia" },
        { id: 9, name: "Iris Gomes", xp: 360, specialty: "Química" },
        { id: 10, name: "Jack Ferreira", xp: 480, specialty: "Farmacologia" },
        { id: 11, name: "Karen Alves", xp: 420, specialty: "Biologia" },
      ],
    },
  ], []);

  // Simular cálculo de plano de rebalanceamento
  const generateRebalancingPlan = (strategy: RebalancingStrategy) => {
    const groupSizesBefore: Record<number, number> = {};
    mockGroups.forEach(g => {
      groupSizesBefore[g.id] = g.members.length;
    });

    const totalMembers = mockGroups.reduce((sum, g) => sum + g.members.length, 0);
    const idealSize = Math.ceil(totalMembers / mockGroups.length);

    let moves: RebalancingPlan["moves"] = [];

    if (strategy === "size") {
      // Simular rebalanceamento por tamanho
      moves = [
        {
          memberId: 5,
          memberName: "Eve Martins",
          fromGroupId: 2,
          fromGroupName: "Grupo Jigsaw B",
          toGroupId: 1,
          toGroupName: "Grupo Jigsaw A",
          reason: `Rebalanceamento por tamanho (tamanho ideal: ${idealSize})`,
        },
        {
          memberId: 6,
          memberName: "Frank Pereira",
          fromGroupId: 2,
          fromGroupName: "Grupo Jigsaw B",
          toGroupId: 3,
          toGroupName: "Grupo Jigsaw C",
          reason: `Rebalanceamento por tamanho (tamanho ideal: ${idealSize})`,
        },
      ];
    } else if (strategy === "specialties") {
      moves = [
        {
          memberId: 2,
          memberName: "Bob Santos",
          fromGroupId: 1,
          fromGroupName: "Grupo Jigsaw A",
          toGroupId: 2,
          toGroupName: "Grupo Jigsaw B",
          reason: "Distribuição de especialidade: Biologia",
        },
        {
          memberId: 5,
          memberName: "Eve Martins",
          fromGroupId: 2,
          fromGroupName: "Grupo Jigsaw B",
          toGroupId: 1,
          toGroupName: "Grupo Jigsaw A",
          reason: "Distribuição de especialidade: Biologia",
        },
      ];
    } else {
      moves = [
        {
          memberId: 7,
          memberName: "Grace Lima",
          fromGroupId: 3,
          fromGroupName: "Grupo Jigsaw C",
          toGroupId: 1,
          toGroupName: "Grupo Jigsaw A",
          reason: "Balanceamento de desempenho (XP: 510)",
        },
        {
          memberId: 1,
          memberName: "Alice Silva",
          fromGroupId: 1,
          fromGroupName: "Grupo Jigsaw A",
          toGroupId: 3,
          toGroupName: "Grupo Jigsaw C",
          reason: "Balanceamento de desempenho (XP: 450)",
        },
      ];
    }

    const groupSizesAfter: Record<number, number> = { ...groupSizesBefore };
    moves.forEach(move => {
      groupSizesAfter[move.fromGroupId]--;
      groupSizesAfter[move.toGroupId]++;
    });

    const plan: RebalancingPlan = {
      strategy,
      moves,
      statistics: {
        totalMoves: moves.length,
        groupSizesBefore,
        groupSizesAfter,
        avgGroupSize: totalMembers / mockGroups.length,
        balanceImprovement: 0.5,
      },
    };

    setRebalancingPlan(plan);
    setShowPreview(true);
  };

  const executeRebalancing = async () => {
    if (!rebalancingPlan) return;

    setIsExecuting(true);
    try {
      // Simular execução
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log(`✅ Rebalanceamento concluído! ${rebalancingPlan.moves.length} alunos foram realocados com sucesso.`);

      setShowPreview(false);
      setRebalancingPlan(null);
    } catch (error) {
      console.error("❌ Erro ao rebalancear");
    } finally {
      setIsExecuting(false);
    }
  };

  const strategyDescriptions = {
    size: "Distribui alunos igualmente entre grupos para balancear tamanho",
    specialties: "Garante que cada grupo tenha alunos de diferentes especialidades",
    performance: "Distribui alunos para balancear XP total dos grupos",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Rebalanceamento de Grupos Jigsaw</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Reorganize automaticamente alunos entre grupos usando diferentes critérios
        </p>
      </div>

      {/* Seletor de Estratégia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle size={18} />
            Selecione a Estratégia de Rebalanceamento
          </CardTitle>
          <CardDescription>
            Escolha como deseja reorganizar os alunos entre grupos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStrategy} onValueChange={(v) => setSelectedStrategy(v as RebalancingStrategy)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="size">Por Tamanho</TabsTrigger>
              <TabsTrigger value="specialties">Por Especialidades</TabsTrigger>
              <TabsTrigger value="performance">Por Desempenho</TabsTrigger>
            </TabsList>

            <TabsContent value="size" className="space-y-4 mt-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {strategyDescriptions.size}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                  <strong>Como funciona:</strong> Calcula o tamanho ideal de cada grupo e realoca alunos para atingir esse tamanho.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specialties" className="space-y-4 mt-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {strategyDescriptions.specialties}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900">
                  <strong>Como funciona:</strong> Distribui membros de cada especialidade entre grupos para garantir diversidade.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 mt-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {strategyDescriptions.performance}
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900">
                  <strong>Como funciona:</strong> Ordena alunos por XP e distribui em round-robin para balancear desempenho.
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={() => generateRebalancingPlan(selectedStrategy)}
            className="w-full mt-6"
            size="lg"
          >
            <Eye className="mr-2" size={16} />
            Visualizar Plano de Rebalanceamento
          </Button>
        </CardContent>
      </Card>

      {/* Preview do Plano */}
      <AnimatePresence>
        {showPreview && rebalancingPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Resumo das Mudanças */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  Resumo do Rebalanceamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total de Movimentos</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {rebalancingPlan.statistics.totalMoves}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Melhoria de Balanceamento</div>
                    <div className="text-2xl font-bold text-green-600">
                      {(rebalancingPlan.statistics.balanceImprovement * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Comparação de Tamanhos */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Tamanho dos Grupos</h4>
                  <div className="space-y-2">
                    {Object.entries(rebalancingPlan.statistics.groupSizesBefore).map(([groupId, sizeBefore]) => {
                      const sizeAfter = rebalancingPlan.statistics.groupSizesAfter[parseInt(groupId)];
                      const change = sizeAfter - sizeBefore;
                      return (
                        <div key={groupId} className="flex items-center justify-between text-sm">
                          <span>Grupo {parseInt(groupId)}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{sizeBefore}</Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant={change > 0 ? "default" : change < 0 ? "secondary" : "outline"}>
                              {sizeAfter}
                            </Badge>
                            {change !== 0 && (
                              <span className={change > 0 ? "text-green-600" : "text-orange-600"}>
                                ({change > 0 ? "+" : ""}{change})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Movimentos */}
            <Card>
              <CardHeader>
                <CardTitle>Movimentos Propostos ({rebalancingPlan.moves.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {rebalancingPlan.moves.map((move, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border border-border rounded-lg p-3 bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{move.memberName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {move.fromGroupName} → {move.toGroupName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {move.reason}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setRebalancingPlan(null);
                }}
                disabled={isExecuting}
                className="flex-1"
              >
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={executeRebalancing}
                disabled={isExecuting}
                className="flex-1"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Confirmar Rebalanceamento
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estado Vazio */}
      {!showPreview && (
        <Card className="border-dashed">
          <CardContent className="pt-8 text-center">
            <AlertCircle size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Selecione uma estratégia e clique em "Visualizar Plano" para ver as mudanças propostas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
