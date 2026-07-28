import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDarkMode } from "@/hooks/useDarkMode";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Announcements from "./pages/Announcements";
import Maintenance from "./pages/Maintenance";
import Dues from "./pages/Dues";
import Documents from "./pages/Documents";
import MeetingMinutes from "./pages/MeetingMinutes";
import Residents from "./pages/Residents";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, role, loading, signIn, signOut } = useAuth();
  const { isDark, toggle } = useDarkMode();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-1.5">
          <div className="animate-bounce w-2 h-2 rounded-full bg-amber" style={{ animationDelay: "0ms" }} />
          <div className="animate-bounce w-2 h-2 rounded-full bg-amber" style={{ animationDelay: "150ms" }} />
          <div className="animate-bounce w-2 h-2 rounded-full bg-amber" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSignIn={signIn} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout role={role} user={user} onSignOut={signOut} isDark={isDark} toggleDark={toggle} />}>
          <Route path="/dashboard" element={<Dashboard role={role} user={user} />} />
          <Route path="/announcements" element={<Announcements role={role} user={user} />} />
          <Route path="/maintenance" element={<Maintenance role={role} user={user} />} />
          <Route path="/dues" element={<Dues role={role} user={user} />} />
          <Route path="/my-dues" element={<Dues role={role} user={user} myDuesOnly />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/minutes" element={<MeetingMinutes />} />
          <Route path="/residents" element={<Residents />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
