import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Wrench,
  DollarSign,
  FileText,
  ClipboardList,
  Users,
  LogOut,
  X,
  Building2,
} from 'lucide-react';
import { type UserRole, canViewFinancials } from '@/lib/roles';
import DarkModeToggle from './DarkModeToggle';

interface Props {
  role: UserRole;
  user: any;
  onSignOut: () => void;
  isDark: boolean;
  toggleDark: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ role, user, onSignOut, isDark, toggleDark, isOpen, onClose }: Props) => {
  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
    ...(canViewFinancials(role) ? [{ to: '/dues', icon: DollarSign, label: 'Dues & Payments' }] : []),
    ...(!canViewFinancials(role) ? [{ to: '/my-dues', icon: DollarSign, label: 'My Dues' }] : []),
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/minutes', icon: ClipboardList, label: 'Meeting Minutes' },
    ...(role !== 'resident' ? [{ to: '/residents', icon: Users, label: 'Residents' }] : []),
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar-background text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-navy-dark" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Neighborly</h1>
              <p className="text-[10px] text-sidebar-foreground/60">Riverside Commons</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-sidebar-foreground/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sidebar-accent text-white'
                    : 'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50'
                }`
              }
            >
              <link.icon className="w-4.5 h-4.5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center justify-between px-3">
            <DarkModeToggle isDark={isDark} toggle={toggleDark} className="text-sidebar-foreground/60" />
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email}</p>
            </div>
            <button onClick={onSignOut} className="text-sidebar-foreground/50 hover:text-red-400 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
