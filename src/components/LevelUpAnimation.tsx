import { useEffect, useState } from "react";
import { Sparkles, Zap, Star } from "lucide-react";

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete: () => void;
}

const LevelUpAnimation = ({ newLevel, onComplete }: LevelUpAnimationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    // Auto-close after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl">
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-primary rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `particle-rise 2s ease-out ${particle.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Glow ring */}
        <div className="absolute inset-0 -m-20">
          <div className="w-full h-full rounded-full bg-primary/20 blur-3xl animate-pulse" />
        </div>

        {/* Icons burst */}
        <div className="relative mb-8">
          <Sparkles
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-primary"
            style={{
              animation: "icon-burst 1s ease-out forwards",
              filter: "drop-shadow(0 0 30px hsl(var(--primary)))",
            }}
          />
          <Zap
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-secondary"
            style={{
              animation: "icon-burst 1s ease-out 0.2s forwards",
              opacity: 0,
              filter: "drop-shadow(0 0 30px hsl(var(--secondary)))",
            }}
          />
          <Star
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-gold"
            style={{
              animation: "icon-burst 1s ease-out 0.4s forwards",
              opacity: 0,
              filter: "drop-shadow(0 0 30px hsl(var(--gold)))",
            }}
          />
        </div>

        {/* Text */}
        <div
          className="relative mt-32"
          style={{
            animation: "text-appear 0.5s ease-out 0.5s forwards",
            opacity: 0,
          }}
        >
          <h1 className="text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-hero mb-4 glow-text">
            LEVEL UP!
          </h1>
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-1 w-20 bg-gradient-hero rounded-full" />
            <div className="text-5xl font-display font-bold text-gold glow-text">
              {newLevel}
            </div>
            <div className="h-1 w-20 bg-gradient-hero rounded-full" />
          </div>
          <p className="text-xl text-secondary font-display">
            Novo Nível Alcançado!
          </p>
        </div>

        {/* Energy waves */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-primary"
            style={{
              animation: `wave-expand 2s ease-out ${i * 0.3}s infinite`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes particle-rise {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-100vh) scale(1.5);
          }
        }

        @keyframes icon-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2) rotate(180deg);
          }
        }

        @keyframes text-appear {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes wave-expand {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(3);
          }
        }
      `}</style>
    </div>
  );
};

export default LevelUpAnimation;
