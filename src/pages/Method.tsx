import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BookOpen } from "lucide-react";

const Method = () => {
  const categories = [
    {
      title: "Vida Pessoal",
      icon: "🏠",
      items: [
        "Defina sua identidade ideal (quem você quer ser)",
        "Crie um ambiente que facilite bons hábitos",
        "Comece com hábitos de 2 minutos",
        "Faça o registro diário das pequenas vitórias",
        "Revise semanalmente seu progresso",
      ],
    },
    {
      title: "Saúde",
      icon: "💪",
      items: [
        "Defina horário fixo para treino (faça parte da identidade)",
        "Prepare a roupa de treino na noite anterior",
        "Comece com 10 minutos de exercício",
        "Acompanhe evolução semanal (peso, medidas, energia)",
        "Crie sistema de recompensa para manter consistência",
      ],
    },
    {
      title: "Trabalho / Negócios",
      icon: "💼",
      items: [
        "Defina 3 grandes metas anuais",
        "Quebre em metas trimestrais",
        "Planeje semana todo domingo",
        "Bloqueie tempo para deep work (2-3h por dia)",
        "Revise métricas semanalmente",
      ],
    },
    {
      title: "Finanças",
      icon: "💰",
      items: [
        "Registre todas entradas e saídas",
        "Defina orçamento mensal por categoria",
        "Automatize 20% da renda para investimentos",
        "Revise gastos toda sexta-feira",
        "Defina meta financeira de longo prazo",
      ],
    },
    {
      title: "Relacionamentos",
      icon: "❤️",
      items: [
        "Agende tempo de qualidade semanal",
        "Pratique escuta ativa diariamente",
        "Faça pequenos gestos de atenção",
        "Revise relações mensalmente (quem soma, quem drena)",
        "Cultive conexões que te fazem crescer",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-primary">Método Task Level</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-card border-border p-6 space-y-4">
          <Badge className="bg-gradient-gold text-background">Baseado em Hábitos Atômicos</Badge>
          <h2 className="text-2xl font-bold text-foreground">Organização Anual de Vida</h2>
          <p className="text-muted-foreground leading-relaxed">
            Este método é inspirado no bestseller "Hábitos Atômicos" de James Clear e em estudos de 
            performance de pessoas bem-sucedidas. A ideia é transformar pequenos hábitos em grandes resultados 
            através de um sistema estruturado e gamificado.
          </p>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Áreas de Vida</h3>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {categories.map((category, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-none">
                <Card className="bg-card border-border overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-semibold text-foreground">{category.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <ul className="space-y-3 mt-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Card className="bg-primary/10 border-primary p-6">
          <p className="text-sm text-foreground leading-relaxed">
            <strong>💡 Dica:</strong> Este método completo será enviado por e-mail em formato PDF após a 
            confirmação da sua assinatura. Dentro do app, você terá acesso a missões e checklists 
            gamificados para aplicar tudo na prática!
          </p>
        </Card>
      </div>

      <NavBar />
    </div>
  );
};

export default Method;
