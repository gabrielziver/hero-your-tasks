import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, Trophy, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Falha ao sair");
    } else {
      toast.success("Saiu com sucesso");
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            TaskHero
          </Link>
          
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant={isActive("/dashboard") ? "default" : "ghost"} size="sm" className={isActive("/dashboard") ? "bg-gradient-hero" : ""}>
                <Home className="w-4 h-4 mr-2" />
                Missões
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant={isActive("/leaderboard") ? "default" : "ghost"} size="sm" className={isActive("/leaderboard") ? "bg-gradient-hero" : ""}>
                <Trophy className="w-4 h-4 mr-2" />
                Ranking
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant={isActive("/profile") ? "default" : "ghost"} size="sm" className={isActive("/profile") ? "bg-gradient-hero" : ""}>
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
