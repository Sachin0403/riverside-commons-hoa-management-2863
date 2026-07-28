import { useState, useEffect, useCallback } from 'react';
import auth from '@/lib/shared/kliv-auth.js';
import { getUserRole, type UserRole } from '@/lib/roles';

interface AuthState {
  user: any | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const u = await auth.getUser();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = async (email: string, password: string) => {
    const u = await auth.signIn(email, password);
    setUser(u);
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
  };

  return {
    user,
    role: getUserRole(user),
    loading,
    signIn,
    signOut,
    refresh,
  };
}
