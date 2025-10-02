import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sword, Trophy, Zap, Users } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBanner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent drop-shadow-lg">
            TaskHero
          </h1>
          <p className="text-2xl md:text-3xl mb-4 text-foreground font-semibold">
            Turn your tasks into quests.
          </p>
          <p className="text-xl md:text-2xl mb-12 text-muted-foreground">
            Level up your life.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-xl px-12 py-8 bg-gradient-hero hover:shadow-glow-primary transition-all duration-300 transform hover:scale-105">
              Start Free
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <Zap className="w-8 h-8 text-primary" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Sword className="w-12 h-12 text-primary" />}
              title="Create Quests"
              description="Transform your daily tasks into epic quests. Each quest is a step toward greatness."
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-secondary" />}
              title="Earn XP & Level Up"
              description="Complete quests to gain experience points. Level up your character and unlock your potential."
            />
            <FeatureCard
              icon={<Trophy className="w-12 h-12 text-primary" />}
              title="Collect Rewards"
              description="Earn gold coins and epic loot. Build streaks for bonus rewards and special achievements."
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-secondary" />}
              title="Compete & Rise"
              description="Climb the leaderboard. Compare your progress with friends and become a legend."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to Become a Hero?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join thousands of heroes leveling up their lives, one quest at a time.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-xl px-12 py-8 bg-gradient-gold text-card hover:shadow-glow-gold transition-all duration-300 transform hover:scale-105">
              Begin Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2025 TaskHero. Level up your life.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-all duration-300 hover:shadow-glow-primary transform hover:-translate-y-2">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
