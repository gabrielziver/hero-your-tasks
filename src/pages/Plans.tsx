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
        </div>

        <Card className="bg-card border-border p-8 space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-gradient-gold px-4 py-2 rounded-full">
              <span className="text-sm font-bold text-background">Plano Principal</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Plano Mensal MVP</h2>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">R$ 9,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>
          </div>

          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Acesso total ao app</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Sem anúncios</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Acesso à loja e recompensas</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Participar de grupos de metas com ranking</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Método completo de organização anual (PDF por e-mail)</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Aplicação prática do método (checklists e missões gamificadas)</span>
            </li>
          </ul>

          <Button
            onClick={handleSelectPlan}
            className="w-full py-6 text-lg bg-gradient-hero"
            size="lg"
          >
            Selecionar plano R$ 9,90/mês
          </Button>
        </Card>

        <p className="text-sm text-muted-foreground text-center max-w-md mx-auto">
          Você não será cobrado agora. A cobrança acontece apenas após os 3 dias grátis.
        </p>
        
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto mt-4">
          O método Task Level é baseado em Hábitos Atômicos e será entregue por e-mail após a confirmação da assinatura.
        </p>
      </div>
    </div>
  );
};

export default Plans;
