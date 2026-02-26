import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Send, MessageCircle, ArrowLeft, Loader2, Circle, AlertCircle
} from "lucide-react";

export default function ChatLive() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = trpc.chat.getConversations.useQuery();

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConversation || 0, limit: 50 },
    { enabled: !!selectedConversation }
  );

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar: ${error.message}`);
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      refetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation, refetchMessages]);

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageText.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }

    setIsSending(true);
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: messageText.trim(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Conversations List */}
      <div className={`w-full lg:w-80 border-r border-border flex flex-col ${selectedConversation ? "hidden lg:flex" : ""}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold text-lg text-foreground">Conversas</h2>
          <p className="text-xs text-muted-foreground">Chat ao vivo com professores</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 text-center">
              <Loader2 size={24} className="mx-auto animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4">
              <Card className="p-6 text-center">
                <MessageCircle size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nenhuma conversa iniciada</p>
              </Card>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map(conversation => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedConversation === conversation.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Circle size={8} className={selectedConversation === conversation.id ? "fill-current" : "fill-green-500 text-green-500"} />
                    <span className="font-medium text-sm">Professor {conversation.teacherId}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.lastMessageAt
                      ? new Date(conversation.lastMessageAt).toLocaleDateString("pt-BR")
                      : "Sem mensagens"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors lg:hidden"
              >
                <ArrowLeft size={20} className="text-muted-foreground" />
              </button>
              <div>
                <h3 className="font-display font-semibold text-foreground">Chat com Professor</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Circle size={6} className="fill-green-500 text-green-500" />
                  Online
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Card className="p-6 text-center max-w-sm">
                  <MessageCircle size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
                  <p className="text-xs text-muted-foreground mt-1">Comece a conversa com uma mensagem</p>
                </Card>
              </div>
            ) : (
              messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.senderType === "student" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderType === "student"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-secondary text-foreground rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.senderType === "student" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem... (Ctrl+Enter para enviar)"
                className="min-h-[44px] max-h-[120px] resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSending || sendMessageMutation.isPending || !messageText.trim()}
                size="lg"
                className="flex items-center justify-center gap-2"
              >
                {isSending || sendMessageMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <Card className="p-8 text-center max-w-sm">
            <MessageCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">Selecione uma Conversa</h3>
            <p className="text-sm text-muted-foreground">
              Escolha uma conversa na lista para começar a chatear com seu professor
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
