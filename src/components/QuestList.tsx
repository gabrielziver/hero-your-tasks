import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Sword, Sparkles, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface Quest {
  id: string;
  title: string;
  category: string;
  priority: string;
  xp_reward: number;
  gold_reward: number;
  is_completed: boolean;
  is_boss_quest: boolean;
}

interface QuestListProps {
  onQuestCompleted: () => void;
}

const QuestList = ({ onQuestCompleted }: QuestListProps) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load quests");
      console.error(error);
    } else {
      setQuests(data || []);
    }
    setLoading(false);
  };

  const handleCompleteQuest = async (questId: string) => {
    const { data, error } = await supabase.rpc("complete_quest", {
      quest_id: questId,
    });

    if (error) {
      toast.error(error.message);
    } else {
      const result = data as any;
      if (result.level_up) {
        toast.success(`🎉 Level Up! You reached level ${result.new_level}!`, {
          duration: 5000,
        });
      } else {
        toast.success(`⚔️ Quest Complete! +${result.xp_gained} XP, +${result.gold_gained} Gold`);
      }
      loadQuests();
      onQuestCompleted();
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    const { error } = await supabase
      .from("quests")
      .delete()
      .eq("id", questId);

    if (error) {
      toast.error("Failed to delete quest");
    } else {
      toast.success("Quest deleted");
      loadQuests();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/50";
      case "medium":
        return "bg-secondary/20 text-secondary border-secondary/50";
      default:
        return "bg-primary/20 text-primary border-primary/50";
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading quests...</div>;
  }

  const activeQuests = quests.filter((q) => !q.is_completed);
  const completedQuests = quests.filter((q) => q.is_completed);

  return (
    <div className="space-y-6">
      {/* Active Quests */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Active Quests</h3>
        {activeQuests.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No active quests. Create your first quest to begin!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeQuests.map((quest) => (
              <Card key={quest.id} className={`bg-card border-border hover:border-primary transition-all ${quest.is_boss_quest ? "border-secondary shadow-glow-gold" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => handleCompleteQuest(quest.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {quest.is_boss_quest && <Sword className="w-5 h-5 text-secondary" />}
                            <h4 className="font-semibold text-foreground">{quest.title}</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className={getPriorityColor(quest.priority)}>
                              {quest.priority}
                            </Badge>
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              {quest.category}
                            </Badge>
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              +{quest.xp_reward} XP
                            </Badge>
                            <Badge variant="outline" className="bg-secondary/10 text-secondary">
                              +{quest.gold_reward} Gold
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteQuest(quest.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Completed Quests</h3>
          <div className="space-y-3">
            {completedQuests.map((quest) => (
              <Card key={quest.id} className="bg-muted/20 border-border opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox checked={true} disabled className="mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-muted-foreground line-through">{quest.title}</h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestList;
