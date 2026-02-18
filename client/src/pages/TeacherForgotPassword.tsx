import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound, ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function TeacherForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestResetMutation = trpc.teacherAuth.requestPasswordReset.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetLink("");

    try {
      const result = await requestResetMutation.mutateAsync({ email });

      if (result.success && result.resetLink) {
        setResetLink(window.location.origin + result.resetLink);
        toast.success("Link de redefinição gerado!");
      } else {
        toast.info(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar redefinição");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/professor/login")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Login
        </Button>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-display">Esqueci minha senha</CardTitle>
            </div>
            <CardDescription>
              Digite seu email institucional para receber o link de redefinição
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!resetLink ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Institucional</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@unirio.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando link...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Solicitar Redefinição
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Link de redefinição gerado com sucesso! Copie e envie para o email do professor.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Link de Redefinição</Label>
                  <div className="flex gap-2">
                    <Input
                      value={resetLink}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este link expira em 1 hora
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setResetLink("");
                    setEmail("");
                  }}
                >
                  Gerar Novo Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
