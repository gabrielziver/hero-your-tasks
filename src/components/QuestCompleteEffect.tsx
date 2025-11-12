import { useEffect } from "react";
import { Sparkles, Coins } from "lucide-react";

interface QuestCompleteEffectProps {
  xpGained: number;
  goldGained: number;
  position: { x: number; y: number };
  onComplete: () => void;
}

const QuestCompleteEffect = ({ xpGained, goldGained, position, onComplete }: QuestCompleteEffectProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-40"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* XP particles rising */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`xp-${i}`}
          className="absolute"
          style={{
            animation: `particle-rise-side 1.5s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
            left: `${(Math.random() - 0.5) * 100}px`,
          }}
        >
          <Sparkles className="w-4 h-4 text-primary" fill="currentColor" />
        </div>
      ))}

      {/* Gold particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`gold-${i}`}
          className="absolute"
          style={{
            animation: `particle-rise-side 1.5s ease-out forwards`,
            animationDelay: `${i * 0.15}s`,
            left: `${(Math.random() - 0.5) * 80}px`,
          }}
        >
          <Coins className="w-3 h-3 text-gold" fill="currentColor" />
        </div>
      ))}

      {/* Text displays */}
      <div
        className="absolute whitespace-nowrap"
        style={{
          animation: "text-float 1.5s ease-out forwards",
          left: "-50px",
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="text-lg font-display font-bold text-primary glow-text">
            +{xpGained} XP
          </div>
          <div className="text-md font-display font-bold text-gold glow-text">
            +{goldGained} GOLD
          </div>
        </div>
      </div>

      {/* Expanding circle effect */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-primary"
        style={{
          animation: "circle-expand 1s ease-out forwards",
        }}
      />

      <style>{`
        @keyframes particle-rise-side {
          0% {
            opacity: 0;
            transform: translateY(0) translateX(0) scale(0);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-150px) translateX(${(Math.random() - 0.5) * 50}px) scale(1.2);
          }
        }

        @keyframes text-float {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.8);
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) scale(1.1);
          }
        }

        @keyframes circle-expand {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(4);
          }
        }
      `}</style>
    </div>
  );
};

export default QuestCompleteEffect;
