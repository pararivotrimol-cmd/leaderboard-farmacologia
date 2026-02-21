import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

interface Student {
  id: number;
  name: string;
  xp: number;
  teamId?: number;
  cpf?: string;
  matricula?: string;
  teamName?: string;
}

interface SearchStudentsProps {
  students: Student[];
  onSelect?: (student: Student) => void;
  placeholder?: string;
  showResults?: boolean;
}

export function SearchStudents({
  students,
  onSelect,
  placeholder = "Buscar por nome, CPF ou matrícula...",
  showResults = true,
}: SearchStudentsProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase().trim();

    return students.filter(student => {
      const matchesName = student.name.toLowerCase().includes(lowerQuery);
      const matchesCPF = student.cpf?.replace(/\D/g, "").includes(lowerQuery.replace(/\D/g, ""));
      const matchesMatricula = student.matricula?.toLowerCase().includes(lowerQuery);

      return matchesName || matchesCPF || matchesMatricula;
    });
  }, [query, students]);

  const handleSelect = (student: Student) => {
    setQuery("");
    setIsOpen(false);
    onSelect?.(student);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && showResults && filteredStudents.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {filteredStudents.map(student => (
            <button
              key={student.id}
              onClick={() => handleSelect(student)}
              className="w-full px-4 py-2.5 text-left hover:bg-secondary/80 border-b border-border/50 last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{student.name}</div>
                  <div className="text-xs text-muted-foreground flex gap-2">
                    {student.cpf && <span>CPF: {student.cpf}</span>}
                    {student.matricula && <span>Mat: {student.matricula}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-sm text-primary">{student.xp.toFixed(1)} PF</div>
                  {student.teamName && <div className="text-xs text-muted-foreground">{student.teamName}</div>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && showResults && filteredStudents.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground text-sm">
          Nenhum aluno encontrado
        </div>
      )}
    </div>
  );
}
