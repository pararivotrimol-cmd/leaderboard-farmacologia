import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, LogOut, LogIn, Zap } from "lucide-react";
import { useLocation } from "wouter";

type GroupType = "seminar" | "clinical_case" | "kahoot";

const groupTypeLabels: Record<GroupType, string> = {
  seminar: "Seminário",
  clinical_case: "Caso Clínico",
  kahoot: "Kahoot",
};

const groupTypeColors: Record<GroupType, string> = {
  seminar: "bg-blue-100 text-blue-800",
  clinical_case: "bg-green-100 text-green-800",
  kahoot: "bg-purple-100 text-purple-800",
};

export default function JigsawGroups() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [classId, setClassId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<GroupType | "all">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState<GroupType>("seminar");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [maxMembers, setMaxMembers] = useState(5);

  // Get session tokens from localStorage
  const studentSessionToken = localStorage.getItem("studentSessionToken") || "";
  const teacherToken = localStorage.getItem("teacherSessionToken") || localStorage.getItem("sessionToken") || "";

  // Fetch classes
  const { data: classes } = trpc.classes.list.useQuery(
    { sessionToken: teacherToken },
    { enabled: !!teacherToken }
  );

  // Fetch groups for selected class
  const { data: groups, refetch: refetchGroups } = trpc.jigsawGroups.getByClass.useQuery(
    { classId: classId || 0 },
    { enabled: !!classId }
  );

  // Fetch member's groups
  const { data: memberGroups, refetch: refetchMemberGroups } = trpc.jigsawGroups.getMemberGroups.useQuery(
    { studentSessionToken },
    { enabled: !!studentSessionToken }
  );

  // Create group mutation
  const createGroupMutation = trpc.jigsawGroups.create.useMutation({
    onSuccess: () => {
      setNewGroupName("");
      setNewGroupDesc("");
      setShowCreateDialog(false);
      refetchGroups();
      refetchMemberGroups();
    },
  });

  // Join group mutation
  const joinGroupMutation = trpc.jigsawGroups.join.useMutation({
    onSuccess: () => {
      refetchGroups();
      refetchMemberGroups();
    },
  });

  // Leave group mutation
  const leaveGroupMutation = trpc.jigsawGroups.leave.useMutation({
    onSuccess: () => {
      refetchGroups();
      refetchMemberGroups();
    },
  });

  // Set default class on load
  useEffect(() => {
    if (classes && classes.length > 0 && !classId) {
      // Try to find Farmacologia 1 Medicina
      const farmacoClass = classes.find((c: any) => c.name.includes("Farmacologia 1") && c.name.includes("Medicina"));
      setClassId(farmacoClass?.id || classes[0].id);
    }
  }, [classes, classId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!studentSessionToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Grupos Jigsaw</h1>
          <p className="text-muted-foreground mb-6">Você precisa estar logado para acessar os grupos.</p>
          <Button onClick={() => setLocation("/")} className="w-full">
            Ir para Login
          </Button>
        </Card>
      </div>
    );
  }

  const filteredGroups = groups?.filter(g => selectedType === "all" || g.groupType === selectedType) || [];
  const memberGroupIds = new Set(memberGroups?.map(mg => mg.jigsawGroupId) || []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Grupos Jigsaw</h1>
          <p className="text-muted-foreground">
            Crie ou entre em grupos para seminários, casos clínicos e Kahoots
          </p>
        </div>

        {/* Class Selector */}
        {classes && classes.length > 0 && (
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Selecione a Turma</label>
            <select
              value={classId || ""}
              onChange={(e) => setClassId(Number(e.target.value))}
              className="w-full max-w-xs px-3 py-2 border border-border rounded-md bg-background"
            >
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Create Group Button */}
        <div className="mb-8 flex gap-4">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Grupo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Grupo</label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Grupo 1 - Farmacocinética"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={newGroupType}
                    onChange={(e) => setNewGroupType(e.target.value as GroupType)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    {(Object.entries(groupTypeLabels) as [GroupType, string][]).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição (Opcional)</label>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Descrição do grupo..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Máximo de Membros</label>
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                  />
                </div>
                <Button
                  onClick={() => {
                    if (!newGroupName.trim() || !classId) return;
                    createGroupMutation.mutate({
                      studentSessionToken,
                      classId,
                      groupType: newGroupType,
                      name: newGroupName,
                      description: newGroupDesc || undefined,
                      maxMembers,
                    });
                  }}
                  disabled={createGroupMutation.isPending || !newGroupName.trim()}
                  className="w-full"
                >
                  {createGroupMutation.isPending ? "Criando..." : "Criar Grupo"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {["all", "seminar", "clinical_case", "kahoot"].map(type => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type as GroupType | "all")}
            >
              {type === "all" ? "Todos" : groupTypeLabels[type as GroupType]}
            </Button>
          ))}
        </div>

        {/* My Groups Section */}
        {memberGroups && memberGroups.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Meus Grupos</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {memberGroups.map(mg => {
                const group = groups?.find(g => g.id === mg.jigsawGroupId);
                if (!group) return null;
                return (
                  <Card key={group.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{group.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${groupTypeColors[group.groupType]}`}>
                        {groupTypeLabels[group.groupType]}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <Users className="w-4 h-4" />
                      <span className="text-muted-foreground">{group.currentMembers} / {group.maxMembers} membros</span>
                      <div className="ml-auto">
                        {group.currentMembers >= group.maxMembers ? (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Cheio</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{group.maxMembers - group.currentMembers} vagas</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        leaveGroupMutation.mutate({
                          studentSessionToken,
                          jigsawGroupId: group.id,
                        });
                      }}
                      disabled={leaveGroupMutation.isPending}
                      className="w-full gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair do Grupo
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Groups Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Grupos Disponíveis</h2>
          {filteredGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum grupo disponível nesta categoria.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map(group => {
                const isMember = memberGroupIds.has(group.id);
                const isFull = group.currentMembers >= group.maxMembers;
                return (
                  <Card key={group.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{group.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${groupTypeColors[group.groupType]}`}>
                        {groupTypeLabels[group.groupType]}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <Users className="w-4 h-4" />
                      <span className="text-muted-foreground">{group.currentMembers} / {group.maxMembers} membros</span>
                      <div className="ml-auto">
                        {group.currentMembers >= group.maxMembers ? (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Cheio</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{group.maxMembers - group.currentMembers} vagas</span>
                        )}
                      </div>
                    </div>
                    {group.createdByName && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Criado por: {group.createdByName}
                      </p>
                    )}
                    {isMember ? (
                      <p className="text-sm text-green-600 font-medium">✓ Você está neste grupo</p>
                    ) : (
                      <Button
                        onClick={() => {
                          joinGroupMutation.mutate({
                            studentSessionToken,
                            jigsawGroupId: group.id,
                          });
                        }}
                        disabled={joinGroupMutation.isPending || isFull}
                        className="w-full gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        {isFull ? "Grupo Cheio" : "Entrar"}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
