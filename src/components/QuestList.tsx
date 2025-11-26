import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "produtividade":
        return "#A88CFF";
      case "bem-estar":
        return "#FF6EC7";
      case "criatividade":
        return "#6CE0FF";
      case "forca":
        return "#FFD34E";
      default:
        return "#A88CFF";
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
          <div className="relative bg-[#12141C] rounded-xl overflow-hidden p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Sem missões ativas. Crie sua primeira missão para começar!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedActiveQuests.map((quest) => (
              <div
                key={quest.id}
                className="quest-card group relative bg-[#12141C] rounded-xl overflow-hidden hover:bg-[#1a1c24] transition-all"
              >
                {/* Colored Left Border */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: getCategoryColor(quest.category) }}
                />
                
                {/* Card Content */}
                <div className="flex items-center gap-3 p-3 pl-5">
                  {/* Category Icon (Small) */}
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getCategoryIcon(quest.category)}</span>
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title Row */}
                    <div className="flex items-center gap-2 mb-1">
                      {quest.is_boss_quest && (
                        <Sword className="w-4 h-4 flex-shrink-0" style={{ color: getCategoryColor(quest.category) }} />
                      )}
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {quest.title}
                      </h4>
                      {quest.is_recurring && (
                        <span className="flex-shrink-0 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          Hábito
                        </span>
                      )}
                    </div>
                    
                    {/* Stats Row - Compact */}
                    {quest.is_recurring ? (
                      <div className="flex items-center gap-2 text-xs">
                        {/* Streak */}
                        <div className="flex items-center gap-1">
                          <span>🔥</span>
                          <span className="font-semibold" style={{ color: getCategoryColor(quest.category) }}>
                            {quest.current_streak || 0}
                          </span>
                        </div>
                        
                        {/* Monthly Progress */}
                        {quest.recurrence_type === "monthly" && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1">
                              <span>✔️</span>
                              <span className="text-muted-foreground">
                                {getMonthlyProgress(quest)?.current || 0}/{getMonthlyProgress(quest)?.target || 30}
                              </span>
                            </div>
                          </>
                        )}
                        
                        {/* Frequency */}
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span className="text-muted-foreground">
                            {quest.recurrence_type === "daily" ? "Diário" :
                             quest.recurrence_type === "weekly" ? getDayNames(quest.recurrence_days) :
                             "Mensal"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getCategoryLabel(quest.category)}</span>
                        <span>•</span>
                        <span className="capitalize">{getPriorityLabel(quest.priority)}</span>
                        <span>•</span>
                        <span>+{quest.xp_reward} XP</span>
                        <span>•</span>
                        <span>+{quest.gold_reward} 💰</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Delete Button (Hidden by default, shows on hover) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteQuest(quest.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    
                    {/* Complete Button */}
                    <Button
                      size="sm"
                      onClick={(e) => handleCompleteQuest(quest.id, e)}
                      className="h-8 px-3 text-xs font-medium"
                      style={{
                        backgroundColor: getCategoryColor(quest.category),
                        color: '#000',
                      }}
                    >
                      ✓ Completar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Quests */}
      {completedQuests.length > 0 && !maxDisplay && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Missões Completas</h3>
          <div className="space-y-2">
            {displayedCompletedQuests.map((quest) => (
              <div
                key={quest.id}
                className="relative bg-[#12141C] rounded-xl overflow-hidden opacity-50"
              >
                {/* Colored Left Border */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 opacity-50"
                  style={{ backgroundColor: getCategoryColor(quest.category) }}
                />
                
                {/* Card Content */}
                <div className="flex items-center gap-3 p-3 pl-5">
                  {/* Checkmark */}
                  <div className="flex-shrink-0 text-muted-foreground">
                    <span className="text-lg">✓</span>
                  </div>
                  
                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-muted-foreground line-through truncate">
                      {quest.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default QuestList;
