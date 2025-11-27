import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface Quest {
  id: string;
  title: string;
  category: string;
  priority: string;
  is_recurring: boolean;
  recurrence_type: string | null;
  recurrence_days: number[] | null;
  monthly_target: number | null;
}

interface EditQuestDialogProps {
  quest: Quest;
  onQuestUpdated: () => void;
  children?: React.ReactNode;
}

const EditQuestDialog = ({ quest, onQuestUpdated, children }: EditQuestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(quest.title);
  const [category, setCategory] = useState(quest.category);
  const [priority, setPriority] = useState(quest.priority);
  const [isRecurring, setIsRecurring] = useState(quest.is_recurring);
  const [recurrenceType, setRecurrenceType] = useState<string>(quest.recurrence_type || "daily");
  const [selectedDays, setSelectedDays] = useState<number[]>(quest.recurrence_days || []);
  const [monthlyTarget, setMonthlyTarget] = useState(quest.monthly_target || 30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(quest.title);
      setCategory(quest.category);
      setPriority(quest.priority);
      setIsRecurring(quest.is_recurring);
      setRecurrenceType(quest.recurrence_type || "daily");
      setSelectedDays(quest.recurrence_days || []);
      setMonthlyTarget(quest.monthly_target || 30);
    }
  }, [open, quest]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Por favor, insira um título");
      return;
    }

    setLoading(true);

    const updates: any = {
      title: title.trim(),
      category,
      priority,
      is_recurring: isRecurring,
    };

    if (isRecurring) {
      updates.recurrence_type = recurrenceType;
      if (recurrenceType === "weekly") {
        updates.recurrence_days = selectedDays.length > 0 ? selectedDays : [0, 1, 2, 3, 4, 5, 6];
      } else {
        updates.recurrence_days = null;
      }
      if (recurrenceType === "monthly") {
        updates.monthly_target = monthlyTarget;
      }
    } else {
      updates.recurrence_type = null;
      updates.recurrence_days = null;
      updates.monthly_target = null;
    }

    const { error } = await supabase
      .from("quests")
      .update(updates)
      .eq("id", quest.id);

    setLoading(false);

    if (error) {
      toast.error("Erro ao atualizar missão");
      console.error(error);
    } else {
      toast.success(isRecurring ? "Hábito atualizado!" : "Missão atualizada!");
      setOpen(false);
      onQuestUpdated();
      window.dispatchEvent(new Event('questCreated'));
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Editar {isRecurring ? "Hábito" : "Missão"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quest Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!isRecurring ? "default" : "outline"}
              className="flex-1"
              onClick={() => setIsRecurring(false)}
            >
              Missão Única
            </Button>
            <Button
              type="button"
              variant={isRecurring ? "default" : "outline"}
              className="flex-1"
              onClick={() => setIsRecurring(true)}
            >
              Hábito Recorrente
            </Button>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRecurring ? "Ex: Meditar 10 minutos" : "Ex: Completar projeto"}
              className="mt-1.5"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="edit-category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category" className="mt-1.5">
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

          {/* Recurrence Settings */}
          {isRecurring && (
            <div>
              <Label htmlFor="edit-recurrence">Recorrência</Label>
              <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                <SelectTrigger id="edit-recurrence" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Weekly Day Selection */}
          {isRecurring && recurrenceType === "weekly" && (
            <div>
              <Label>Dias da Semana</Label>
              <div className="flex gap-2 mt-1.5">
                {dayNames.map((day, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={selectedDays.includes(index) ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => toggleDay(index)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Target */}
          {isRecurring && recurrenceType === "monthly" && (
            <div>
              <Label htmlFor="edit-monthly-target">Meta Mensal</Label>
              <div className="text-xs text-muted-foreground mb-1.5">
                Quantas vezes por mês você quer fazer isso?
              </div>
              <Input
                id="edit-monthly-target"
                type="number"
                min="1"
                max="31"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(parseInt(e.target.value) || 30)}
              />
            </div>
          )}

          {/* Priority (only for single quests) */}
          {!isRecurring && (
            <div>
              <Label htmlFor="edit-priority">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="edit-priority" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestDialog;
