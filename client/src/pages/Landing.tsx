import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import YouTubeCard from "@/components/YouTubeCard";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/PxxmnrVLfupqXVFw.png";
const PEDRO_AVATAR_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/fHkVTuSmLcECPtYo.png";

const INSTITUTION_LOGOS = [
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/ZrxNxBNzXqKPHLxE.png", alt: "UNIRIO" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/kWjpjpNLVxTxUXVV.png", alt: "Medicina" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/kWjpjpNLVxTxUXVV.png", alt: "Farmacologia" },
];

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[60%_40%] gap-8 lg:gap-12 items-start min-h-screen py-12">
          
          {/* ═══ LEFT SIDE ═══ */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Avatar + Título (horizontal) */}
            <div className="flex items-center gap-6">
              <motion.img
                src={PEDRO_AVATAR_URL}
                alt="Professor Pedro"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-orange-500 shadow-2xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring" }}
              />
              
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <span className="text-orange-500">Conexão</span>
                  <br />
                  <span className="text-white">em Farmacologia</span>
                </h1>
              </div>
            </div>

            {/* Quadro Amarelo */}
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-2xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                Professor Pedro Barga
                <br />
                Farmacologia UNIRIO
              </p>
            </motion.div>

            {/* Logotipos */}
            <motion.div
              className="flex items-center justify-start gap-6 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {INSTITUTION_LOGOS.map((logo, idx) => (
                <motion.img
                  key={idx}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-16 sm:h-20 object-contain opacity-80 hover:opacity-100 transition-opacity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                />
              ))}
            </motion.div>

            {/* Texto Gamificado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                Uma experiência gamificada para aprender farmacologia de forma interativa,
                com missões, desafios e um sistema de pontuação que torna o aprendizado mais envolvente.
              </p>
            </motion.div>

            {/* Botão de Login */}
            {!isAuthenticated && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-6"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  Entrar no Sistema
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* ═══ RIGHT SIDE: YouTube ═══ */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <YouTubeCard channelUrl="https://www.youtube.com/@conexaoemciencia-farmacolo9093" />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
