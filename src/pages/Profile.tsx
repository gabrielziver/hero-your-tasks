import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import NotificationSettings from "@/components/NotificationSettings";
import AvatarCreator, { AvatarConfig } from "@/components/AvatarCreator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Upload } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);

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
      // Load avatar config if exists
      if (data.avatar_color) {
        try {
          setAvatarConfig(JSON.parse(data.avatar_color));
        } catch (e) {
          console.error("Failed to parse avatar config:", e);
        }
      }
    }
    setLoading(false);
  };

  const handleAvatarSave = async (config: AvatarConfig) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_color: JSON.stringify(config) })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao salvar avatar");
    } else {
      setAvatarConfig(config);
      toast.success("Avatar salvo com sucesso!");
    }
    setSaving(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Imagem carregada com sucesso!");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
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
    <div className="min-h-screen bg-background pb-24">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-display font-bold text-primary mb-6">Perfil do Herói</h1>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="avatar">Avatar 2D</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <User className="w-6 h-6 text-primary" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Avatar do Herói</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                        onError={(e) => {
                          e.currentTarget.src = "";
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-hero flex items-center justify-center border-2 border-primary">
                        <User className="w-12 h-12 text-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || saving}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? "Enviando..." : "Escolher Imagem"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG ou WEBP (max 5MB)
                      </p>
                    </div>
                  </div>
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
          </TabsContent>
          
          <TabsContent value="avatar">
            <AvatarCreator 
              onSave={handleAvatarSave} 
              initialConfig={avatarConfig || undefined}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
};

export default Profile;
