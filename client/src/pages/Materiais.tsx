import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  FileText, Link2, MessageSquare, Download, ExternalLink,
  FlaskConical, ArrowLeft, BookOpen, Search, Filter
} from "lucide-react";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/oUYumbCRVNHBqtNw.png";

export default function Materiais() {
  const [selectedModule, setSelectedModule] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: materials, isLoading } = trpc.materials.getVisible.useQuery();

  // Get unique modules
  const modules = useMemo(() => {
    if (!materials) return ["Todos"];
    const mods = new Set(materials.map(m => m.module || "Geral"));
    return ["Todos", ...Array.from(mods).sort()];
  }, [materials]);

  // Filter materials
  const filtered = useMemo(() => {
    if (!materials) return [];
    return materials.filter(m => {
      const matchModule = selectedModule === "Todos" || m.module === selectedModule;
      const matchSearch = !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchModule && matchSearch;
    });
  }, [materials, selectedModule, searchQuery]);

  // Group by module
  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {};
    for (const m of filtered) {
      const mod = m.module || "Geral";
      if (!g[mod]) g[mod] = [];
      g[mod].push(m);
    }
    return g;
  }, [filtered]);

  const typeIcons: Record<string, React.ReactNode> = {
    file: <FileText size={18} className="text-blue-400" />,
    link: <Link2 size={18} className="text-primary" />,
    comment: <MessageSquare size={18} className="text-green-400" />,
  };

  const typeLabels: Record<string, string> = {
    file: "Arquivo",
    link: "Link",
    comment: "Comentário",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <div className="container py-4 flex items-center gap-3">
          <a href="/leaderboard" className="text-muted-foreground hover:text-primary">
            <ArrowLeft size={18} />
          </a>
          <img src={LOGO_URL} alt="Logo" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <BookOpen size={20} className="text-primary" /> Materiais de Estudo
            </h1>
            <p className="text-xs text-muted-foreground">Conexão em Farmacologia — UNIRIO</p>
          </div>
          <a href="/" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
            <FlaskConical size={12} /> Início
          </a>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="container py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Buscar materiais..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm"
            >
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container pb-16">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">
            <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Carregando materiais...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum material disponível</p>
            <p className="text-xs mt-1">Os materiais serão publicados pelo professor ao longo do semestre.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([mod, items]) => (
              <motion.div
                key={mod}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-display font-bold text-sm text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {mod}
                  <span className="text-muted-foreground font-normal text-xs">({items.length})</span>
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((mat, idx) => (
                    <motion.div
                      key={mat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                      style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "oklch(0.245 0.03 264.052)" }}
                        >
                          {typeIcons[mat.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-medium">
                              {typeLabels[mat.type]}
                            </span>
                            {mat.week && (
                              <span className="text-[10px] text-muted-foreground">Sem. {mat.week}</span>
                            )}
                          </div>
                          <h3 className="font-medium text-sm text-foreground leading-snug">{mat.title}</h3>
                          {mat.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mat.description}</p>
                          )}

                          {/* Action buttons */}
                          <div className="mt-3 flex items-center gap-2">
                            {mat.type === "file" && mat.url && (
                              <a
                                href={mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                                style={{ backgroundColor: "rgba(247,148,29,0.15)", color: "#F7941D" }}
                              >
                                <Download size={12} /> Baixar
                              </a>
                            )}
                            {mat.type === "link" && mat.url && (
                              <a
                                href={mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                                style={{ backgroundColor: "rgba(247,148,29,0.15)", color: "#F7941D" }}
                              >
                                <ExternalLink size={12} /> Abrir Link
                              </a>
                            )}
                          </div>

                          {mat.type === "file" && mat.fileName && (
                            <p className="text-[10px] text-muted-foreground mt-2 truncate">
                              📎 {mat.fileName}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(mat.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
