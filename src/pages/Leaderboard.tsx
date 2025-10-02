import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  level: number;
  total_xp: number;
  quests_completed: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(session.user.id);
      loadLeaderboard();
    };
    checkAuth();
  }, [navigate]);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from("user_stats")
      .select(`
        user_id,
        level,
        total_xp,
        quests_completed,
        profiles (username)
      `)
      .order("total_xp", { ascending: false })
      .limit(10);

    if (error) {
      console.error(error);
    } else {
      const formatted = data.map((entry: any) => ({
        user_id: entry.user_id,
        username: entry.profiles?.username || "Unknown Hero",
        level: entry.level,
        total_xp: entry.total_xp,
        quests_completed: entry.quests_completed,
      }));
      setLeaderboard(formatted);
    }
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-secondary" />;
    if (index === 1) return <Medal className="w-6 h-6 text-muted-foreground" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">Top Heroes of the Realm</p>
        </div>

        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <Card 
              key={entry.user_id} 
              className={`bg-gradient-card border-border transition-all hover:border-primary ${
                entry.user_id === currentUserId ? "border-primary shadow-glow-primary" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">
                      {entry.username}
                      {entry.user_id === currentUserId && (
                        <span className="ml-2 text-sm text-primary">(You)</span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Level {entry.level} • {entry.quests_completed} quests completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                      {entry.total_xp.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No heroes yet. Be the first!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
