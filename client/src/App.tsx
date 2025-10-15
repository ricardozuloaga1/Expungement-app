import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ChatProvider } from "@/components/chat/chat-context";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Footer } from "@/components/footer";
import Landing from "@/pages/landing";
import LearnMore from "@/pages/learn-more";
import Home from "@/pages/home";
import Questionnaire from "@/pages/questionnaire";
import Results from "@/pages/results";
import Education from "@/pages/education";
import ModulePage from "@/pages/module";
import Premium from "@/pages/premium";
import DesignTest from "@/pages/design-test";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/questionnaire" component={Questionnaire} />
          <Route path="/results/:id" component={Results} />
          <Route path="/education" component={Education} />
          <Route path="/education/module/:id" component={ModulePage} />
        </>
      )}
      {/* Premium route accessible to both authenticated and unauthenticated users */}
      <Route path="/premium" component={Premium} />
      <Route path="/learn-more" component={LearnMore} />
      <Route path="/design-test" component={DesignTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatProvider>
          <Toaster />
          <div className="min-h-screen flex flex-col">
            <Router />
            <Footer />
          </div>
          <ChatWidget />
        </ChatProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
