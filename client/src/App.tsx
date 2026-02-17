import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import StudentProgress from "./pages/StudentProgress";
import Avisos from "./pages/Avisos";
import Materiais from "./pages/Materiais";
import Conquistas from "./pages/Conquistas";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/leaderboard"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/meu-progresso"} component={StudentProgress} />
      <Route path={"/avisos"} component={Avisos} />
      <Route path={"/materiais"} component={Materiais} />
      <Route path={"/conquistas"} component={Conquistas} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
