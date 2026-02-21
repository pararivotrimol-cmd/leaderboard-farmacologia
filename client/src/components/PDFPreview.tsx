import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PDFPreviewProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * Componente de pré-visualização de PDF
 * Usa a API nativa do navegador para renderizar PDFs
 * Nota: Para renderização mais completa, considere adicionar react-pdf no futuro
 */
export function PDFPreview({ file, isOpen, onClose, title }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!file || !isOpen) {
      setPdfUrl("");
      return;
    }

    setIsLoading(true);
    setError("");

    // Verificar se é um PDF
    if (file.type !== "application/pdf") {
      setError("Este arquivo não é um PDF válido");
      setIsLoading(false);
      return;
    }

    // Criar URL do arquivo
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setIsLoading(false);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center justify-between">
            <span>{title || "Pré-visualização de PDF"}</span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-secondary text-muted-foreground"
            >
              <X size={20} />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-secondary/30">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando PDF...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-sm text-destructive font-medium">{error}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Abra o arquivo em uma nova aba para visualizar
                </p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="flex items-center justify-center p-4">
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                className="w-full h-[70vh] rounded-lg border border-border"
                title="PDF Preview"
              />
            </div>
          ) : null}
        </div>

        {/* Footer com ações */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {file?.name && `Arquivo: ${file.name}`}
          </p>
          <div className="flex gap-2">
            <a
              href={pdfUrl}
              download={file?.name}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir em Nova Aba
            </a>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook para gerenciar estado de pré-visualização de PDF
 */
export function usePDFPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const openPreview = (file: File) => {
    if (file.type === "application/pdf") {
      setSelectedFile(file);
      setIsOpen(true);
    }
  };

  const closePreview = () => {
    setIsOpen(false);
    setSelectedFile(null);
  };

  return {
    isOpen,
    selectedFile,
    openPreview,
    closePreview,
  };
}
