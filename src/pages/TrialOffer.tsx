import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const TrialOffer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-hero mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Ative seu teste grátis de 3 dias
          </h1>
        </div>

        <Card className="bg-card border-border p-8 space-y-8">
          <div className="space-y-6">
            <p className="text-lg text-foreground text-center leading-relaxed">
              Você terá <span className="font-bold text-primary">3 dias completos</span> para 
              testar o método Task Level, sem cobrança agora. Se você gostar, continua 
              automaticamente pagando apenas{" "}
              <span className="font-bold text-primary">R$ 9,90</span> para continuar usando 
              todos os recursos.
            </p>

            <div className="bg-muted/30 rounded-lg p-6 border border-border space-y-4">
              <h3 className="font-semibold text-foreground text-center">O que você terá acesso:</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Sistema completo de missões e XP</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Acompanhamento de streak diário</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Ranking e competição</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Skins e personalização exclusivas</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Relatórios de progresso avançados</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => navigate("/plans")}
              className="w-full py-6 text-lg bg-gradient-hero"
              size="lg"
            >
              Iniciar teste grátis por R$0,00
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Nada será cobrado agora. A cobrança só acontece 3 dias depois. Cancele quando quiser antes do prazo.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TrialOffer;
