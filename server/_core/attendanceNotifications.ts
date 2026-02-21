import { notifyOwner } from "./notification";

export async function notifyAttendanceCheckIn(
  studentName: string,
  className: string,
  classDate: string,
  status: "valid" | "invalid" | "manual"
) {
  const statusLabel = {
    valid: "✓ Confirmada",
    invalid: "✗ Fora do prazo",
    manual: "📝 Manual",
  }[status];

  const title = `Presença Registrada - ${className}`;
  const content = `${studentName} registrou presença ${statusLabel} em ${new Date(classDate).toLocaleDateString("pt-BR")}`;

  try {
    await notifyOwner({ title, content });
  } catch (error) {
    console.error("Erro ao enviar notificação de presença:", error);
  }
}

export async function notifyAttendanceSummary(
  className: string,
  classDate: string,
  totalStudents: number,
  presentCount: number,
  absentCount: number
) {
  const frequency = ((presentCount / totalStudents) * 100).toFixed(1);
  const title = `Resumo de Presença - ${className}`;
  const content = `Aula de ${new Date(classDate).toLocaleDateString("pt-BR")}: ${presentCount}/${totalStudents} presentes (${frequency}%) - ${absentCount} faltas`;

  try {
    await notifyOwner({ title, content });
  } catch (error) {
    console.error("Erro ao enviar resumo de presença:", error);
  }
}

export async function notifyLowAttendanceWarning(
  studentName: string,
  className: string,
  frequency: number,
  attendanceThreshold: number = 75
) {
  if (frequency < attendanceThreshold) {
    const title = `Alerta de Frequência Baixa - ${studentName}`;
    const content = `${studentName} está com ${frequency.toFixed(1)}% de frequência em ${className}. Mínimo necessário: ${attendanceThreshold}%`;

    try {
      await notifyOwner({ title, content });
    } catch (error) {
      console.error("Erro ao enviar alerta de frequência:", error);
    }
  }
}
