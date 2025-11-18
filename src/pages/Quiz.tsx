import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const questions = [
  {
    id: 1,
    question: "Com que frequência você planeja seu dia?",
    options: [
      { value: "1", label: "Nunca", score: 0 },
      { value: "2", label: "Às vezes", score: 25 },
      { value: "3", label: "Quase sempre", score: 50 },
      { value: "4", label: "Todos os dias", score: 100 },
    ],
  },
  {
    id: 2,
    question: "Quantas vezes você cumpre tudo o que planeja?",
    options: [
      { value: "1", label: "Quase nunca", score: 0 },
      { value: "2", label: "Poucas vezes", score: 25 },
      { value: "3", label: "A maioria das vezes", score: 50 },
      { value: "4", label: "Sempre", score: 100 },
    ],
  },
  {
    id: 3,
    question: "O quanto você se perde em distrações (celular, redes sociais, etc.)?",
    options: [
      { value: "1", label: "Muito fácil", score: 0 },
      { value: "2", label: "Moderadamente", score: 25 },
      { value: "3", label: "Pouco", score: 50 },
      { value: "4", label: "Quase nunca", score: 100 },
    ],
  },
  {
    id: 4,
    question: "Como você definiria sua disciplina hoje?",
    options: [
      { value: "1", label: "Muito baixa", score: 0 },
      { value: "2", label: "Baixa", score: 25 },
      { value: "3", label: "Média", score: 50 },
      { value: "4", label: "Alta", score: 100 },
    ],
  },
  {
    id: 5,
    question: "Você sente que já deixou passar oportunidades por falta de organização?",
    options: [
      { value: "1", label: "Sim, muitas", score: 0 },
      { value: "2", label: "Algumas", score: 33 },
      { value: "3", label: "Poucas", score: 66 },
      { value: "4", label: "Quase nenhuma", score: 100 },
    ],
  },
  {
    id: 6,
    question: "Em relação ao seu corpo e saúde, você:",
    options: [
      { value: "1", label: "Nunca segue um plano", score: 0 },
      { value: "2", label: "Começa e para", score: 25 },
      { value: "3", label: "Mantém por um tempo", score: 50 },
      { value: "4", label: "Consegue seguir com consistência", score: 100 },
    ],
  },
  {
    id: 7,
    question: "Em relação à sua vida financeira, você:",
    options: [
      { value: "1", label: "Nunca sabe para onde o dinheiro vai", score: 0 },
      { value: "2", label: "Tem alguma noção, mas não anota", score: 25 },
      { value: "3", label: "Tenta controlar, mas não é consistente", score: 50 },
      { value: "4", label: "Tem tudo bem controlado", score: 100 },
    ],
  },
  {
    id: 8,
    question: "Você acredita que um método estruturado e gamificado poderia te ajudar a manter os hábitos no longo prazo?",
    options: [
      { value: "1", label: "Sim, preciso disso urgente", score: 100 },
      { value: "2", label: "Sim, ajudaria bastante", score: 75 },
      { value: "3", label: "Talvez, dependendo de como for", score: 40 },
      { value: "4", label: "Não tenho certeza", score: 0 },
    ],
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedValue, setSelectedValue] = useState("");

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    if (!selectedValue) return;

    const selectedOption = questions[currentQuestion].options.find(
      (opt) => opt.value === selectedValue
    );
    
    if (selectedOption) {
      setAnswers({ ...answers, [currentQuestion]: selectedOption.score });
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedValue("");
    } else {
      // Calcula o resultado e redireciona
      const totalScore = Object.values({ ...answers, [currentQuestion]: selectedOption?.score || 0 }).reduce((a, b) => a + b, 0);
      const maxScore = 800; // 8 perguntas * 100 pontos máximos
      const percentage = Math.round((totalScore / maxScore) * 100);
      navigate(`/diagnostic-result?score=${percentage}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Diagnóstico de Performance
          </h1>
          <p className="text-muted-foreground text-lg">
            Para personalizar sua evolução, responda este diagnóstico científico inspirado em estudos de performance mundial.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="bg-card border-border p-8">
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-foreground">
              {questions[currentQuestion].question}
            </h2>

            <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
              <div className="space-y-4">
                {questions[currentQuestion].options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                    onClick={() => setSelectedValue(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="text-lg cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <Button
              onClick={handleNext}
              disabled={!selectedValue}
              className="w-full py-6 text-lg bg-gradient-hero"
              size="lg"
            >
              {currentQuestion < questions.length - 1 ? "Próxima" : "Ver Resultado"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
