import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
}

const Finance = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const handleAddTransaction = () => {
    if (!formData.amount || !formData.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({ type: "income", amount: "", description: "" });
    setShowForm(false);

    toast({
      title: "Sucesso!",
      description: `${formData.type === "income" ? "Entrada" : "Gasto"} registrado com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-primary">Finanças</h1>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-gradient-hero">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">Entradas</p>
            <p className="text-2xl font-bold text-accent mt-1">R$ {totalIncome.toFixed(2)}</p>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">Gastos</p>
            <p className="text-2xl font-bold text-destructive mt-1">R$ {totalExpenses.toFixed(2)}</p>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
              R$ {balance.toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="bg-card border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Nova Transação</h3>
            
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Salário, Aluguel, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button onClick={handleAddTransaction} className="w-full bg-gradient-hero">
              Adicionar Transação
            </Button>
          </Card>
        )}

        {/* Lista de Transações */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Histórico</h3>
          {transactions.length === 0 ? (
            <Card className="bg-card border-border p-6 text-center">
              <p className="text-muted-foreground">Nenhuma transação ainda</p>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id} className="bg-card border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {transaction.type === "income" ? (
                      <TrendingUp className="w-5 h-5 text-accent" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold ${transaction.type === "income" ? "text-accent" : "text-destructive"}`}>
                    {transaction.type === "income" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <NavBar />
    </div>
  );
};

export default Finance;
