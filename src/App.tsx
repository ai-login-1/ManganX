import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Reserves from "@/pages/Reserves";
import Production from "@/pages/Production";
import Operations from "@/pages/Operations";
import Equipment from "@/pages/Equipment";
import Risks from "@/pages/Risks";
import Simulator from "@/pages/Simulator";
import Satellite from "@/pages/Satellite";
import Copilot from "@/pages/Copilot";
import DataCenter from "@/pages/DataCenter";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/reserves"   element={<Reserves />} />
            <Route path="/production" element={<Production />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/equipment"  element={<Equipment />} />
            <Route path="/risks"      element={<Risks />} />
            <Route path="/simulator"  element={<Simulator />} />
            <Route path="/satellite"  element={<Satellite />} />
            <Route path="/copilot"    element={<Copilot />} />
            <Route path="/datacenter" element={<DataCenter />} />
            <Route path="/reports"    element={<Reports />} />
            <Route path="/settings"   element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
