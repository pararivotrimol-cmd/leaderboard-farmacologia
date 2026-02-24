import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { KeyRound, CheckCircle2, XCircle, Loader2, Eye, EyeOff, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const ORANGE = "#F7941D";
const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/TYglakFwBNwpBXzT.png";

export default function TeacherResetPassword() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  const resetPasswordMutation = trpc.teacherAuth.resetPassword.useMutation();

  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setTokenMissing(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordMutation.mutateAsync({
        token,
        newPassword,
      });

      if (result.success) {
        setSuccess(true);
        toast.success("Senha redefinida com sucesso!");
        setTimeout(() => navigate("/professor/login"), 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: "Fraca", color: "#ef4444" };
    if (score <= 2) return { level: 2, label: "Razoável", color: "#f59e0b" };
    if (score <= 3) return { level: 3, label: "Boa", color: "#3b82f6" };
    return { level: 4, label: "Forte", color: "#22c55e" };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen landscape-min-h-auto flex flex-col justify-center items-center p-6 sm:p-12" style={{ backgroundColor: "#0A1628" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-xl font-bold text-white">Conexão em Farmacologia</h1>
        </div>

        {/* Card */}
        <div className="rounded-lg p-8" style={{ backgroundColor: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)" }}>
          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Senha Redefinida!</h2>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
              <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto" />
            </div>
          ) : tokenMissing ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                <AlertTriangle size={40} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Token Não Encontrado</h2>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                O link de redefinição é inválido ou está incompleto. Solicite um novo link.
              </p>
              <button
                onClick={() => navigate("/professor/esqueci-senha")}
                className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ backgroundColor: ORANGE }}
              >
                <KeyRound size={18} />
                Solicitar Novo Link
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <KeyRound size={24} style={{ color: ORANGE }} />
                <h2 className="text-2xl font-bold text-white">Redefinir Senha</h2>
              </div>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                Digite sua nova senha abaixo
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg flex items-start gap-3" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 rounded-lg text-white text-sm pr-12"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.08)",
                        border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                      }}
                      disabled={loading}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all"
                            style={{
                              backgroundColor: i <= strength.level ? strength.color : "rgba(255,255,255,0.1)",
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: strength.color }}>
                        Senha {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirmar Senha</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      placeholder="Digite novamente"
                      className="w-full px-4 py-3 rounded-lg text-white text-sm pr-12"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.08)",
                        border: confirmPassword && confirmPassword !== newPassword
                          ? "1px solid rgba(239,68,68,0.5)"
                          : confirmPassword && confirmPassword === newPassword
                            ? "1px solid rgba(34,197,94,0.5)"
                            : "1px solid rgba(255,255,255,0.1)",
                      }}
                      disabled={loading}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-400 mt-1">As senhas não coincidem</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-xs text-green-400 mt-1">Senhas coincidem ✓</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: ORANGE }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      <KeyRound size={18} />
                      Redefinir Senha
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer */}
          {!success && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                <button
                  type="button"
                  onClick={() => navigate("/professor/login")}
                  className="hover:underline font-semibold"
                  style={{ color: ORANGE }}
                >
                  <ArrowLeft size={12} className="inline mr-1" />
                  Voltar ao Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
