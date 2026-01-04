import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LiveLogs from "@/pages/LiveLogs";
import Handovers from "@/pages/Handovers";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Navigation />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/logs" component={LiveLogs} />
          <Route path="/handovers" component={Handovers} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
