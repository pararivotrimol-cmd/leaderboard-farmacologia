import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Users, BookOpen, FileText, ArrowLeft,
  ChevronDown, ChevronUp, UserPlus, X, Target, Award, Loader2
} from "lucide-react";

/**
 * Página de Grupos Jigsaw para alunos
 * Permite visualizar tópicos, grupos de especialistas e grupos Jigsaw
 */
export default function GruposJigsaw() {
  const [activeTab, setActiveTab] = useState<"topicos" | "especialistas" | "jigsaw">("topicos");
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [expandedExpertGroup, setExpandedExpertGroup] = useState<number | null>(null);
  const [expandedJigsawGroup, setExpandedJigsawGroup] = useState<number | null>(null);

  const [sessionToken, setSessionToken] = useState<string>("");
  const [classId, setClassId] = useState<number | null>(null);

  useEffect(() => {
    // Obter token de aluno do localStorage
    const studentToken = localStorage.getItem("studentSessionToken");
    if (studentToken) {
      setSessionToken(studentToken);
    }
  }, []);

  // Obter dados do aluno para pegar o classId
  const { data: myStats } = trpc.studentDashboard.getMyStats.useQuery(
    { sessionToken },
    { enabled: !!sessionToken }
  );

  useEffect(() => {
    if (myStats?.classId) {
      setClassId(myStats.classId);
    }
  }, [myStats]);

  // Queries usando rotas tRPC reais
  const { data: topics, isLoading: loadingTopics } = trpc.jigsawComplete.topics.getAll.useQuery();
  
  // Buscar grupos de especialistas e grupos Jigsaw com classId real
  const { data: expertGroups = [], isLoading: loadingExperts } = trpc.jigsawComplete.expertGroups.getByClass.useQuery(
    { classId: classId! },
    { enabled: classId !== null }
  );
  
  const { data: jigsawGroups = [], isLoading: loadingJigsaw } = trpc.jigsawComplete.homeGroups.getByClass.useQuery(
    { classId: classId! },
    { enabled: classId !== null }
  );

  const tabs = [
    { key: "topicos" as const, label: "Tópicos", icon: <BookOpen size={16} /> },
    { key: "especialistas" as const, label: "Grupos de Especialistas", icon: <Users size={16} /> },
    { key: "jigsaw" as const, label: "Grupos Jigsaw", icon: <Target size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <div className="container py-4 flex items-center gap-3">
          <FlaskConical size={20} className="text-primary" />
          <h1 className="font-display font-bold text-lg text-foreground flex-1">Método Jigsaw - Seminários</h1>
          <a href="/leaderboard" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft size={12} /> Voltar ao Ranking
          </a>
        </div>
      </div>

      {/* Intro */}
      <div className="container py-6">
        <div className="rounded-lg p-5 border border-primary/30" style={{ backgroundColor: "rgba(74, 144, 226, 0.1)" }}>
          <div className="flex items-start gap-3">
            <Award size={24} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display font-bold text-foreground mb-1">Sobre o Método Jigsaw</h2>
              <p className="text-sm text-muted-foreground">
                O método Jigsaw é uma estratégia de aprendizagem cooperativa onde cada aluno se torna especialista em um tópico e depois ensina aos colegas. 
                Você participará de dois tipos de grupos: <strong>Grupos de Especialistas</strong> (estuda um tópico em profundidade) e <strong>Grupos Jigsaw</strong> (compartilha conhecimento com colegas de outras especialidades).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mb-6">
        <div className="flex gap-1 p-1 rounded-lg bg-secondary/50">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container pb-16">
        {activeTab === "topicos" && <TopicosView topics={topics || []} expandedTopic={expandedTopic} setExpandedTopic={setExpandedTopic} loading={loadingTopics} />}
        {activeTab === "especialistas" && <ExpertGroupsView groups={expertGroups || []} expandedGroup={expandedExpertGroup} setExpandedGroup={setExpandedExpertGroup} loading={loadingExperts} />}
        {activeTab === "jigsaw" && <JigsawGroupsView groups={jigsawGroups || []} expandedGroup={expandedJigsawGroup} setExpandedGroup={setExpandedJigsawGroup} loading={loadingJigsaw} />}
      </div>
    </div>
  );
}

// ─── Tópicos View ───
function TopicosView({ topics, expandedTopic, setExpandedTopic, loading }: any) {
  if (loading) return <div className="text-center text-muted-foreground py-8">Carregando tópicos...</div>;
  if (!topics || topics.length === 0) return <div className="text-center text-muted-foreground py-8">Nenhum tópico disponível.</div>;

  return (
    <div className="space-y-3">
      {topics.map((topic: any) => (
        <div key={topic.id} className="border border-border rounded-lg overflow-hidden" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
          <button
            onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
            className="w-full p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
          >
            <BookOpen size={20} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground">{topic.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>
            </div>
            {expandedTopic === topic.id ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {expandedTopic === topic.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-border/50"
              >
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Artigos de Referência</h4>
                    {topic.articles && topic.articles.length > 0 ? (
                      <div className="space-y-2">
                        {topic.articles.map((article: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 p-2 rounded bg-secondary/30">
                            <FileText size={14} className="text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                {article.title}
                              </a>
                              <p className="text-xs text-muted-foreground mt-0.5">{article.authors}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhum artigo cadastrado.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Objetivos de Aprendizagem</h4>
                    {topic.objectives && topic.objectives.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                        {topic.objectives.map((obj: string, idx: number) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhum objetivo definido.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── Expert Groups View ───
function ExpertGroupsView({ groups, expandedGroup, setExpandedGroup, loading }: any) {
  if (loading) return <div className="text-center text-muted-foreground py-8">Carregando grupos de especialistas...</div>;
  if (!groups || groups.length === 0) return <div className="text-center text-muted-foreground py-8">Nenhum grupo de especialista criado.</div>;

  return (
    <div className="space-y-3">
      {groups.map((group: any) => (
        <div key={group.id} className="border border-border rounded-lg overflow-hidden" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
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
            {expandedGroup === group.id ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {expandedGroup === group.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-border/50"
              >
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Membros do Grupo</h4>
                  {group.members && group.members.length > 0 ? (
                    <div className="space-y-1">
                      {group.members.map((member: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 py-1.5 px-2 rounded bg-secondary/30">
                          <span className="w-6 text-center text-xs text-muted-foreground font-mono">{idx + 1}</span>
                          <span className="text-sm text-foreground flex-1">{member.name}</span>
                          {member.role === "coordinator" && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Coordenador</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhum membro neste grupo.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── Jigsaw Groups View ───
function JigsawGroupsView({ groups, expandedGroup, setExpandedGroup, loading }: any) {
  if (loading) return <div className="text-center text-muted-foreground py-8">Carregando grupos Jigsaw...</div>;
  if (!groups || groups.length === 0) return <div className="text-center text-muted-foreground py-8">Nenhum grupo Jigsaw criado.</div>;

  return (
    <div className="space-y-3">
      {groups.map((group: any) => (
        <div key={group.id} className="border border-border rounded-lg overflow-hidden" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
          <button
            onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
            className="w-full p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
          >
            <Target size={20} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground">{group.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Grupo de compartilhamento de conhecimento</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{group.members?.length || 0} membros</span>
            {expandedGroup === group.id ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {expandedGroup === group.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-border/50"
              >
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Membros e Especialidades</h4>
                  {group.members && group.members.length > 0 ? (
                    <div className="space-y-1">
                      {group.members.map((member: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 py-1.5 px-2 rounded bg-secondary/30">
                          <span className="w-6 text-center text-xs text-muted-foreground font-mono">{idx + 1}</span>
                          <span className="text-sm text-foreground flex-1">{member.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{member.expertTopic}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhum membro neste grupo.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
