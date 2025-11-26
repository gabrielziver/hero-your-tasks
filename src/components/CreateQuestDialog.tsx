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
  children?: React.ReactNode;
}

const CreateQuestDialog = ({ onQuestCreated, children }: CreateQuestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("produtividade");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

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
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? recurrenceType : null,
      recurrence_days: isRecurring && recurrenceType === "weekly" ? selectedDays : [],
      monthly_target: isRecurring && recurrenceType === "monthly" ? 30 : null,
    });

    if (error) {
      toast.error("Falha ao criar missão");
      console.error(error);
    } else {
      toast.success(isRecurring ? "Hábito criado!" : "Missão criada!");
      setTitle("");
      setCategory("produtividade");
      setPriority("medium");
      setIsRecurring(false);
      setRecurrenceType("weekly");
      setSelectedDays([]);
      setOpen(false);
      onQuestCreated();
    }
    setLoading(false);
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-hero">
            <Plus className="w-4 h-4 mr-2" />
            Nova Missão
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isRecurring ? "Criar Novo Hábito" : "Criar Nova Missão"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isRecurring ? "Configure seu novo hábito recorrente" : "Adicione uma nova missão à sua jornada"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select 
              value={isRecurring ? "recurring" : "single"} 
              onValueChange={(value) => setIsRecurring(value === "recurring")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">🎯 Missão Pontual</SelectItem>
                <SelectItem value="recurring">🔄 Missão Recorrente (Hábito)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                <SelectItem value="produtividade">💼 Produtividade</SelectItem>
                <SelectItem value="bem-estar">🧘 Bem-estar</SelectItem>
                <SelectItem value="criatividade">🎨 Criatividade</SelectItem>
                <SelectItem value="forca">💪 Força</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isRecurring && (
            <>
              <div>
                <Label>Frequência</Label>
                <Select 
                  value={recurrenceType} 
                  onValueChange={(value: any) => setRecurrenceType(value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">📅 Diariamente</SelectItem>
                    <SelectItem value="weekly">📆 Dias da semana</SelectItem>
                    <SelectItem value="monthly">📊 Mensal (30 vezes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recurrenceType === "weekly" && (
                <div>
                  <Label>Dias da Semana</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {dayNames.map((day, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={selectedDays.includes(index) ? "default" : "outline"}
                        className="p-2 h-auto text-xs"
                        onClick={() => toggleDay(index)}
                        disabled={loading}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
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
            {loading ? "Criando..." : isRecurring ? "Criar Hábito" : "Criar Missão"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestDialog;
