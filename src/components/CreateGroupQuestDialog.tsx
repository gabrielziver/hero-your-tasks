import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateGroupQuestDialogProps {
  groupId: string;
  onQuestCreated: () => void;
}

const CreateGroupQuestDialog = ({ groupId, onQuestCreated }: CreateGroupQuestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(50);
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

    const { error } = await supabase
      .from("group_quests")
      .insert({
        group_id: groupId,
        created_by: user.id,
        title: title.trim(),
        description: description.trim() || null,
        xp_reward: xpReward,
      });

    if (error) {
      toast.error("Falha ao criar missão especial");
      console.error(error);
    } else {
      toast.success("Missão especial criada!");
      setTitle("");
      setDescription("");
      setXpReward(50);
      setOpen(false);
      onQuestCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-hero">
          <Sparkles className="w-4 h-4 mr-2" />
          Criar Missão Especial
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Missão Especial do Grupo</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Todos os membros do grupo ganham XP ao completar esta missão
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Missão</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título..."
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da missão..."
              disabled={loading}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="xp">Recompensa de XP</Label>
            <Input
              id="xp"
              type="number"
              min="10"
              max="500"
              value={xpReward}
              onChange={(e) => setXpReward(parseInt(e.target.value) || 50)}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
            {loading ? "Criando..." : "Criar Missão Especial"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupQuestDialog;
