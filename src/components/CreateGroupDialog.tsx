import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Users, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  onGroupCreated: () => void;
}

const CreateGroupDialog = ({ onGroupCreated }: CreateGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<{ id: string; name: string; invite_code: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Por favor, insira um nome para o grupo");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Você precisa estar logado");
      setLoading(false);
      return;
    }

    // Create group
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: groupName,
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError) {
      toast.error("Falha ao criar grupo");
      console.error(groupError);
      setLoading(false);
      return;
    }

    // Add creator to group members
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({
        group_id: groupData.id,
        user_id: user.id,
      });

    if (memberError) {
      toast.error("Falha ao adicionar membro ao grupo");
      console.error(memberError);
    } else {
      toast.success("Grupo criado!");
      setCreatedGroup(groupData);
      setGroupName("");
      onGroupCreated();
    }
    setLoading(false);
  };

  const copyInviteLink = () => {
    if (!createdGroup) return;
    const inviteLink = `${window.location.origin}/leaderboard?invite=${createdGroup.invite_code}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedGroup(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-hero">
          <Users className="w-4 h-4 mr-2" />
          Criar Grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {createdGroup ? "Grupo Criado!" : "Criar Novo Grupo"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {createdGroup 
              ? "Compartilhe o link abaixo para convidar amigos"
              : "Crie um grupo e convide amigos para competir"
            }
          </DialogDescription>
        </DialogHeader>
        
        {createdGroup ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Nome do Grupo:</p>
              <p className="text-lg font-bold text-primary">{createdGroup.name}</p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Código de Convite:</p>
              <p className="text-lg font-mono font-bold text-primary break-all">
                {createdGroup.invite_code}
              </p>
            </div>

            <Button 
              onClick={copyInviteLink} 
              className="w-full bg-gradient-hero"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link de Convite
                </>
              )}
            </Button>

            <Button 
              onClick={handleClose} 
              variant="outline"
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="groupName">Nome do Grupo</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Digite o nome do grupo..."
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
              {loading ? "Criando..." : "Criar Grupo"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;