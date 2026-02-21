/**
 * Helper para enviar notificações automáticas relacionadas ao método Jigsaw
 */
import { notifyOwner } from "./notification";

export interface JigsawNotificationPayload {
  type: "member_added_expert" | "member_added_jigsaw" | "coordinator_changed" | "scores_assigned";
  studentName: string;
  groupName: string;
  topicName?: string;
  coordinatorName?: string;
  presentationScore?: number;
  participationScore?: number;
  totalScore?: number;
}

/**
 * Enviar notificação de Jigsaw ao dono do projeto
 * Usado para rastrear atividades importantes
 */
export async function sendJigsawNotification(payload: JigsawNotificationPayload): Promise<boolean> {
  try {
    let title = "";
    let content = "";

    switch (payload.type) {
      case "member_added_expert":
        title = "✅ Aluno Adicionado a Grupo de Especialistas";
        content = `${payload.studentName} entrou no grupo "${payload.groupName}" (${payload.topicName})`;
        break;

      case "member_added_jigsaw":
        title = "✅ Aluno Adicionado a Grupo Jigsaw";
        content = `${payload.studentName} entrou no grupo Jigsaw "${payload.groupName}"`;
        break;

      case "coordinator_changed":
        title = "👤 Coordenador Alterado";
        content = `${payload.coordinatorName} agora é coordenador do grupo "${payload.groupName}"`;
        break;

      case "scores_assigned":
        title = "🏆 Notas Atribuídas";
        content = `Notas atribuídas ao grupo "${payload.groupName}": Apresentação ${payload.presentationScore}, Participação ${payload.participationScore} (Total: ${payload.totalScore})`;
        break;
    }

    if (!title || !content) return false;

    return await notifyOwner({ title, content });
  } catch (error) {
    console.error("Erro ao enviar notificação Jigsaw:", error);
    return false;
  }
}

/**
 * Enviar notificação em lote para múltiplas ações
 */
export async function sendBatchJigsawNotifications(
  payloads: JigsawNotificationPayload[]
): Promise<boolean[]> {
  return Promise.all(payloads.map(payload => sendJigsawNotification(payload)));
}
