import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateQuestDialogProps {
  onQuestCreated: () => void;
}

const CreateQuestDialog = ({ onQuestCreated }: CreateQuestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Por favor, insira um título para a missão");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Você precisa estar logado");
      setLoading(false);
      return;
    }

    const xpReward = priority === "high" ? 30 : priority === "medium" ? 20 : 10;
    const goldReward = priority === "high" ? 15 : priority === "medium" ? 10 : 5;

    const { error } = await supabase.from("quests").insert({
      user_id: user.id,
      title,
      category,
      priority,
      xp_reward: xpReward,
      gold_reward: goldReward,
    });

    if (error) {
      toast.error("Falha ao criar missão");
      console.error(error);
    } else {
      toast.success("Missão criada!");
      setTitle("");
      setCategory("general");
      setPriority("medium");
      setOpen(false);
      onQuestCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Nova Missão
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Criar Nova Missão</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Adicione uma nova missão à sua jornada
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Missão</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite sua missão..."
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="work">Trabalho</SelectItem>
                <SelectItem value="health">Saúde</SelectItem>
                <SelectItem value="learning">Aprendizado</SelectItem>
                <SelectItem value="personal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select value={priority} onValueChange={setPriority} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa (10 XP, 5 Ouro)</SelectItem>
                <SelectItem value="medium">Média (20 XP, 10 Ouro)</SelectItem>
                <SelectItem value="high">Alta (30 XP, 15 Ouro)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
            {loading ? "Criando..." : "Criar Missão"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestDialog;
