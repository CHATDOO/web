import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ServerDetails from "@/pages/ServerDetails";
import Cars from "@/pages/Cars";
import Login from "@/pages/Admin/Login";
import Dashboard from "@/pages/Admin/Dashboard";
import ServerManagement from "@/pages/Admin/ServerManagement";
import CarManagement from "@/pages/Admin/CarManagement";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/servers/:id" component={ServerDetails} />
      <Route path="/cars" component={Cars} />
      <Route path="/admin/login" component={Login} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/servers" component={ServerManagement} />
      <Route path="/admin/cars" component={CarManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" forcedTheme="dark">
          <TooltipProvider>
            <Toaster />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-grow">
                <Router />
              </div>
              <Footer />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
