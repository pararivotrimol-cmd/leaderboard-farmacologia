import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface TabItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface ResponsiveTabNavProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: any) => void;
}

/**
 * Componente de navegação responsivo para abas
 * - Desktop (lg+): Exibe todas as abas em linha horizontal com scroll
 * - Tablet (md): Exibe abas em linha com scroll
 * - Mobile (sm): Exibe apenas a aba ativa em um dropdown
 */
export function ResponsiveTabNav({ tabs, activeTab, onTabChange }: ResponsiveTabNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeTabLabel = tabs.find(t => t.key === activeTab)?.label || "Menu";
  const activeTabIcon = tabs.find(t => t.key === activeTab)?.icon;

  return (
    <div className="w-full">
      {/* Mobile Dropdown (sm only) */}
      <div className="lg:hidden">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-foreground hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              {activeTabIcon}
              <span className="font-medium text-sm truncate">{activeTabLabel}</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    onTabChange(tab.key);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors border-b border-border last:border-b-0 ${
                    activeTab === tab.key
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Grid 2 colunas com scroll vertical */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-1 p-2 rounded-xl bg-secondary/40 border border-border max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
