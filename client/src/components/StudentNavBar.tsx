import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Calendar, QrCode, BarChart3, BookOpen, Gamepad2,
  Target, Users, Menu, X, LogOut, Home
} from "lucide-react";

const ORANGE = "#F7941D";
const DARK_BG = "#0A1628";

interface StudentNavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  selectedClassId?: number;
  onClassChange?: (classId: number) => void;
  showClassSelector?: boolean;
}

const NAV_ITEMS = [
  { key: "cronograma", label: "Cronograma", icon: <Calendar size={16} /> },
  { key: "presenca", label: "Presença", icon: <QrCode size={16} /> },
  { key: "media", label: "Média", icon: <BarChart3 size={16} /> },
  { key: "materiais", label: "Materiais", icon: <BookOpen size={16} /> },
  { key: "jogo", label: "Jogo", icon: <Gamepad2 size={16} />, highlight: true },
  { key: "atividades", label: "Atividades", icon: <Target size={16} /> },
  { key: "equipes", label: "Equipes", icon: <Users size={16} /> },
];

export default function StudentNavBar({
  activeTab = "cronograma",
  onTabChange,
  selectedClassId,
  onClassChange,
  showClassSelector = true,
}: StudentNavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleTabClick = (key: string) => {
    if (key === "jogo") {
      setLocation("/game/avatar-select");
    } else if (key === "presenca") {
      setLocation("/attendance/check-in");
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
        <div className="container mx-auto px-4 2xl:px-8 py-3 2xl:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo + Home */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/TYglakFwBNwpBXzT.png"
                alt="Logo"
                className="h-8 w-auto"
              />
              <span className="hidden sm:inline font-bold text-white text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Farmacologia
              </span>
            </Link>

            {/* Desktop Tabs */}
            <div className="hidden md:flex gap-1 2xl:gap-2 p-1 2xl:p-1.5 rounded-lg flex-wrap" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  className={`flex items-center gap-1.5 px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-md text-xs 2xl:text-sm font-medium transition-all whitespace-nowrap ${item.highlight && activeTab !== item.key ? "ring-1 ring-emerald-400/60 animate-pulse" : ""}`}
                  style={{
                    backgroundColor: activeTab === item.key
                      ? ORANGE
                      : item.highlight
                        ? "rgba(16, 185, 129, 0.15)"
                        : "transparent",
                    color: activeTab === item.key
                      ? "#fff"
                      : item.highlight
                        ? "#34d399"
                        : "rgba(255,255,255,0.6)",
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.highlight && activeTab !== item.key && (
                    <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Leaderboard link */}
              <Link
                href="/leaderboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <Home size={14} />
                <span>Leaderboard</span>
              </Link>

              {/* Logout */}
              <button
                onClick={() => {
                  sessionStorage.clear();
                  setLocation("/");
                }}
                className="p-1.5 rounded-lg transition-colors hidden sm:flex items-center gap-1"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.6)",
                }}
                title="Sair"
              >
                <LogOut size={16} />
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
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-md text-xs font-medium transition-all ${item.highlight && activeTab !== item.key ? "ring-1 ring-emerald-400/60" : ""}`}
                    style={{
                      backgroundColor: activeTab === item.key
                        ? ORANGE
                        : item.highlight
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(255,255,255,0.05)",
                      color: activeTab === item.key
                        ? "#fff"
                        : item.highlight
                          ? "#34d399"
                          : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.highlight && activeTab !== item.key && (
                      <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Link
                  href="/leaderboard"
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <Home size={14} />
                  <span>Leaderboard</span>
                </Link>

                <button
                  onClick={() => {
                    sessionStorage.clear();
                    setLocation("/");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <LogOut size={14} />
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
