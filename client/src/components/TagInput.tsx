import { useState, useRef } from "react";
import { X } from "lucide-react";

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface TagInputProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  suggestions?: string[];
  maxTags?: number;
  placeholder?: string;
}

// Cores predefinidas para tags
const TAG_COLORS = [
  "bg-red-100 text-red-700 border-red-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
];

/**
 * Componente para gerenciar tags customizáveis
 * Suporta adicionar/remover tags, sugestões e cores automáticas
 */
export function TagInput({
  tags,
  onTagsChange,
  suggestions = [
    "Importante",
    "Leitura Obrigatória",
    "Complementar",
    "Exercício",
    "Prova",
    "Discussão",
    "Caso Clínico",
    "Referência",
  ],
  maxTags = 5,
  placeholder = "Adicionar tag...",
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getColorForTag = (index: number) => {
    return TAG_COLORS[index % TAG_COLORS.length];
  };

  const addTag = (tagName: string) => {
    const trimmedName = tagName.trim();

    if (!trimmedName) return;
    if (tags.length >= maxTags) return;
    if (tags.some(t => t.name.toLowerCase() === trimmedName.toLowerCase())) return;

    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: trimmedName,
      color: getColorForTag(tags.length),
    };

    onTagsChange([...tags, newTag]);
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (id: string) => {
    onTagsChange(tags.filter(t => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1].id);
    }
  };

  const filteredSuggestions = suggestions.filter(
    s =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !tags.some(t => t.name.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, idx) => (
            <div
              key={tag.id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all hover:shadow-sm ${
                tag.color || getColorForTag(idx)
              }`}
            >
              <span>{tag.name}</span>
              <button
                onClick={() => removeTag(tag.id)}
                className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
                title="Remover tag"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/50">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length < maxTags ? placeholder : `Máximo de ${maxTags} tags atingido`}
            disabled={tags.length >= maxTags}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
          />
          {input && tags.length < maxTags && (
            <button
              onClick={() => addTag(input)}
              className="px-2 py-1 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Adicionar
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && input && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredSuggestions.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <span className="text-muted-foreground">+ </span>
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Info Text */}
        <p className="text-[10px] text-muted-foreground mt-1">
          {tags.length}/{maxTags} tags • Pressione Enter para adicionar
        </p>
      </div>
    </div>
  );
}

/**
 * Componente para exibir tags de forma compacta
 */
interface TagDisplayProps {
  tags: Tag[];
  maxDisplay?: number;
}

export function TagDisplay({ tags, maxDisplay = 3 }: TagDisplayProps) {
  const displayTags = tags.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, tags.length - maxDisplay);

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map((tag, idx) => (
        <span
          key={tag.id}
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            tag.color || TAG_COLORS[idx % TAG_COLORS.length]
          }`}
        >
          {tag.name}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground border border-border">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
