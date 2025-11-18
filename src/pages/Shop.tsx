import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Shop = () => {
  const { toast } = useToast();
  const [userGold] = useState(1000); // Simulado - virá do banco

  const skins = [
    { id: 1, name: "Armadura Dourada", price: 500, category: "premium" },
    { id: 2, name: "Roupa Casual", price: 100, category: "basic" },
    { id: 3, name: "Roupa Futurista", price: 300, category: "special" },
  ];

  const borders = [
    { id: 1, name: "Borda de Fogo", price: 200, category: "premium" },
    { id: 2, name: "Borda Simples", price: 50, category: "basic" },
    { id: 3, name: "Borda Neon", price: 150, category: "special" },
  ];

  const effects = [
    { id: 1, name: "Aura Brilhante", price: 400, category: "premium" },
    { id: 2, name: "Partículas", price: 250, category: "special" },
    { id: 3, name: "Chamas", price: 350, category: "premium" },
  ];

  const boosts = [
    { id: 1, name: "Boost XP 24h", price: 300, category: "special" },
    { id: 2, name: "Boost XP 7 dias", price: 1000, category: "premium" },
  ];

  const handlePurchase = (item: any) => {
    if (userGold >= item.price) {
      toast({
        title: "Item comprado!",
        description: `Você comprou ${item.name} por ${item.price} moedas.`,
      });
    } else {
      toast({
        title: "Moedas insuficientes",
        description: "Complete mais missões para ganhar moedas!",
        variant: "destructive",
      });
    }
  };

  const ItemCard = ({ item }: { item: any }) => (
    <Card className="bg-card border-border p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-foreground">{item.name}</h3>
        <Badge variant={item.category === "premium" ? "default" : "secondary"}>
          {item.category === "premium" ? "Premium" : item.category === "special" ? "Especial" : "Básico"}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-accent" />
          <span className="font-bold text-accent">{item.price}</span>
        </div>
        <Button
          size="sm"
          onClick={() => handlePurchase(item)}
          className="bg-gradient-hero"
        >
          Comprar
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-primary">Loja</h1>
            <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-accent" />
              <span className="font-bold text-accent">{userGold}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <p className="text-muted-foreground text-center">
          Complete missões para ganhar moedas e comprar itens exclusivos!
        </p>

        <Tabs defaultValue="skins" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skins">Skins</TabsTrigger>
            <TabsTrigger value="borders">Bordas</TabsTrigger>
            <TabsTrigger value="effects">Efeitos</TabsTrigger>
            <TabsTrigger value="boosts">Boosts</TabsTrigger>
          </TabsList>

          <TabsContent value="skins" className="space-y-4 mt-6">
            {skins.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </TabsContent>

          <TabsContent value="borders" className="space-y-4 mt-6">
            {borders.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </TabsContent>

          <TabsContent value="effects" className="space-y-4 mt-6">
            {effects.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </TabsContent>

          <TabsContent value="boosts" className="space-y-4 mt-6">
            {boosts.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <NavBar />
    </div>
  );
};

export default Shop;
