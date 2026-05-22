import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginUser, registerUser, type LoginPayload, type RegisterPayload } from "../api/auth";
import { getMe, linkGameAccount } from "../api/user";
import { clearStoredTokens, hasStoredAccessToken } from "../lib/tokens";
import type { UserMe } from "../types/auth";

interface AuthContextValue {
  readonly user: UserMe | null;
  readonly loading: boolean;
  readonly login: (payload: LoginPayload) => Promise<UserMe>;
  readonly register: (payload: RegisterPayload) => Promise<void>;
  readonly logout: () => void;
  readonly refreshUser: () => Promise<UserMe | null>;
  readonly linkRiot: (riotId: string) => Promise<UserMe>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<UserMe | null> => {
    if (!hasStoredAccessToken()) {
      setUser(null);
      return null;
    }
    try {
      const me = await getMe();
      setUser(me);
      return me;
    } catch {
      clearStoredTokens();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (payload: LoginPayload): Promise<UserMe> => {
      await loginUser(payload);
      const me = await getMe();
      setUser(me);
      return me;
    },
    []
  );

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    await registerUser(payload);
    const me = await getMe();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    clearStoredTokens();
    setUser(null);
  }, []);

  const linkRiot = useCallback(
    async (riotId: string): Promise<UserMe> => {
      await linkGameAccount(riotId);
      const me = await getMe();
      setUser(me);
      return me;
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      linkRiot,
    }),
    [user, loading, login, register, logout, refreshUser, linkRiot]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
