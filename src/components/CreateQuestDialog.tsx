import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateQuestDialogProps {
  onQuestCreated: () => void;
}

const CreateQuestDialog = ({ onQuestCreated }: CreateQuestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a quest title");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in");
      setLoading(false);
      return;
    }

    const xpReward = priority === "high" ? 30 : priority === "medium" ? 20 : 10;
    const goldReward = priority === "high" ? 15 : priority === "medium" ? 10 : 5;

    const { error } = await supabase.from("quests").insert({
      user_id: user.id,
      title,
      category,
      priority,
      xp_reward: xpReward,
      gold_reward: goldReward,
    });

    if (error) {
      toast.error("Failed to create quest");
      console.error(error);
    } else {
      toast.success("Quest created!");
      setTitle("");
      setCategory("general");
      setPriority("medium");
      setOpen(false);
      onQuestCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          New Quest
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Quest</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new quest to your journey
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Quest Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your quest..."
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (10 XP, 5 Gold)</SelectItem>
                <SelectItem value="medium">Medium (20 XP, 10 Gold)</SelectItem>
                <SelectItem value="high">High (30 XP, 15 Gold)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
            {loading ? "Creating..." : "Create Quest"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestDialog;
