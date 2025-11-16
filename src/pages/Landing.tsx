import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verifica se já completou o onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          navigate('/dashboard');
        }
      }
    };
    checkUser();

    // Registra o service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado:', registration);
        })
        .catch(error => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Task Level
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-foreground">
            Organize sua vida como um herói em evolução.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            O Task Level é um sistema de produtividade inspirado em pessoas altamente bem-sucedidas, 
            baseado em estudos de performance, hábitos comprovados e psicologia comportamental.
          </p>

          <div className="space-y-4 pt-4">
            <Link to="/quiz">
              <Button size="lg" className="w-full text-lg py-6 bg-gradient-hero">
                Começar Quiz
              </Button>
            </Link>
            
            <Link to="/auth">
              <Button variant="outline" size="lg" className="w-full text-lg py-6">
                Já tenho conta / Entrar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
