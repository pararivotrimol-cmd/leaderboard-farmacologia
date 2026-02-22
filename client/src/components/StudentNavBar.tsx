import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Users, Award, Target, BarChart3, ClipboardList, Menu, X,
  LogOut, Settings, Bell, BookOpen, Gamepad2
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const ORANGE = "#F7941D";
const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";

interface StudentNavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  selectedClassId?: number;
  onClassChange?: (classId: number) => void;
  showClassSelector?: boolean;
}

const NAV_ITEMS = [
  { key: "leaderboard", label: "Ranking", icon: <Users size={16} /> },
  { key: "individual", label: "Top 10", icon: <Award size={16} /> },
  { key: "activities", label: "Atividades", icon: <Target size={16} /> },
  { key: "game", label: "Jogo", icon: <Gamepad2 size={16} /> },
  { key: "materials", label: "Materiais", icon: <BookOpen size={16} /> },
  { key: "calculator", label: "Calcular", icon: <BarChart3 size={16} /> },
  { key: "rules", label: "Regras", icon: <ClipboardList size={16} /> },
];

export default function StudentNavBar({
  activeTab = "leaderboard",
  onTabChange,
  selectedClassId,
  onClassChange,
  showClassSelector = true,
}: StudentNavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { data: classes } = trpc.classes.list.useQuery({ sessionToken: "" });

  const handleTabClick = (key: string) => {
    if (key === "game") {
      setLocation("/game/avatar-select");
    } else {
      onTabChange?.(key);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: DARK_BG,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/TYglakFwBNwpBXzT.png"
                alt="Logo"
                className="h-8 w-auto"
              />
              <span className="hidden sm:inline font-bold text-white text-sm">
                Farmacologia
              </span>
            </Link>

            {/* Desktop Tabs */}
            <div className="hidden md:flex gap-1 p-1 rounded-lg flex-wrap" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: activeTab === item.key ? ORANGE : "transparent",
                    color: activeTab === item.key ? "#fff" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Class Selector */}
            {showClassSelector && classes && classes.length > 0 && (
              <select
                value={selectedClassId || ""}
                onChange={(e) => onClassChange?.(Number(e.target.value))}
                className="hidden sm:block px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
              >
                <option value="">Selecione uma turma</option>
                {classes.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                className="p-1.5 rounded-lg transition-colors hidden sm:flex"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.6)",
                }}
                title="Notificações"
              >
                <Bell size={18} />
              </button>

              <button
                className="p-1.5 rounded-lg transition-colors hidden sm:flex"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.6)",
                }}
                title="Configurações"
              >
                <Settings size={18} />
              </button>

              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg transition-colors hidden sm:flex"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.6)",
                }}
                title="Sair"
              >
                <LogOut size={18} />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      handleTabClick(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      backgroundColor: activeTab === item.key ? ORANGE : "rgba(255,255,255,0.05)",
                      color: activeTab === item.key ? "#fff" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {showClassSelector && classes && classes.length > 0 && (
                <select
                  value={selectedClassId || ""}
                  onChange={(e) => {
                    onClassChange?.(Number(e.target.value));
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-2 py-1.5 rounded-lg text-xs font-medium text-white mb-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <option value="">Selecione uma turma</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                  title="Notificações"
                >
                  <Bell size={16} />
                  <span>Avisos</span>
                </button>

                <button
                  onClick={() => logout()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
