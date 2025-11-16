import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Smartphone, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-hero mb-4">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Instale o Task Level
          </h1>
          <p className="text-xl text-muted-foreground">
            Tenha acesso rápido e notificações no seu dispositivo
          </p>
        </div>

        <Card className="bg-card border-border p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Acesso Instantâneo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Abra o app direto da tela inicial, sem precisar do navegador
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Notificações Push
                </h3>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes para manter seu streak e completar missões
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Funciona Offline
                </h3>
                <p className="text-sm text-muted-foreground">
                  Continue usando mesmo sem conexão com a internet
                </p>
              </div>
            </div>
          </div>

          {isInstallable ? (
            <Button
              onClick={handleInstall}
              className="w-full py-6 text-lg bg-gradient-hero"
              size="lg"
            >
              Instalar Agora
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-semibold text-foreground mb-2">
                  Como instalar no seu dispositivo:
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>iPhone/iPad:</strong> Toque no ícone de compartilhar{" "}
                    <span className="inline-block">📤</span> e depois em "Adicionar à Tela de Início"
                  </li>
                  <li>
                    <strong>Android (Chrome):</strong> Toque nos 3 pontos ⋮ no menu e depois em "Instalar app" ou "Adicionar à tela inicial"
                  </li>
                  <li>
                    <strong>Desktop (Chrome):</strong> Clique no ícone de instalação{" "}
                    <span className="inline-block">⊕</span> na barra de endereço
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full py-6 text-lg"
                size="lg"
              >
                Continuar no Navegador
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Install;
