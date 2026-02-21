import { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { exportStudentsToCSV, exportStudentsToXLSX } from "@/lib/export-excel";
import { toast } from "sonner";

interface Student {
  id: number;
  name: string;
  xp: number;
  teamId?: number;
  teamName?: string;
  cpf?: string;
  matricula?: string;
}

interface ExportButtonProps {
  students: Student[];
  filename?: string;
  label?: string;
  className?: string;
}

export function ExportButton({
  students,
  filename = "alunos",
  label = "Exportar",
  className = "",
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExportCSV = async () => {
    try {
      setIsLoading(true);
      const data = students.map(s => ({
        nome: s.name,
        pf: s.xp,
        equipe: s.teamName || "—",
        turma: "—",
        cpf: s.cpf || "",
        matricula: s.matricula || "",
      }));

      exportStudentsToCSV(data, `${filename}.csv`);
      toast.success(`${students.length} alunos exportados em CSV`);
      setShowMenu(false);
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar CSV");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportXLSX = async () => {
    try {
      setIsLoading(true);
      const data = students.map(s => ({
        nome: s.name,
        pf: s.xp,
        equipe: s.teamName || "—",
        turma: "—",
        cpf: s.cpf || "",
        matricula: s.matricula || "",
      }));

      await exportStudentsToXLSX(data, `${filename}.xlsx`);
      toast.success(`${students.length} alunos exportados em Excel`);
      setShowMenu(false);
    } catch (error) {
      console.error("Erro ao exportar XLSX:", error);
      toast.error("Erro ao exportar Excel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isLoading || students.length === 0}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {label}
      </button>

      {showMenu && !isLoading && (
        <div className="absolute right-0 mt-2 w-48 bg-secondary border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={handleExportXLSX}
            className="w-full px-4 py-2.5 text-left hover:bg-secondary/80 border-b border-border/50 flex items-center gap-2 text-sm text-foreground transition-colors"
          >
            <FileText className="w-4 h-4" />
            Exportar como Excel (.xlsx)
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full px-4 py-2.5 text-left hover:bg-secondary/80 flex items-center gap-2 text-sm text-foreground transition-colors"
          >
            <FileText className="w-4 h-4" />
            Exportar como CSV (.csv)
          </button>
        </div>
      )}

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
