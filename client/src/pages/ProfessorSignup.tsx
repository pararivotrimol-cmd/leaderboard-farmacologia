import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfessorSignup() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const signupMutation = trpc.teacherAuth.register.useMutation();

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith("@unirio.br") || email.toLowerCase().endsWith("@edu.unirio.br");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!name.trim()) {
      setError("Nome completo é obrigatório");
      return;
    }

    if (!email.trim()) {
      setError("Email é obrigatório");
      return;
    }

    if (!validateEmail(email)) {
      setError("Use seu email institucional (@unirio.br ou @edu.unirio.br)");
      return;
    }

    if (password.length < 8) {
      setError("Senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      await signupMutation.mutateAsync({
        name,
        email: email.toLowerCase(),
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        setLocation("/professor/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-orange-500/30 bg-slate-800/50 backdrop-blur">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Conexão em <span className="text-orange-500">Farmacologia</span>
              </h1>
              <p className="text-slate-400">Cadastro do Professor</p>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Cadastro Realizado!</h2>
                <p className="text-slate-400 mb-4">Redirecionando para login...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <User size={16} className="inline mr-2" />
                    Nome Completo
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Prof. Pedro Alexandre"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={isLoading}
                  />
                </div>

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
                  <p className="text-xs text-slate-400 mt-1">
                    Use seu email @unirio.br ou @edu.unirio.br
                  </p>
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
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Mínimo 8 caracteres
                  </p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmar Senha
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={isLoading}
                  />
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
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>

                {/* Login Link */}
                <div className="text-center pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-sm">
                    Já tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => setLocation("/professor/login")}
                      className="text-orange-500 hover:text-orange-400 font-semibold"
                    >
                      Fazer login
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
