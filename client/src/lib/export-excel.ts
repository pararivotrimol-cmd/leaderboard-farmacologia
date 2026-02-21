/**
 * Funções para exportar dados em formato Excel
 */

interface StudentExportData {
  nome: string;
  pf: number;
  equipe: string;
  turma: string;
  cpf?: string;
  matricula?: string;
}

/**
 * Exporta lista de alunos em formato CSV (compatível com Excel)
 */
export function exportStudentsToCSV(students: StudentExportData[], filename: string = "alunos.csv") {
  // Headers
  const headers = ["Nome", "PF", "Equipe", "Turma", "CPF", "Matrícula"];

  // Rows
  const rows = students.map(s => [
    `"${s.nome.replace(/"/g, '""')}"`, // Escape quotes
    s.pf.toFixed(1),
    `"${s.equipe.replace(/"/g, '""')}"`,
    `"${s.turma.replace(/"/g, '""')}"`,
    s.cpf ? `"${s.cpf}"` : "",
    s.matricula ? `"${s.matricula}"` : "",
  ]);

  // Combine
  const csv = [
    headers.join(","),
    ...rows.map(row => row.join(",")),
  ].join("\n");

  // Download
  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

/**
 * Exporta lista de alunos em formato XLSX (Excel moderno)
 * Requer biblioteca xlsx instalada
 */
export async function exportStudentsToXLSX(
  students: StudentExportData[],
  filename: string = "alunos.xlsx"
) {
  try {
    // Importar dinamicamente para evitar erro se não estiver instalado
    const XLSX = await import("xlsx");

    // Preparar dados
    const data = students.map(s => ({
      "Nome": s.nome,
      "PF": s.pf,
      "Equipe": s.equipe,
      "Turma": s.turma,
      "CPF": s.cpf || "",
      "Matrícula": s.matricula || "",
    }));

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alunos");

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // Nome
      { wch: 8 },  // PF
      { wch: 15 }, // Equipe
      { wch: 15 }, // Turma
      { wch: 15 }, // CPF
      { wch: 15 }, // Matrícula
    ];
    ws["!cols"] = colWidths;

    // Download
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error("Erro ao exportar para XLSX:", error);
    // Fallback para CSV
    exportStudentsToCSV(students, filename.replace(".xlsx", ".csv"));
  }
}

/**
 * Função auxiliar para fazer download de arquivo
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta lista de alunos por turma
 */
export async function exportStudentsByClass(
  classData: {
    name: string;
    students: StudentExportData[];
  },
  format: "csv" | "xlsx" = "xlsx"
) {
  const timestamp = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
  const filename = `${classData.name}_alunos_${timestamp}.${format}`;

  if (format === "xlsx") {
    await exportStudentsToXLSX(classData.students, filename);
  } else {
    exportStudentsToCSV(classData.students, filename);
  }
}

/**
 * Exporta relatório completo com todas as turmas
 */
export async function exportCompleteReport(
  classes: Array<{
    name: string;
    students: StudentExportData[];
  }>,
  format: "csv" | "xlsx" = "xlsx"
) {
  if (format === "xlsx") {
    try {
      const XLSX = await import("xlsx");

      const wb = XLSX.utils.book_new();

      // Adicionar sheet para cada turma
      for (const classData of classes) {
        const data = classData.students.map(s => ({
          "Nome": s.nome,
          "PF": s.pf,
          "Equipe": s.equipe,
          "CPF": s.cpf || "",
          "Matrícula": s.matricula || "",
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const colWidths = [
          { wch: 25 },
          { wch: 8 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
        ];
        ws["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, classData.name.slice(0, 31)); // Excel limita nome da sheet a 31 caracteres
      }

      const timestamp = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
      XLSX.writeFile(wb, `relatorio_completo_${timestamp}.xlsx`);
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
    }
  }
}
