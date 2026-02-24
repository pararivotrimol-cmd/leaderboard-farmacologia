import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, QrCode } from "lucide-react";
import { Link } from "wouter";
import QRCodeManager from "@/components/QRCodeManager";

export default function AdminAttendance() {
  const { user, isAuthenticated } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classInput, setClassInput] = useState<string>("");

  // Verificar se é professor/admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <p className="text-foreground mb-4">
            Você precisa estar autenticado para acessar esta página.
          </p>
          <Link href="/">
            <Button className="w-full">Voltar para Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Verificação de permissão pode ser adicionada aqui

  const handleSelectClass = () => {
    const classId = parseInt(classInput);
    if (classId > 0) {
      setSelectedClassId(classId);
    } else {
      alert("❌ Digite um ID de turma válido");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/professor">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <QrCode size={28} className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Gerenciar Presença por QR Code
                </h1>
                <p className="text-sm text-muted-foreground">
                  Crie e gerencie sessões de QR Code para suas turmas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedClassId ? (
          <Card className="p-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-6 text-foreground">
              Selecionar Turma
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  ID da Turma
                </label>
                <Input
                  type="number"
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  placeholder="Digite o ID da turma"
                  className="bg-background text-foreground border-border"
                />
              </div>
              <Button
                onClick={handleSelectClass}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continuar
              </Button>
              <Button
                variant="outline"
                onClick={() => setClassInput("")}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Botão voltar */}
            <Button
              variant="outline"
              onClick={() => {
                setSelectedClassId(null);
                setClassInput("");
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Voltar para Seleção de Turma
            </Button>

            {/* QRCodeManager */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 text-foreground">
                Turma #{selectedClassId}
              </h2>
              <QRCodeManager classId={selectedClassId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
