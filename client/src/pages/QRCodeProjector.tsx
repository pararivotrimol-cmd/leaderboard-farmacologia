/**
 * QR Code Projector — Conexão em Farmacologia
 * Full-screen QR Code display for classroom TV projection
 * Teacher generates QR code, students scan to check-in
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Users, Clock, CheckCircle, Maximize, Minimize,
  RefreshCw, ArrowLeft, Wifi, WifiOff, FlaskConical, X
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import QRCode from "qrcode";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/TYglakFwBNwpBXzT.png";
const ORANGE = "#F7941D";
const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";
const EMERALD = "#10B981";

interface QRSession {
  id: number;
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  qrCodeData: any;
}

export default function QRCodeProjector() {
  const [, setLocation] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [selectedClassId] = useState(1); // Default: Farmacologia 1
  const [activeSession, setActiveSession] = useState<QRSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check teacher auth
  const teacherToken = localStorage.getItem("teacherSessionToken");

  // Get existing sessions
  const { data: sessions, refetch: refetchSessions } = trpc.qrcode.getSessionsByClass.useQuery(
    { classId: selectedClassId },
    { enabled: !!teacherToken }
  );

  // Create session mutation
  const createSessionMutation = trpc.qrcode.createSession.useMutation({
    onSuccess: async (data) => {
      if (data.qrCodeData) {
        await generateQRImage(data.qrCodeData);
      }
      refetchSessions();
      setShowSetup(false);
    },
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate QR Code image from data
  const generateQRImage = useCallback(async (qrData: any) => {
    try {
      // The QR data includes the check-in URL with session info
      const checkInUrl = `${window.location.origin}/attendance/check-in?s=${qrData.sessionId}&c=${qrData.classId}`;
      const dataUrl = await QRCode.toDataURL(checkInUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: "#0A1628",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  }, []);

  // Auto-select active session on load
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const active = sessions.find((s: QRSession) => s.isActive);
      if (active) {
        setActiveSession(active);
        if (active.qrCodeData) {
          generateQRImage(active.qrCodeData);
          setShowSetup(false);
        }
      }
    }
  }, [sessions, generateQRImage]);

  // Create new session for today
  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const now = new Date();
      await createSessionMutation.mutateAsync({
        classId: selectedClassId,
        dayOfWeek: now.getDay(),
        startTime: "08:00",
        endTime: "12:00",
      });
    } catch (err) {
      console.error("Error creating session:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  };

  const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // If not authenticated, redirect
  if (!teacherToken) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK_BG }}>
        <div className="text-center">
          <QrCode size={48} style={{ color: ORANGE }} className="mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Faça login como professor para acessar</p>
          <button
            onClick={() => setLocation("/professor/login")}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: ORANGE }}
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: DARK_BG }}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 2xl:px-8 2xl:py-5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: CARD_BG }}
      >
        <div className="flex items-center gap-3 2xl:gap-5">
          <button
            onClick={() => setLocation("/admin")}
            className="flex items-center gap-2 text-sm 2xl:text-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <ArrowLeft size={16} className="2xl:w-5 2xl:h-5" />
            Voltar
          </button>
          <div className="h-5 w-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-2 2xl:gap-3">
            <img src={LOGO_URL} alt="Logo" className="w-7 h-7 2xl:w-10 2xl:h-10 object-contain" />
            <span className="text-sm 2xl:text-xl font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              QR Code Presença
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 2xl:gap-5">
          {/* Live clock */}
          <div className="flex items-center gap-2 2xl:gap-3">
            <Clock size={16} className="2xl:w-5 2xl:h-5" style={{ color: ORANGE }} />
            <span className="font-mono text-sm 2xl:text-xl text-white">{formatTime(currentTime)}</span>
          </div>

          {/* Checked in count */}
          <div className="flex items-center gap-2 2xl:gap-3 px-3 py-1.5 2xl:px-5 2xl:py-2.5 rounded-lg" style={{ backgroundColor: "rgba(16,185,129,0.15)" }}>
            <Users size={16} className="2xl:w-5 2xl:h-5" style={{ color: EMERALD }} />
            <span className="font-mono text-sm 2xl:text-xl font-semibold" style={{ color: EMERALD }}>
              {checkedInCount} presentes
            </span>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 2xl:p-3 rounded-lg transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            {isFullscreen ? (
              <Minimize size={18} className="2xl:w-6 2xl:h-6 text-white" />
            ) : (
              <Maximize size={18} className="2xl:w-6 2xl:h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 2xl:p-12">
        <AnimatePresence mode="wait">
          {showSetup ? (
            /* Setup View - Create or select session */
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg 2xl:max-w-2xl"
            >
              <div className="text-center mb-8 2xl:mb-12">
                <div className="w-20 h-20 2xl:w-28 2xl:h-28 rounded-2xl mx-auto mb-4 2xl:mb-6 flex items-center justify-center" style={{ backgroundColor: "rgba(247,148,29,0.15)" }}>
                  <QrCode size={40} className="2xl:w-14 2xl:h-14" style={{ color: ORANGE }} />
                </div>
                <h1 className="text-2xl 2xl:text-4xl font-bold text-white mb-2 2xl:mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Projetor de QR Code
                </h1>
                <p className="text-sm 2xl:text-xl" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {formatDate(currentTime)}
                </p>
              </div>

              {/* Existing sessions */}
              {sessions && sessions.filter((s: QRSession) => s.isActive).length > 0 && (
                <div className="mb-6 2xl:mb-8">
                  <p className="text-xs 2xl:text-base uppercase tracking-wider mb-3 2xl:mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Sessões ativas
                  </p>
                  <div className="space-y-2 2xl:space-y-3">
                    {sessions.filter((s: QRSession) => s.isActive).map((session: QRSession) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setActiveSession(session);
                          if (session.qrCodeData) {
                            generateQRImage(session.qrCodeData);
                          }
                          setShowSetup(false);
                        }}
                        className="w-full p-4 2xl:p-6 rounded-xl text-left transition-all hover:scale-[1.01]"
                        style={{ backgroundColor: CARD_BG, border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white font-semibold 2xl:text-xl">
                              {DAYS[session.dayOfWeek]}
                            </span>
                            <span className="text-sm 2xl:text-lg ml-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                              {session.startTime} — {session.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 2xl:w-3 2xl:h-3 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs 2xl:text-sm" style={{ color: EMERALD }}>Ativa</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create new session */}
              <button
                onClick={handleCreateSession}
                disabled={isCreating}
                className="w-full py-4 2xl:py-6 rounded-xl font-semibold text-white flex items-center justify-center gap-3 transition-all hover:opacity-90 disabled:opacity-50 2xl:text-xl"
                style={{ backgroundColor: ORANGE }}
              >
                {isCreating ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <RefreshCw size={20} className="2xl:w-7 2xl:h-7" />
                  </motion.div>
                ) : (
                  <>
                    <QrCode size={20} className="2xl:w-7 2xl:h-7" />
                    Criar Nova Sessão de Presença
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            /* QR Code Display View - Optimized for TV projection */
            <motion.div
              key="display"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              {/* Title */}
              <div className="text-center mb-6 2xl:mb-10">
                <h1 className="text-3xl 2xl:text-6xl font-bold text-white mb-2 2xl:mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Escaneie para registrar presença
                </h1>
                <p className="text-base 2xl:text-2xl" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Aponte a câmera do celular para o QR Code abaixo
                </p>
              </div>

              {/* QR Code Container */}
              <div className="relative">
                {/* Glow effect */}
                <div
                  className="absolute inset-0 blur-3xl opacity-20 rounded-3xl"
                  style={{ backgroundColor: ORANGE }}
                />

                {/* QR Code */}
                <motion.div
                  className="relative p-6 2xl:p-10 rounded-3xl"
                  style={{ backgroundColor: "white" }}
                  animate={{ boxShadow: ["0 0 30px rgba(247,148,29,0.2)", "0 0 60px rgba(247,148,29,0.3)", "0 0 30px rgba(247,148,29,0.2)"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code de Presença"
                      className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 2xl:w-[500px] 2xl:h-[500px]"
                    />
                  ) : (
                    <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 2xl:w-[500px] 2xl:h-[500px] flex items-center justify-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <FlaskConical size={48} style={{ color: ORANGE }} />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Session info */}
              <div className="mt-6 2xl:mt-10 flex items-center gap-6 2xl:gap-10">
                <div className="flex items-center gap-2 2xl:gap-3">
                  <Clock size={18} className="2xl:w-6 2xl:h-6" style={{ color: ORANGE }} />
                  <span className="text-sm 2xl:text-xl text-white">
                    {activeSession?.startTime} — {activeSession?.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 2xl:gap-3">
                  <div className="w-2 h-2 2xl:w-3 2xl:h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm 2xl:text-xl" style={{ color: EMERALD }}>
                    Sessão ativa
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 2xl:mt-10 flex items-center gap-3 2xl:gap-5">
                <button
                  onClick={() => setShowSetup(true)}
                  className="px-4 py-2 2xl:px-6 2xl:py-3 rounded-lg text-sm 2xl:text-lg font-medium transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <X size={16} className="2xl:w-5 2xl:h-5 inline mr-2" />
                  Voltar
                </button>
                <button
                  onClick={handleCreateSession}
                  className="px-4 py-2 2xl:px-6 2xl:py-3 rounded-lg text-sm 2xl:text-lg font-medium transition-colors"
                  style={{ color: ORANGE, backgroundColor: "rgba(247,148,29,0.1)" }}
                >
                  <RefreshCw size={16} className="2xl:w-5 2xl:h-5 inline mr-2" />
                  Gerar Novo QR
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar - branding */}
      <div
        className="px-4 py-3 2xl:px-8 2xl:py-5 border-t flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: CARD_BG }}
      >
        <div className="flex items-center gap-2 2xl:gap-3">
          <img src={LOGO_URL} alt="Logo" className="w-6 h-6 2xl:w-8 2xl:h-8 object-contain" />
          <span className="text-xs 2xl:text-base" style={{ color: "rgba(255,255,255,0.3)" }}>
            Conexão em Farmacologia — UNIRIO
          </span>
        </div>
        <div className="flex items-center gap-2 2xl:gap-3">
          <Wifi size={14} className="2xl:w-5 2xl:h-5" style={{ color: EMERALD }} />
          <span className="text-xs 2xl:text-base" style={{ color: "rgba(255,255,255,0.3)" }}>
            {formatDate(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
