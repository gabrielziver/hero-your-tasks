import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const DiagnosticResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const score = parseInt(searchParams.get("score") || "50");
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Animação do score
    const interval = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev >= score) {
          clearInterval(interval);
          return score;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [score]);

  const getMessage = () => {
    if (score <= 45) {
      return "Você tem um enorme potencial de crescimento. Com a estrutura certa, sua evolução pode acelerar rapidamente.";
    } else if (score <= 70) {
      return "Você já possui uma base, mas precisa de organização profissional para alcançar resultados consistentes.";
    } else {
      return "Seu foco é bom, mas falta uma estratégia forte para atingir objetivos maiores.";
    }
  };

  const getColor = () => {
    if (score <= 45) return "text-destructive";
    if (score <= 70) return "text-accent";
    return "text-primary";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Sua Organização Atual
          </h1>
        </div>

        <Card className="bg-card border-border p-8 space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - displayScore / 100)}`}
                  className={getColor()}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-5xl font-bold ${getColor()}`}>
                  {displayScore}%
                </span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <p className="text-lg text-foreground text-center leading-relaxed">
                {getMessage()}
              </p>

              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Este diagnóstico é baseado em estudos reais de alta performance, 
                  psicologia comportamental e hábitos de pessoas bem-sucedidas mundialmente.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/trial-offer")}
            className="w-full py-6 text-lg bg-gradient-hero"
            size="lg"
          >
            Continuar
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticResult;
