import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CharacterAvatar from "@/components/CharacterAvatar";
import QuestList from "@/components/QuestList";
import CreateQuestDialog from "@/components/CreateQuestDialog";
import CreateGroupQuestDialog from "@/components/CreateGroupQuestDialog";
import GroupQuestList from "@/components/GroupQuestList";
import NavBar from "@/components/NavBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [groupQuestKey, setGroupQuestKey] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await Promise.all([
        loadStats(session.user.id),
        loadGroups(session.user.id)
      ]);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
        loadStats(session.user.id);
        loadGroups(session.user.id);
      }
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      toast.error("Falha ao carregar estatísticas");
      console.error(error);
    } else {
      setStats(data);
    }
    setLoading(false);
  };

  const loadGroups = async (userId: string) => {
    const { data: memberData, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (memberError) {
      console.error(memberError);
      return;
    }

    const groupIds = memberData?.map(m => m.group_id) || [];
    
    if (groupIds.length === 0) return;

    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select("id, name")
      .in("id", groupIds);

    if (groupsError) {
      console.error(groupsError);
    } else {
      setGroups(groupsData || []);
      if (groupsData && groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0].id);
      }
    }
  };

  const refreshStats = () => {
    if (user) {
      loadStats(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-foreground">Carregando sua missão...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Character Section */}
          <div className="lg:col-span-1">
            <CharacterAvatar stats={stats} />
          </div>

          {/* Quests Section */}
          <div className="lg:col-span-2">
            {/* Group Quests Section */}
            {groups.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Missões Especiais do Grupo
                  </h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Selecione um grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedGroup && (
                      <CreateGroupQuestDialog 
                        groupId={selectedGroup} 
                        onQuestCreated={() => setGroupQuestKey(k => k + 1)} 
                      />
                    )}
                  </div>
                </div>
                {selectedGroup && (
                  <GroupQuestList key={groupQuestKey} groupId={selectedGroup} />
                )}
              </div>
            )}

            {/* Personal Quests */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Missões Pessoais</h2>
                <CreateQuestDialog onQuestCreated={refreshStats} />
              </div>
              <QuestList onQuestCompleted={refreshStats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
