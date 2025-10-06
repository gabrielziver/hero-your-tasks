import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface GroupQuest {
  id: string;
  title: string;
  description: string | null;
  xp_reward: number;
  created_at: string;
  completed_by_user: boolean;
  completions_count: number;
}

interface GroupQuestListProps {
  groupId: string;
}

const GroupQuestList = ({ groupId }: GroupQuestListProps) => {
  const [quests, setQuests] = useState<GroupQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    loadGroupQuests();
  }, [groupId]);

  const loadGroupQuests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: questsData, error: questsError } = await supabase
      .from("group_quests")
      .select("*")
      .eq("group_id", groupId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (questsError) {
      console.error(questsError);
      setLoading(false);
      return;
    }

    const { data: completionsData } = await supabase
      .from("group_quest_completions")
      .select("group_quest_id, user_id")
      .in("group_quest_id", questsData?.map(q => q.id) || []);

    const formatted = questsData?.map(quest => {
      const completions = completionsData?.filter(c => c.group_quest_id === quest.id) || [];
      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        xp_reward: quest.xp_reward,
        created_at: quest.created_at,
        completed_by_user: completions.some(c => c.user_id === user.id),
        completions_count: completions.length,
      };
    }) || [];

    setQuests(formatted);
    setLoading(false);
  };

  const handleComplete = async (questId: string) => {
    setCompletingId(questId);
    
    const { data, error } = await supabase.rpc("complete_group_quest", {
      quest_id: questId,
    });

    if (error) {
      if (error.message.includes("already completed")) {
        toast.error("Você já completou esta missão");
      } else {
        toast.error("Erro ao completar missão");
      }
      console.error(error);
    } else {
      const result = data as any;
      toast.success(`🎉 Missão completada! Todos os membros ganharam ${result?.xp_awarded || 50} XP!`);
      loadGroupQuests();
    }
    
    setCompletingId(null);
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Carregando missões...</div>;
  }

  if (quests.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma missão especial ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {quests.map((quest) => (
        <Card 
          key={quest.id} 
          className={`bg-gradient-card border-border transition-all ${
            quest.completed_by_user ? "opacity-60" : "hover:border-primary"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground mb-1">{quest.title}</h4>
                {quest.description && (
                  <p className="text-sm text-muted-foreground mb-2">{quest.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-secondary font-semibold">+{quest.xp_reward} XP</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {quest.completions_count} completaram
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                {quest.completed_by_user ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Completa</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleComplete(quest.id)}
                    disabled={completingId === quest.id}
                    size="sm"
                    className="bg-gradient-hero"
                  >
                    {completingId === quest.id ? "..." : "Completar"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GroupQuestList;
