import {
  FileText,
  File,
  Music,
  Youtube,
  Link2,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export type MaterialType = "file" | "link" | "comment";

interface MaterialTypeConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

const materialTypeConfigs: Record<MaterialType, MaterialTypeConfig> = {
  file: {
    icon: FileText,
    label: "Arquivo",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    description: "Documento, PDF, Word ou planilha",
  },
  link: {
    icon: Link2,
    label: "Link",
    color: "text-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    description: "Link externo ou YouTube",
  },
  comment: {
    icon: MessageSquare,
    label: "Comentário",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    description: "Nota ou comentário",
  },
};

/**
 * Detecta o tipo específico de arquivo baseado no nome do arquivo
 */
export function detectFileType(fileName?: string): string {
  if (!fileName) return "Arquivo";

  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  const typeMap: Record<string, string> = {
    // Word
    doc: "Word",
    docx: "Word",
    // PDF
    pdf: "PDF",
    // Excel
    xls: "Excel",
    xlsx: "Excel",
    csv: "Excel",
    // PowerPoint
    ppt: "PowerPoint",
    pptx: "PowerPoint",
    // Images
    jpg: "Imagem",
    jpeg: "Imagem",
    png: "Imagem",
    gif: "Imagem",
    // Video
    mp4: "Vídeo",
    mov: "Vídeo",
    avi: "Vídeo",
    // Audio
    mp3: "Áudio",
    wav: "Áudio",
  };

  return typeMap[ext] || "Arquivo";
}

/**
 * Retorna a cor e ícone específico baseado no tipo de arquivo
 */
export function getFileTypeConfig(fileName?: string): {
  icon: LucideIcon;
  label: string;
  color: string;
} {
  if (!fileName) {
    return {
      icon: FileText,
      label: "Arquivo",
      color: "text-blue-600",
    };
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  const configs: Record<string, { icon: LucideIcon; label: string; color: string }> = {
    // Word
    doc: { icon: FileText, label: "Word", color: "text-blue-600" },
    docx: { icon: FileText, label: "Word", color: "text-blue-600" },
    // PDF
    pdf: { icon: FileText, label: "PDF", color: "text-red-600" },
    // Excel
    xls: { icon: File, label: "Excel", color: "text-green-600" },
    xlsx: { icon: File, label: "Excel", color: "text-green-600" },
    csv: { icon: File, label: "CSV", color: "text-green-600" },
    // PowerPoint
    ppt: { icon: File, label: "PowerPoint", color: "text-orange-600" },
    pptx: { icon: File, label: "PowerPoint", color: "text-orange-600" },
       // Audio
    mp3: { icon: Music, label: "Áudio", color: "text-purple-600" },
    wav: { icon: Music, label: "Áudio", color: "text-purple-600" },
    // Images
    jpg: { icon: File, label: "Imagem", color: "text-purple-600" },
    jpeg: { icon: File, label: "Imagem", color: "text-purple-600" },
    png: { icon: File, label: "Imagem", color: "text-purple-600" },
    gif: { icon: File, label: "Imagem", color: "text-purple-600" },
  };

  return (
    configs[ext] || {
      icon: FileText,
      label: "Arquivo",
      color: "text-blue-600",
    }
  );
}

interface MaterialTypeBadgeProps {
  type: MaterialType;
  fileName?: string | null;
  url?: string | null;
  variant?: "default" | "compact" | "detailed";
}

/**
 * Componente de badge para exibir tipo de material com codificação visual
 * - default: Badge colorido com ícone e texto
 * - compact: Apenas ícone
 * - detailed: Badge com descrição completa
 */
export function MaterialTypeBadge({
  type,
  fileName,
  url,
  variant = "default",
}: MaterialTypeBadgeProps) {
  const config = materialTypeConfigs[type];

  // Para arquivos, detectar tipo específico
  let displayLabel = config.label;
  let displayIcon = config.icon;
  let displayColor = config.color;

  if (type === "file" && fileName) {
    const fileConfig = getFileTypeConfig(fileName);
    displayLabel = fileConfig.label;
    displayIcon = fileConfig.icon;
    displayColor = fileConfig.color;
  }

  // Para links, detectar se é YouTube
  if (type === "link" && url && url.includes("youtube")) {
    displayLabel = "YouTube";
    displayIcon = Youtube;
    displayColor = "text-red-600";
  }

  const Icon = displayIcon;

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.bgColor} ${displayColor}`}
        title={displayLabel}
      >
        <Icon size={14} />
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor}`}
      >
        <Icon size={16} className={displayColor} />
        <div className="flex flex-col gap-0.5">
          <span className={`text-xs font-semibold ${displayColor}`}>{displayLabel}</span>
          <span className="text-[10px] text-muted-foreground">{config.description}</span>
        </div>
      </div>
    );
  }

  // default variant
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon size={14} className={displayColor} />
      <span className={`text-xs font-medium ${displayColor}`}>{displayLabel}</span>
    </div>
  );
}

/**
 * Componente para filtro de tipos de material
 */
interface MaterialTypeFilterProps {
  selectedTypes: MaterialType[];
  onTypeChange: (types: MaterialType[]) => void;
}

export function MaterialTypeFilter({
  selectedTypes,
  onTypeChange,
}: MaterialTypeFilterProps) {
  const toggleType = (type: MaterialType) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {(["file", "link", "comment"] as MaterialType[]).map(type => {
        const config = materialTypeConfigs[type];
        const Icon = config.icon;
        const isSelected = selectedTypes.includes(type);

        return (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              isSelected
                ? `${config.bgColor} ${config.borderColor} ${config.textColor}`
                : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} />
            <span className="text-xs font-medium">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
