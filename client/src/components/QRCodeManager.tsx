import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { QrCode, Trash2, ToggleLeft, ToggleRight, Download } from "lucide-react";
import QRCode from "qrcode";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

interface QRCodeManagerProps {
  classId: number;
}

export default function QRCodeManager({ classId }: QRCodeManagerProps) {

  const [dayOfWeek, setDayOfWeek] = useState<number>(2); // Terça por padrão
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("12:00");
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQRPreview, setShowQRPreview] = useState(false);

  // Queries e mutations
  const { data: sessions, refetch } = trpc.qrcode.getSessionsByClass.useQuery(
    { classId },
    { enabled: classId > 0 }
  );

  const createSessionMutation = trpc.qrcode.createSession.useMutation({
    onSuccess: async (data) => {
      alert("✅ Sessão criada com sucesso!");

      // Gerar QR Code
      if (data.qrCodeData) {
        try {
          const qrUrl = await QRCode.toDataURL(JSON.stringify(data.qrCodeData));
          setQrCodeUrl(qrUrl);
          setShowQRPreview(true);
        } catch (err) {
          console.error("Erro ao gerar QR Code:", err);
        }
      }

      refetch();
    },
    onError: (error) => {
      alert("❌ Erro: " + (error.message || "Erro ao criar sessão"));
    },
  });

  const toggleSessionMutation = trpc.qrcode.toggleSession.useMutation({
    onSuccess: () => {
      alert("✅ Sessão atualizada com sucesso!");
      refetch();
    },
  });

  const deleteSessionMutation = trpc.qrcode.deleteSession.useMutation({
    onSuccess: () => {
      alert("✅ Sessão deletada com sucesso!");
      refetch();
    },
  });

  const handleExportReport = async () => {
    try {
      const result = await trpc.qrcode.exportAttendanceReport.useQuery({ classId }).data;
      if (result) {
        // Criar arquivo CSV
        const element = document.createElement("a");
        const file = new Blob([result.csv], { type: "text/csv" });
        element.href = URL.createObjectURL(file);
        element.download = result.filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        alert("✅ Relatório exportado com sucesso!");
      }
    } catch (error) {
      alert("❌ Erro ao exportar relatório");
    }
  };

  const handleCreateSession = async () => {
    if (!startTime || !endTime) {
        alert("❌ Erro: Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      await createSessionMutation.mutateAsync({
        classId,
        dayOfWeek,
        startTime,
        endTime,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qrcode_${dayOfWeek}_${startTime}-${endTime}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("✅ QR Code baixado com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Formulário para criar nova sessão */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
          <QrCode size={24} className="text-primary" />
          Criar Nova Sessão de QR Code
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dia da semana */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Dia da Semana
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* Horário inicial */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Horário Inicial
            </label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-background text-foreground border-border"
            />
          </div>

          {/* Horário final */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Horário Final
            </label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-background text-foreground border-border"
            />
          </div>

          {/* Botão criar */}
          <div className="flex items-end">
            <Button
              onClick={handleCreateSession}
              disabled={loading || createSessionMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Gerando..." : "Gerar QR Code"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview do QR Code */}
      {showQRPreview && qrCodeUrl && (
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-bold mb-4 text-foreground">
            Preview do QR Code
          </h3>
          <div className="flex flex-col items-center gap-4">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-64 h-64 border-2 border-primary rounded-lg p-2 bg-white"
            />
            <Button
              onClick={handleDownloadQRCode}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
            >
              <Download size={18} />
              Baixar QR Code
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de sessões ativas */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold mb-4 text-foreground">
          Sessões Ativas
        </h3>

        {!sessions || sessions.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhuma sessão criada ainda. Crie uma nova para começar!
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition"
              >
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    {DAYS_OF_WEEK.find((d) => d.value === session.dayOfWeek)
                      ?.label || "Desconhecido"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.startTime} - {session.endTime}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle ativo/inativo */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleSessionMutation.mutate({
                        sessionId: session.id,
                        isActive: !session.isActive,
                      })
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {session.isActive ? (
                      <ToggleRight size={20} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={20} className="text-gray-400" />
                    )}
                  </Button>

                  {/* Deletar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      deleteSessionMutation.mutate({ sessionId: session.id })
                    }
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Botão exportar relatório */}
      <Button
        onClick={handleExportReport}
        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center justify-center gap-2"
      >
        <Download size={18} />
        Exportar Relatório de Presença (CSV)
      </Button>
    </div>
  );
}
