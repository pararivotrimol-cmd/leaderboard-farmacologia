import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, QrCode, Copy, Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function AttendanceQRCodeManager() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [classId] = useState(1); // Farmacologia 1
  const [qrCode, setQrCode] = useState<{
    token: string;
    qrImageUrl: string;
    expiresAt: Date;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateQRMutation = trpc.attendance.generateQRCode.useMutation();

  const handleGenerateQRCode = async () => {
    setIsGenerating(true);
    try {
      const result = await generateQRMutation.mutateAsync({
        classId,
        classDate: selectedDate,
      });

      setQrCode({
        token: result.token,
        qrImageUrl: result.qrImageUrl,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      console.error("Erro ao gerar QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement("a");
      link.href = qrCode.qrImageUrl;
      link.download = `presenca-${selectedDate}.png`;
      link.click();
    }
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const isTuesday = new Date(selectedDate).getDay() === 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gerar QR Code de Presença</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gere um QR code diário para que os alunos registrem presença na aula
        </p>
      </div>

      {/* Seletor de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode size={18} />
            Configurar QR Code
          </CardTitle>
          <CardDescription>
            Selecione a data da aula (terças-feiras de 8h às 12h)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data da Aula</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
            <div className="text-xs text-muted-foreground">
              {isToday && (
                <Badge variant="default" className="mt-2">
                  Hoje
                </Badge>
              )}
              {!isTuesday && (
                <div className="text-orange-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Esta data não é uma terça-feira
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleGenerateQRCode}
            disabled={isGenerating || !isTuesday}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Gerando...
              </>
            ) : (
              <>
                <QrCode size={16} className="mr-2" />
                Gerar QR Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* QR Code Gerado */}
      {qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✅ QR Code Gerado com Sucesso
              </CardTitle>
              <CardDescription>
                Expira em: {new Date(qrCode.expiresAt).toLocaleTimeString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Imagem QR Code */}
              <div className="flex justify-center">
                <motion.img
                  src={qrCode.qrImageUrl}
                  alt="QR Code de Presença"
                  className="w-64 h-64 border-2 border-border rounded-lg p-2 bg-white"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                />
              </div>

              {/* Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Token (para referência)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrCode.token}
                    readOnly
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-muted text-xs font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    {copied ? "✓ Copiado" : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={downloadQRCode}
                  className="w-full"
                >
                  <Download size={16} className="mr-2" />
                  Baixar Imagem
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateQRCode}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Gerar Novo
                </Button>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                <strong>Como usar:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Exiba este QR code na sala de aula</li>
                  <li>Os alunos escaneiam com seus celulares</li>
                  <li>A presença é registrada automaticamente</li>
                  <li>O QR code expira em 4 horas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Estado Vazio */}
      {!qrCode && (
        <Card className="border-dashed">
          <CardContent className="pt-8 text-center">
            <QrCode size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Clique em "Gerar QR Code" para criar um novo código para a aula de hoje
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
