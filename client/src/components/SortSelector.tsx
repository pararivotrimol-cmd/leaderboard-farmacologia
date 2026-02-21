import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type SortOption = "alphabetical" | "by_pf" | "by_date";

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function SortSelector({ value, onChange, className = "" }: SortSelectorProps) {
  const options: Array<{ value: SortOption; label: string; icon: React.ReactNode }> = [
    { value: "alphabetical", label: "Alfabética (A-Z)", icon: <ArrowUp className="w-4 h-4" /> },
    { value: "by_pf", label: "Por PF (Maior)", icon: <ArrowDown className="w-4 h-4" /> },
    { value: "by_date", label: "Por Data", icon: <ArrowUpDown className="w-4 h-4" /> },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-foreground">Ordenar por:</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortOption)}
        className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Hook para ordenar alunos baseado na opção selecionada
 */
export function useSortStudents(sortOption: SortOption) {
  return (students: Array<{ name: string; xp: number; createdAt?: Date }>) => {
    const sorted = [...students];

    switch (sortOption) {
      case "alphabetical":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "by_pf":
        sorted.sort((a, b) => b.xp - a.xp);
        break;
      case "by_date":
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return sorted;
  };
}
