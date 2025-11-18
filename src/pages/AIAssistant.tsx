import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Olá! Sou seu assistente pessoal estilo Jarvis. Posso te ajudar a organizar tarefas, criar rotinas, distribuir metas e muito mais. Como posso ajudar você hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    // Simular resposta da IA (será implementado com backend)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Entendi! Vou te ajudar com isso. (IA será integrada em breve com o método Task Level completo)",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
              <Brain className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-primary">Jarvis AI</h1>
              <p className="text-xs text-muted-foreground">Seu assistente pessoal</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`p-4 ${
              message.role === "user"
                ? "bg-primary/10 border-primary ml-12"
                : "bg-card border-border mr-12"
            }`}
          >
            <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
          </Card>
        ))}

        {loading && (
          <Card className="bg-card border-border p-4 mr-12">
            <p className="text-muted-foreground">Pensando...</p>
          </Card>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4">
        <div className="container mx-auto flex gap-2">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="resize-none"
            rows={2}
          />
          <Button onClick={handleSend} disabled={loading} className="bg-gradient-hero">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <NavBar />
    </div>
  );
};

export default AIAssistant;
