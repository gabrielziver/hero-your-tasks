import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Quiz from "./pages/Quiz";
import DiagnosticResult from "./pages/DiagnosticResult";
import TrialOffer from "./pages/TrialOffer";
import Plans from "./pages/Plans";
import Install from "./pages/Install";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Streak from "./pages/Streak";
import Quests from "./pages/Quests";
import Shop from "./pages/Shop";
import Finance from "./pages/Finance";
import AIAssistant from "./pages/AIAssistant";
import Method from "./pages/Method";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/diagnostic-result" element={<DiagnosticResult />} />
          <Route path="/trial-offer" element={<TrialOffer />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/install" element={<Install />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/streak" element={<Streak />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/method" element={<Method />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
