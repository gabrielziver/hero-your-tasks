import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, Check, Users } from "lucide-react";
import { toast } from "sonner";
import QuestCompleteEffect from "./QuestCompleteEffect";

interface GroupQuest {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  created_at: string;
  is_active: boolean;
}

interface GroupQuestWithCompletion extends GroupQuest {
  completed_by_user: boolean;
  completion_count: number;
}

interface GroupQuestListProps {
  groupId: string;
}

const GroupQuestList = ({ groupId }: GroupQuestListProps) => {
  const [quests, setQuests] = useState<GroupQuestWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [completeEffect, setCompleteEffect] = useState<{
    show: boolean;
    xp: number;
    gold: number;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    loadQuests();
  }, [groupId]);

  const loadQuests = async () => {
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

    // Get completions for these quests
    const questIds = questsData?.map(q => q.id) || [];
    
    if (questIds.length === 0) {
      setQuests([]);
      setLoading(false);
      return;
    }

    const { data: completionsData, error: completionsError } = await supabase
      .from("group_quest_completions")
      .select("*")
      .in("group_quest_id", questIds);

    if (completionsError) {
      console.error(completionsError);
    }

    const questsWithCompletions = questsData?.map(quest => {
      const completions = completionsData?.filter(c => c.group_quest_id === quest.id) || [];
      const completedByUser = completions.some(c => c.user_id === user.id);
      
      return {
        ...quest,
        completed_by_user: completedByUser,
        completion_count: completions.length,
      };
    }) || [];

    setQuests(questsWithCompletions);
    setLoading(false);
  };

  const handleCompleteQuest = async (questId: string, event?: any) => {
    setCompleting(questId);
    
    // Get click position for effect
    let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    
    const { data, error } = await supabase.rpc("complete_group_quest", {
      quest_id: questId,
    });

    if (error) {
      toast.error(error.message);
    } else {
      const result = data as { quest_title: string; xp_awarded: number; success: boolean };
      
      // Show particle effect
      setCompleteEffect({
        show: true,
        xp: result.xp_awarded,
        gold: 0, // Group quests don't award gold
        position,
      });
      
      toast.success(`${result.quest_title} completa! Todos ganharam ${result.xp_awarded} XP!`);
      loadQuests();
    }
    
    setCompleting(null);
  };
  
  const handleEffectComplete = () => {
    setCompleteEffect(null);
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Carregando missões especiais...</div>;
  }

  if (quests.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma missão especial ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {completeEffect && (
        <QuestCompleteEffect
          xpGained={completeEffect.xp}
          goldGained={completeEffect.gold}
          position={completeEffect.position}
          onComplete={handleEffectComplete}
        />
      )}
      
      <div className="space-y-3">
      {quests.map((quest) => (
        <Card
          key={quest.id}
          className={`bg-gradient-card border-border transition-all ${
            quest.completed_by_user ? "opacity-60" : "hover:border-primary"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <h3 className="font-bold text-foreground">{quest.title}</h3>
                </div>
                {quest.description && (
                  <p className="text-sm text-muted-foreground mb-2">{quest.description}</p>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <span className="bg-gradient-gold bg-clip-text text-transparent font-bold">
                    +{quest.xp_reward} XP para todos
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {quest.completion_count} completaram
                  </span>
                </div>
              </div>
              <Button
                onClick={(e) => handleCompleteQuest(quest.id, e)}
                disabled={quest.completed_by_user || completing === quest.id}
                variant={quest.completed_by_user ? "outline" : "default"}
                className={quest.completed_by_user ? "" : "bg-gradient-hero"}
              >
                {quest.completed_by_user ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Completa
                  </>
                ) : completing === quest.id ? (
                  "Completando..."
                ) : (
                  "Completar"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </>
  );
};

export default GroupQuestList;
