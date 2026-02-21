import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Eye, Code } from "lucide-react";
import { toast } from "sonner";

interface Alternative {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuestionEditorProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function QuestionEditor({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: QuestionEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [questionText, setQuestionText] = useState(initialData?.questionText || "");
  const [questionType, setQuestionType] = useState(initialData?.questionType || "multiple_choice");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "medium");
  const [points, setPoints] = useState(initialData?.points || 1);
  const [estimatedTime, setEstimatedTime] = useState(initialData?.estimatedTime || 120);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [formulaLatex, setFormulaLatex] = useState(initialData?.formulaLatex || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const [alternatives, setAlternatives] = useState<Alternative[]>(
    initialData?.alternatives || [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]
  );

  const [preview, setPreview] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAlternativeChange = (index: number, field: keyof Alternative, value: any) => {
    const newAlternatives = [...alternatives];
    newAlternatives[index] = { ...newAlternatives[index], [field]: value };
    setAlternatives(newAlternatives);
  };

  const handleSetCorrect = (index: number) => {
    const newAlternatives = alternatives.map((alt, i) => ({
      ...alt,
      isCorrect: i === index,
    }));
    setAlternatives(newAlternatives);
  };

  const handleSave = async () => {
    // Validations
    if (!title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (!category.trim()) {
      toast.error("Categoria é obrigatória");
      return;
    }

    if (!questionText.trim()) {
      toast.error("Texto da questão é obrigatório");
      return;
    }

    if (questionType === "multiple_choice") {
      const filledAlternatives = alternatives.filter(alt => alt.text.trim());
      if (filledAlternatives.length !== 5) {
        toast.error("Todas as 5 alternativas devem ser preenchidas");
        return;
      }

      const hasCorrect = alternatives.some(alt => alt.isCorrect);
      if (!hasCorrect) {
        toast.error("Selecione uma alternativa como correta");
        return;
      }
    }

    try {
      await onSave({
        title,
        description,
        category,
        questionText,
        questionType,
        difficulty,
        points,
        estimatedTime,
        imageUrl,
        formulaLatex,
        tags,
        alternatives: questionType === "multiple_choice" ? alternatives : undefined,
      });
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="edit" value={preview ? "preview" : "edit"} onValueChange={(v) => setPreview(v === "preview")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="gap-2">
            <Code size={16} />
            Editar
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye size={16} />
            Visualizar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          {/* Title and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Título *
              </label>
              <Input
                placeholder="Ex: Questão sobre Farmacocinética"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Categoria *
              </label>
              <Input
                placeholder="Ex: Farmacocinética, SNA, Colinérgicos"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Descrição
            </label>
            <Textarea
              placeholder="Descrição adicional da questão..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Question Text */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Texto da Questão *
            </label>
            <Textarea
              placeholder="Digite a questão aqui..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={4}
            />
          </div>

          {/* Question Type, Difficulty, Points */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Tipo de Questão
              </label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="essay">Dissertativa</SelectItem>
                  <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Dificuldade
              </label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Pontos
              </label>
              <Input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Media and Formula */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                URL da Imagem
              </label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Fórmula LaTeX
              </label>
              <Input
                placeholder="Ex: \\frac{dC}{dt} = -kC"
                value={formulaLatex}
                onChange={(e) => setFormulaLatex(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Adicionar tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag();
                  }
                }}
              />
              <Button onClick={handleAddTag} variant="outline" size="sm">
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Alternatives for Multiple Choice */}
          {questionType === "multiple_choice" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">
                Alternativas (5 obrigatórias)
              </h3>
              {alternatives.map((alt, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="correct"
                      checked={alt.isCorrect}
                      onChange={() => handleSetCorrect(index)}
                      className="mt-3 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                        value={alt.text}
                        onChange={(e) =>
                          handleAlternativeChange(index, "text", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Explicação (opcional)"
                        value={alt.explanation || ""}
                        onChange={(e) =>
                          handleAlternativeChange(index, "explanation", e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Time Estimate */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Tempo Estimado (segundos)
            </label>
            <Input
              type="number"
              min="30"
              max="600"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Questão"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
                <div className="flex gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {category}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">
                    {difficulty === "easy"
                      ? "Fácil"
                      : difficulty === "medium"
                      ? "Médio"
                      : "Difícil"}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">
                    {points} ponto{points !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Questão"
                  className="max-w-md max-h-64 rounded-lg object-contain"
                />
              )}

              {formulaLatex && (
                <div className="bg-secondary p-3 rounded-lg font-mono text-sm">
                  {formulaLatex}
                </div>
              )}

              <div className="text-lg text-foreground whitespace-pre-wrap">
                {questionText}
              </div>

              {questionType === "multiple_choice" && (
                <div className="space-y-2">
                  {alternatives.map((alt, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${
                        alt.isCorrect
                          ? "border-green-500 bg-green-500/10"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-foreground">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <div className="flex-1">
                          <p className="text-foreground">{alt.text}</p>
                          {alt.explanation && (
                            <p className="text-xs text-muted-foreground mt-1">
                              💡 {alt.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
