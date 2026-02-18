import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Super Admin Setup Page
 * One-time page to create the super admin account
 */
export default function SuperAdminSetup() {
  const [, setLocation] = useLocation();
  const [secretKey, setSecretKey] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const createMutation = trpc.teacherAuth.createSuperAdmin.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => setLocation("/professor/login"), 2000);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    createMutation.mutate({ secretKey, name, email, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-amber-500" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">Criar Super Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configuração única para administrador geral do sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Chave Secreta
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              placeholder="Chave secreta do sistema..."
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Entre em contato com o desenvolvedor para obter a chave
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome completo..."
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres..."
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente..."
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-2.5 rounded-lg bg-amber-500 text-white font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {createMutation.isPending ? "Criando..." : "Criar Super Admin"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation("/")}
            className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={12} /> Voltar ao Início
          </button>
        </div>
      </motion.div>
    </div>
  );
}
