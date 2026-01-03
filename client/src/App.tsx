import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Sales from "./pages/Sales";
import Payments from "./pages/Payments";
import Collections from "./pages/Collections";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/clients">
        {() => (
          <DashboardLayout>
            <Clients />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/sales">
        {() => (
          <DashboardLayout>
            <Sales />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/payments">
        {() => (
          <DashboardLayout>
            <Payments />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/collections">
        {() => (
          <DashboardLayout>
            <Collections />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/login" component={Login} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
