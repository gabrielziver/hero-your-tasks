import { Link, useLocation } from "react-router-dom";
import { Home, Target, Flame, Trophy, Settings } from "lucide-react";

const NavBar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/quests", icon: Target, label: "Missões" },
    { path: "/streak", icon: Flame, label: "Streak", isCenter: true },
    { path: "/leaderboard", icon: Trophy, label: "Ranking" },
    { path: "/profile", icon: Settings, label: "Config" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all ${
                  item.isCenter 
                    ? "relative -top-4" 
                    : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-full transition-all ${
                    item.isCenter
                      ? active
                        ? "w-16 h-16 bg-gradient-accent streak-pulse"
                        : "w-16 h-16 bg-gradient-hero"
                      : active
                      ? "w-12 h-12 bg-accent/20"
                      : "w-12 h-12 hover:bg-muted"
                  }`}
                >
                  <Icon
                    className={`transition-colors ${
                      item.isCenter
                        ? "w-8 h-8 text-accent-foreground"
                        : active
                        ? "w-6 h-6 text-accent"
                        : "w-6 h-6 text-secondary"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    item.isCenter
                      ? "hidden"
                      : active
                      ? "text-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
