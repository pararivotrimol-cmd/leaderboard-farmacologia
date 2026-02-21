import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Camera, CheckCircle, AlertCircle, Loader2, X, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function PresencaQRCode() {
  const [, setLocation] = useLocation();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const utils = trpc.useUtils();

  // Get session token from localStorage
  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      toast.error("Você precisa estar logado para registrar presença");
      setLocation("/");
      return;
    }
    setSessionToken(token);
  }, [setLocation]);

  // Get attendance history
  const { data: attendanceHistory, isLoading: historyLoading } = trpc.attendance.getMyAttendance.useQuery(
    undefined,
    { enabled: !!sessionToken }
  );

  // Mutation to check in with QR code
  const checkInMutation = trpc.attendance.checkInWithQRCode.useMutation({
    onSuccess: () => {
      toast.success("✓ Presença registrada com sucesso!");
      setQrCode("");
      setCheckInSuccess(true);
      setShowCamera(false);
      utils.attendance.getMyAttendance.invalidate();
      stopCamera();
      setTimeout(() => setCheckInSuccess(false), 3000);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao registrar presença");
    },
  });

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
      toast.error("Erro ao acessar câmera");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Handle manual QR code input
  const handleCheckIn = async () => {
    if (!qrCode.trim() || !sessionToken) {
      toast.error("Digite o código QR");
      return;
    }

    setLoading(true);
    try {
      await checkInMutation.mutateAsync({
        token: qrCode.trim(),
        classDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Erro ao registrar presença:", error);
    }
    setLoading(false);
  };

  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/leaderboard")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <h1 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
            <Camera size={20} className="text-primary" />
            Presença QR Code
          </h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="border border-border rounded-lg p-6" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">Escanear QR Code</h2>

              {!showCamera ? (
                <div className="space-y-4">
                  {/* Manual Input */}
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Código QR (manual)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        placeholder="Cole o código QR aqui..."
                        className="flex-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCheckIn();
                        }}
                      />
                      <button
                        onClick={handleCheckIn}
                        disabled={!qrCode.trim() || loading}
                        className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : "Confirmar"}
                      </button>
                    </div>
                  </div>

                  {/* Camera Button */}
                  <button
                    onClick={startCamera}
                    className="w-full py-3 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Camera size={18} />
                    Abrir Câmera
                  </button>

                  {/* Success Message */}
                  {checkInSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                    >
                      <CheckCircle size={20} className="text-green-500" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">Presença Registrada!</p>
                        <p className="text-sm text-green-600 dark:text-green-300">Seu check-in foi confirmado</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Camera Feed */}
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={240}
                      className="hidden"
                    />
                    {/* QR Code Frame Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg" />
                    </div>
                  </div>

                  {/* Camera Controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={stopCamera}
                      className="flex-1 py-2.5 rounded-lg border border-border bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Fechar
                    </button>
                  </div>

                  {cameraError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {cameraError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Attendance History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="border border-border rounded-lg p-6" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">Histórico</h2>

              {historyLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                </div>
              ) : attendanceHistory && attendanceHistory.attendance && attendanceHistory.attendance.length > 0 ? (
                <div className="space-y-2">
                  {attendanceHistory.attendance.slice(0, 10).map((record: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <CheckCircle size={16} className="text-green-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground font-medium truncate">
                          {new Date(record.classDate).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(record.classDate).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {attendanceHistory.attendance.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{attendanceHistory.attendance.length - 10} mais registros
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle size={24} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma presença registrada</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5"
        >
          <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-primary" />
            Como funciona
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• O professor gera um QR code único para cada aula</li>
            <li>• Você tem até 15 minutos após o início da aula para registrar presença</li>
            <li>• Escaneie o código com a câmera do seu celular ou digite manualmente</li>
            <li>• Sua presença será registrada automaticamente no sistema</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
