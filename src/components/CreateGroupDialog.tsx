import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  onGroupCreated: () => void;
}

const CreateGroupDialog = ({ onGroupCreated }: CreateGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

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
      setGroupName("");
      setOpen(false);
      onGroupCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-hero">
          <Users className="w-4 h-4 mr-2" />
          Criar Grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Criar Novo Grupo</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crie um grupo e convide amigos para competir
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;