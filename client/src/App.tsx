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
import StudentLogin from "./pages/StudentLogin";
import Presenca from "./pages/Presenca";
import Dashboard from "./pages/Dashboard";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherRegister from "./pages/TeacherRegister";
import TeacherForgotPassword from "./pages/TeacherForgotPassword";
import TeacherResetPassword from "./pages/TeacherResetPassword";
import SuperAdminSetup from "./pages/SuperAdminSetup";
import SuperAdminProfile from "./pages/SuperAdminProfile";
import ProfessorLogin from "./pages/ProfessorLogin";
import ProfessorSignup from "./pages/ProfessorSignup";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import PerformanceReport from "./pages/PerformanceReport";
import LoungePlaylist from "./components/LoungePlaylist";

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
      <Route path={"/login-aluno"} component={StudentLogin} />
      <Route path={"/presenca"} component={Presenca} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/performance"} component={PerformanceReport} />
      <Route path={"/professor/login"} component={ProfessorLogin} />
      <Route path={"/professor/signup"} component={ProfessorSignup} />
      <Route path={"/professor/cadastro"} component={TeacherRegister} />
      <Route path={"/professor/esqueci-senha"} component={TeacherForgotPassword} />
      <Route path={"/professor/redefinir-senha"} component={TeacherResetPassword} />
      <Route path={"/super-admin/login"} component={SuperAdminLogin} />
      <Route path={"/super-admin/setup"} component={SuperAdminSetup} />
      <Route path={"/super-admin/perfil"} component={SuperAdminProfile} />
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
          <LoungePlaylist />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
