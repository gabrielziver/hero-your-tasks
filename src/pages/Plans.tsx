import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Plans = () => {
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    // Redireciona para o auth para criar conta
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Escolha seu plano após os 3 dias grátis
          </h1>
          <p className="text-muted-foreground text-lg">
            Você não será cobrado agora. A cobrança acontece apenas após os 3 dias grátis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plano Anual */}
          <Card className="relative bg-card border-2 border-primary p-8 space-y-6">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white">
              Recomendado
            </Badge>

            <div className="text-center space-y-2">
              <Sparkles className="w-12 h-12 mx-auto text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Plano Anual</h2>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-primary">R$ 149,90</p>
                <p className="text-muted-foreground">por ano</p>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Economize 60%
                </Badge>
              </div>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-foreground">Acesso total ao sistema</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-foreground">Skins exclusivas</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-foreground">Relatórios avançados</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-foreground">Boost +10% XP</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-foreground">Badge Pro X</span>
              </li>
            </ul>

            <Button
              onClick={handleSelectPlan}
              className="w-full py-6 text-lg bg-gradient-hero"
              size="lg"
            >
              Selecionar plano anual
            </Button>
          </Card>

          {/* Plano Mensal */}
          <Card className="bg-card border-border p-8 space-y-6">
            <div className="text-center space-y-2">
              <Zap className="w-12 h-12 mx-auto text-accent" />
              <h2 className="text-3xl font-bold text-foreground">Plano Mensal</h2>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-accent">R$ 29,90</p>
                <p className="text-muted-foreground">por mês</p>
              </div>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-accent" />
                <span className="text-foreground">Acesso total ao sistema</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-accent" />
                <span className="text-foreground">Sem anúncios</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-accent" />
                <span className="text-foreground">Loja completa</span>
              </li>
            </ul>

            <Button
              onClick={handleSelectPlan}
              variant="outline"
              className="w-full py-6 text-lg border-accent text-accent hover:bg-accent hover:text-background"
              size="lg"
            >
              Selecionar plano mensal
            </Button>
          </Card>
        </div>

        <p className="text-center text-muted-foreground">
          Você não será cobrado agora. A cobrança acontece apenas após os 3 dias grátis.
        </p>
      </div>
    </div>
  );
};

export default Plans;
