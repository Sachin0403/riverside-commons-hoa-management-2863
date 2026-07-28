import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { type UserRole } from '@/lib/roles';

interface Props {
  role: UserRole;
  user: any;
  onSignOut: () => void;
  isDark: boolean;
  toggleDark: () => void;
}

const AppLayout = ({ role, user, onSignOut, isDark, toggleDark }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={role}
        user={user}
        onSignOut={onSignOut}
        isDark={isDark}
        toggleDark={toggleDark}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border glass-strong">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber flex items-center justify-center">
              <span className="text-[10px] font-bold text-navy-dark">N</span>
            </div>
            <span className="text-sm font-semibold">Neighborly</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
