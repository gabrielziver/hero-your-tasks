import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Sword, Sparkles, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import LevelUpAnimation from "./LevelUpAnimation";
import QuestCompleteEffect from "./QuestCompleteEffect";

interface Quest {
  id: string;
  title: string;
  category: string;
  priority: string;
  xp_reward: number;
  gold_reward: number;
  is_completed: boolean;
  is_boss_quest: boolean;
  is_recurring: boolean;
  recurrence_type: string | null;
  recurrence_days: number[] | null;
  monthly_target: number | null;
  current_month_completions: number;
  last_completion_date: string | null;
  current_streak: number;
}

interface QuestListProps {
  onQuestCompleted?: () => void;
  filterCompleted?: boolean;
  maxDisplay?: number;
}

const QuestList = ({ onQuestCompleted, filterCompleted, maxDisplay }: QuestListProps) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [completeEffect, setCompleteEffect] = useState<{
    show: boolean;
    xp: number;
    gold: number;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    loadQuests();

    // Atualiza em tempo real quando uma missão é criada ou completada
    const handleQuestUpdate = () => {
      loadQuests();
    };

    window.addEventListener('questCreated', handleQuestUpdate);
    window.addEventListener('questCompleted', handleQuestUpdate);

    return () => {
      window.removeEventListener('questCreated', handleQuestUpdate);
      window.removeEventListener('questCompleted', handleQuestUpdate);
    };
  }, [filterCompleted]);

  const loadQuests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Falha ao carregar missões");
      console.error(error);
    } else {
      let filteredData = data || [];
      if (filterCompleted !== undefined) {
        filteredData = filteredData.filter(q => q.is_completed === filterCompleted);
      }
      setQuests(filteredData);
    }
    setLoading(false);
  };

  const handleCompleteQuest = async (questId: string, event?: any) => {
    // Get click position for effect
    let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    if (event && event.target) {
      const rect = event.target.closest('.quest-card')?.getBoundingClientRect();
      if (rect) {
        position = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    }

    try {
      const { data, error } = await supabase.rpc("complete_quest", {
        quest_id: questId,
      });

      if (error) {
        toast.error(error.message);
        return;
      }
      const result = data as any;
      
      // Show particle effect
      setCompleteEffect({
        show: true,
        xp: result.xp_gained,
        gold: result.gold_gained,
        position,
      });
      
      // Show quest completion toast
      toast.success(`⚔️ Missão Completa! +${result.xp_gained} XP, +${result.gold_gained} Ouro`);
      
      // If level up, show epic animation after particle effect
      if (result.level_up) {
        setTimeout(() => {
          setNewLevel(result.new_level);
          setShowLevelUp(true);
        }, 1000);
      }
      
      await loadQuests();
      if (onQuestCompleted) {
        onQuestCompleted();
      }
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('questCompleted'));
    } catch (err) {
      console.error('Error completing quest:', err);
    }
  };
  
  const handleLevelUpComplete = () => {
    setShowLevelUp(false);
  };
  
  const handleEffectComplete = () => {
    setCompleteEffect(null);
  };

  const handleDeleteQuest = async (questId: string) => {
    const { error } = await supabase
      .from("quests")
      .delete()
      .eq("id", questId);

    if (error) {
      toast.error("Falha ao deletar missão");
    } else {
      toast.success("Missão deletada");
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "alta";
      case "medium": return "média";
      case "low": return "baixa";
      default: return priority;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "produtividade": return "💼";
      case "bem-estar": return "🧘";
      case "criatividade": return "🎨";
      case "forca": return "💪";
      default: return "📝";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "produtividade": return "Produtividade";
      case "bem-estar": return "Bem-estar";
      case "criatividade": return "Criatividade";
      case "forca": return "Força";
      default: return category;
    }
  };

  const getMonthlyProgress = (quest: Quest) => {
    if (!quest.is_recurring || quest.recurrence_type !== "monthly") return null;
    const target = quest.monthly_target || 30;
    const current = quest.current_month_completions || 0;
    return { current, target };
  };

  const getDayNames = (days: number[] | null) => {
    if (!days || days.length === 0) return "Todos os dias";
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return days.map(d => dayNames[d]).join(", ");
  };

  const canCompleteToday = (quest: Quest) => {
    if (!quest.is_recurring) return !quest.is_completed;
    const today = new Date().toISOString().split('T')[0];
    return quest.last_completion_date !== today;
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Carregando missões...</div>;
  }

  const activeQuests = quests.filter((q) => q.is_recurring ? canCompleteToday(q) : !q.is_completed);
  const completedQuests = quests.filter((q) => q.is_completed && !q.is_recurring);
  
  // Limit display if maxDisplay is set
  const displayedActiveQuests = maxDisplay ? activeQuests.slice(0, maxDisplay) : activeQuests;
  const displayedCompletedQuests = maxDisplay ? completedQuests.slice(0, maxDisplay) : completedQuests;

  return (
    <>
      {showLevelUp && (
        <LevelUpAnimation newLevel={newLevel} onComplete={handleLevelUpComplete} />
      )}
      
      {completeEffect && (
        <QuestCompleteEffect
          xpGained={completeEffect.xp}
          goldGained={completeEffect.gold}
          position={completeEffect.position}
          onComplete={handleEffectComplete}
        />
      )}
      
      <div className="space-y-6">
      {/* Active Quests */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Missões Ativas</h3>
        {activeQuests.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Sem missões ativas. Crie sua primeira missão para começar!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayedActiveQuests.map((quest) => (
              <Card key={quest.id} className={`quest-card bg-card border-border hover:border-primary transition-all ${quest.is_boss_quest ? "border-secondary" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={false}
                      onCheckedChange={(e) => handleCompleteQuest(quest.id, e)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-2">
                             {quest.is_boss_quest && <Sword className="w-5 h-5 text-secondary" />}
                             <span className="text-xl">{getCategoryIcon(quest.category)}</span>
                             <h4 className="font-semibold text-foreground">{quest.title}</h4>
                             {quest.is_recurring && (
                               <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs ml-auto">
                                 Hábito
                               </Badge>
                             )}
                           </div>
                          
                          {quest.is_recurring && (
                            <div className="mb-3 space-y-2">
                              {/* Ícones estilo Nectar */}
                              <div className="flex items-center gap-3 text-sm">
                                {/* Streak */}
                                <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg border border-accent/20">
                                  <span className="text-base">🔥</span>
                                  <span className="font-semibold text-accent">{quest.current_streak || 0}</span>
                                  <span className="text-muted-foreground text-xs">dias</span>
                                </div>
                                
                                {/* Progresso mensal */}
                                {quest.recurrence_type === "monthly" && (
                                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                                    <span className="text-base">✔️</span>
                                    <span className="font-semibold text-primary">
                                      {getMonthlyProgress(quest)?.current || 0}/{getMonthlyProgress(quest)?.target || 30}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Frequência */}
                                <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg border border-border">
                                  <span className="text-base">📅</span>
                                  <span className="text-xs text-muted-foreground">
                                    {quest.recurrence_type === "daily" ? "Diário" :
                                     quest.recurrence_type === "weekly" ? getDayNames(quest.recurrence_days) :
                                     "Mensal"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                              {getCategoryLabel(quest.category)}
                            </Badge>
                            {!quest.is_recurring && (
                              <Badge variant="outline" className={getPriorityColor(quest.priority)}>
                                {getPriorityLabel(quest.priority)}
                              </Badge>
                            )}
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              +{quest.xp_reward} XP
                            </Badge>
                            <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20">
                              +{quest.gold_reward} 💰
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
      {completedQuests.length > 0 && !maxDisplay && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Missões Completas</h3>
          <div className="space-y-3">
            {displayedCompletedQuests.map((quest) => (
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
    </>
  );
};

export default QuestList;
