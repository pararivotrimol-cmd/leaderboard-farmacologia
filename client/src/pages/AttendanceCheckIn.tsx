import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QrCode, Camera, CheckCircle, AlertCircle } from "lucide-react";
import jsQR from "jsqr";

interface CheckInResult {
  success: boolean;
  message: string;
  type: "success" | "error" | "warning";
}

export default function AttendanceCheckIn() {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [sessionId, setSessionId] = useState<string>("");
  const [memberId, setMemberId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const checkInMutation = trpc.qrcode.checkIn.useMutation({
    onSuccess: () => {
      setResult({
        success: true,
        message: "✅ Presença registrada com sucesso!",
        type: "success",
      });
      // Limpar após 3 segundos
      setTimeout(() => {
        setResult(null);
        setSessionId("");
        setMemberId("");
        setClassId("");
      }, 3000);
    },
    onError: (error) => {
      setResult({
        success: false,
        message: `❌ Erro: ${error.message || "Erro ao registrar presença"}`,
        type: "error",
      });
    },
  });

  // Iniciar câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (err) {
      alert("❌ Erro ao acessar câmera: " + (err as Error).message);
    }
  };

  // Parar câmera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setScanning(false);
    }
  };

  // Escanear QR Code
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    context.drawImage(videoRef.current, 0, 0);

    const imageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      try {
        const data = JSON.parse(code.data);
        setSessionId(data.sessionId);
        setClassId(data.classId);
        stopCamera();
        alert("✅ QR Code lido com sucesso!");
      } catch (err) {
        console.error("Erro ao parsear QR Code:", err);
      }
    }
  };

  // Loop de escaneamento
  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(scanQRCode, 500);
    return () => clearInterval(interval);
  }, [scanning]);

  const handleCheckIn = async () => {
    if (!sessionId || !memberId || !classId) {
      alert("❌ Preencha todos os campos");
      return;
    }

    await checkInMutation.mutateAsync({
      sessionId: parseInt(sessionId),
      memberId: parseInt(memberId),
      classId: parseInt(classId),
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <QrCode size={32} className="text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Registro de Presença
            </h1>
          </div>
          <p className="text-muted-foreground">
            Escaneie o QR Code ou insira os dados manualmente
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === "camera" ? "default" : "outline"}
            onClick={() => {
              setMode("camera");
              setResult(null);
            }}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            Câmera
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            onClick={() => {
              setMode("manual");
              stopCamera();
              setResult(null);
            }}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <QrCode size={18} />
            Manual
          </Button>
        </div>

        {/* Result message */}
        {result && (
          <Card
            className={`p-4 mb-6 flex items-center gap-3 ${
              result.type === "success"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {result.type === "success" ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <AlertCircle className="text-red-600" size={24} />
            )}
            <span
              className={
                result.type === "success" ? "text-green-700" : "text-red-700"
              }
            >
              {result.message}
            </span>
          </Card>
        )}

        {/* Camera mode */}
        {mode === "camera" && (
          <Card className="p-6 bg-card border-border">
            {!scanning ? (
              <div className="text-center">
                <Camera size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Clique para ativar a câmera e escanear o QR Code
                </p>
                <Button
                  onClick={startCamera}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Ativar Câmera
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full aspect-square object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="flex-1"
                  >
                    Parar
                  </Button>
                  <Button
                    onClick={scanQRCode}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Escanear Agora
                  </Button>
                </div>

                {/* Dados do QR Code lido */}
                {sessionId && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground">
                        ID da Sessão
                      </label>
                      <Input
                        value={sessionId}
                        readOnly
                        className="bg-background text-foreground border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground">
                        ID da Turma
                      </label>
                      <Input
                        value={classId}
                        readOnly
                        className="bg-background text-foreground border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-foreground">
                        ID do Aluno (Matrícula)
                      </label>
                      <Input
                        type="number"
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                        placeholder="Digite sua matrícula"
                        className="bg-background text-foreground border-border"
                      />
                    </div>
                    <Button
                      onClick={handleCheckIn}
                      disabled={checkInMutation.isPending}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {checkInMutation.isPending
                        ? "Registrando..."
                        : "Registrar Presença"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Manual mode */}
        {mode === "manual" && (
          <Card className="p-6 bg-card border-border space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                ID da Sessão
              </label>
              <Input
                type="number"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Digite o ID da sessão"
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                ID da Turma
              </label>
              <Input
                type="number"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                placeholder="Digite o ID da turma"
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                ID do Aluno (Matrícula)
              </label>
              <Input
                type="number"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="Digite sua matrícula"
                className="bg-background text-foreground border-border"
              />
            </div>

            <Button
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {checkInMutation.isPending
                ? "Registrando..."
                : "Registrar Presença"}
            </Button>
          </Card>
        )}

        {/* Info */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>ℹ️ Informação:</strong> Você pode escanear o QR Code fornecido
            pelo professor ou inserir os dados manualmente. O registro será feito
            apenas durante o horário de aula.
          </p>
        </Card>
      </div>
    </div>
  );
}
