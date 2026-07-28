import { useState } from 'react';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>;
}

const demoAccounts = [
  { label: 'Board Member', email: 'board@example.com', password: 'Neighborly2026!', role: 'Full admin access' },
  { label: 'Property Manager', email: 'manager@example.com', password: 'Neighborly2026!', role: 'Maintenance & docs' },
  { label: 'Resident', email: 'resident@example.com', password: 'Neighborly2026!', role: 'View & submit requests' },
];

const Login = ({ onSignIn }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please enter email and password.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await onSignIn(email, password);
    } catch (err: any) {
      console.log('Login error:', err);
      toast({ title: 'Login failed', description: 'Invalid email or password. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80"
          alt="Modern apartment building"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/90 via-navy/80 to-navy-dark/70" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber flex items-center justify-center">
              <Building2 className="w-6 h-6 text-navy-dark" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Neighborly</h1>
              <p className="text-sm text-white/60">Riverside Commons HOA</p>
            </div>
          </div>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Your community, connected. Manage dues, maintenance, and stay informed — all in one place.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber flex items-center justify-center">
              <Building2 className="w-5 h-5 text-navy-dark" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Neighborly</h1>
              <p className="text-xs text-muted-foreground">Riverside Commons HOA</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-8">Sign in to your community portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2 dark:bg-amber dark:text-navy-dark dark:hover:bg-amber-light"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-2">
              {demoAccounts.map(account => (
                <button
                  key={account.email}
                  onClick={() => fillDemo(account)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:border-amber/50 hover:bg-amber/5 transition-all text-left group"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{account.label}</p>
                    <p className="text-xs text-muted-foreground">{account.email}</p>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full group-hover:bg-amber/10 group-hover:text-amber-dark transition-colors">
                    {account.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
