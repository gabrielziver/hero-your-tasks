import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setEmail(session.user.email || "");
      loadProfile(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(error);
    } else {
      setProfile(data);
      setUsername(data.username || "");
      setAvatarUrl(data.avatar_url || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("O nome de usuário não pode estar vazio");
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        username,
        avatar_url: avatarUrl || null
      })
      .eq("id", user.id);

    if (profileError) {
      if (profileError.code === "23505") {
        toast.error("Nome de usuário já está em uso");
      } else {
        toast.error("Falha ao atualizar perfil");
      }
      setSaving(false);
      return;
    }

    // Update password if provided
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        toast.error("As senhas não coincidem");
        setSaving(false);
        return;
      }

      if (newPassword.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        setSaving(false);
        return;
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passwordError) {
        toast.error("Falha ao atualizar senha");
        setSaving(false);
        return;
      }
    }

    toast.success("Perfil atualizado!");
    setNewPassword("");
    setConfirmPassword("");
    loadProfile(user.id);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground">
              <User className="w-6 h-6 text-primary" />
              Perfil do Herói
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="avatarUrl">URL do Avatar RPG</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/avatar.jpg"
                disabled={saving}
              />
              {avatarUrl && (
                <div className="mt-2">
                  <img 
                    src={avatarUrl} 
                    alt="Avatar preview" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      toast.error("URL de imagem inválida");
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="username">Nome de usuário (Nickname)</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite o nome do seu herói"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled className="bg-muted" />
            </div>
            
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Alterar Senha</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-hero">
              {saving ? "Salvando..." : "Salvar Perfil"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
