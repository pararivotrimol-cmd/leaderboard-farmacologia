import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, LogIn, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ORANGE = "#F7941D";

export default function SuperAdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.teacherAuth.login.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        localStorage.setItem("sessionToken", result.sessionToken || "");
        toast.success("Acesso de super admin concedido!");
        navigate("/admin");
      } else {
        setError("Email ou senha incorretos");
      }
    },
    onError: (error) => {
      setError(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email e senha são obrigatórios");
      return;
    }

    setIsLoading(true);
    await loginMutation.mutateAsync({
      email: email.toLowerCase(),
      password,
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-orange-500/50 bg-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Lock size={40} className="text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Super <span className="text-orange-500">Admin</span>
              </h1>
              <p className="text-slate-400 text-sm">Acesso Exclusivo</p>
            </div>

            {/* Warning Badge */}
            <div className="mb-6 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-start gap-2">
              <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-300">
                Esta área é restrita apenas para administradores do sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Institucional
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pedro.alexandre@unirio.br"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline mr-2" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <LogIn size={18} className="inline mr-2" />
                    Acessar Painel
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                <a href="/" className="hover:underline" style={{ color: ORANGE }}>
                  Voltar para página inicial
                </a>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
