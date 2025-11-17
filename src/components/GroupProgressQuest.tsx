import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { BookOpen, Trophy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface ProgressEntry {
  user_id: string;
  username: string;
  avatar_color: string;
  total_progress: number;
}

interface GroupProgressQuestProps {
  groupId: string;
}

const GroupProgressQuest = ({ groupId }: GroupProgressQuestProps) => {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressValue, setProgressValue] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [groupId]);

  const loadProgress = async () => {
    // For now, we'll use a simple in-memory storage
    // In production, you'd want to create a proper table for this
    const { data: members } = await supabase
      .from("group_members")
      .select(`
        user_id,
        profiles:user_id (
          username,
          avatar_color
        )
      `)
      .eq("group_id", groupId);

    if (members) {
      const entries = members.map(m => ({
        user_id: m.user_id,
        username: (m.profiles as any)?.username || "Usuário",
        avatar_color: (m.profiles as any)?.avatar_color || "#6C3AE3",
        total_progress: 0
      }));
      setProgressEntries(entries);
    }
    setLoading(false);
  };

  const addProgress = async () => {
    const value = parseInt(progressValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update progress locally (in production, save to database)
    setProgressEntries(prev => 
      prev.map(entry => 
        entry.user_id === user.id 
          ? { ...entry, total_progress: entry.total_progress + value }
          : entry
      ).sort((a, b) => b.total_progress - a.total_progress)
    );

    toast.success(`+${value} páginas adicionadas!`);
    setProgressValue("");
    setOpen(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const maxProgress = Math.max(...progressEntries.map(e => e.total_progress), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold">Desafio da Semana: Leitura</h3>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-hero">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Progresso
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Adicionar Páginas Lidas</DialogTitle>
              <DialogDescription>
                Quantas páginas você leu hoje?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pages">Número de Páginas</Label>
                <Input
                  id="pages"
                  type="number"
                  min="1"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  placeholder="Ex: 50"
                />
              </div>
              <Button onClick={addProgress} className="w-full bg-gradient-hero">
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50">
        <CardContent className="p-4 space-y-3">
          {progressEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum progresso registrado ainda
            </p>
          ) : (
            progressEntries.map((entry, index) => (
              <div key={entry.user_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: entry.avatar_color }}
                    >
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{entry.username}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {entry.total_progress} páginas
                  </span>
                </div>
                <Progress 
                  value={(entry.total_progress / maxProgress) * 100} 
                  className="h-2"
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupProgressQuest;
