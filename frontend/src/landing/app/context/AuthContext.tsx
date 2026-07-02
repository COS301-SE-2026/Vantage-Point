import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  confirmUser,
  exchangeOAuthCode,
  loginUser,
  logoutUser,
  registerUser,
  type LoginPayload,
  type RegisterPayload,
} from "../api/auth";
import { getMe, linkGameAccount } from "../api/user";
import {
  clearStoredTokens,
  getStoredTokens,
  hasStoredAccessToken,
} from "../lib/tokens";
import { getOAuthRedirectUri } from "../lib/cognito-oauth";
import type { UserMe } from "../types/auth";

interface AuthContextValue {
  readonly user: UserMe | null;
  readonly loading: boolean;
  readonly login: (payload: LoginPayload) => Promise<UserMe>;
  readonly register: (payload: RegisterPayload) => Promise<void>;
  readonly confirmAndLogin: (
    username: string,
    confirmationCode: string,
    password: string,
  ) => Promise<UserMe>;
  readonly loginWithOAuthCode: (code: string) => Promise<UserMe>;
  readonly logout: () => Promise<void>;
  readonly refreshUser: () => Promise<UserMe | null>;
  readonly linkRiot: (riotId: string) => Promise<UserMe>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  const completeSessionAfterTokens = useCallback(async (): Promise<UserMe> => {
    const me = await getMe();
    setUser(me);
    return me;
  }, []);

  const refreshUser = useCallback(async (): Promise<UserMe | null> => {
    if (!hasStoredAccessToken()) {
      setUser(null);
      return null;
    }
    try {
      return await completeSessionAfterTokens();
    } catch {
      clearStoredTokens();
      setUser(null);
      return null;
    }
  }, [completeSessionAfterTokens]);

  useEffect(() => {
    void (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (payload: LoginPayload): Promise<UserMe> => {
      await loginUser(payload);
      return completeSessionAfterTokens();
    },
    [completeSessionAfterTokens],
  );

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    await registerUser(payload);
  }, []);

  const confirmAndLogin = useCallback(
    async (
      username: string,
      confirmationCode: string,
      password: string,
    ): Promise<UserMe> => {
      await confirmUser({
        username,
        confirmation_code: confirmationCode,
      });
      await loginUser({ email: username, password });
      return completeSessionAfterTokens();
    },
    [completeSessionAfterTokens],
  );

  const loginWithOAuthCode = useCallback(
    async (code: string): Promise<UserMe> => {
      const redirectUri = getOAuthRedirectUri();
      if (!redirectUri) {
        throw new Error("OAuth redirect URI is not configured.");
      }
      await exchangeOAuthCode(code, redirectUri);
      return completeSessionAfterTokens();
    },
    [completeSessionAfterTokens],
  );

  const logout = useCallback(async (): Promise<void> => {
    const { accessToken } = getStoredTokens();
    if (accessToken) {
      try {
        await logoutUser(accessToken);
      } catch {
        // Clear local session even if Cognito global sign-out fails.
      }
    }
    clearStoredTokens();
    setUser(null);
  }, []);

  const linkRiot = useCallback(async (riotId: string): Promise<UserMe> => {
    await linkGameAccount(riotId);
    return completeSessionAfterTokens();
  }, [completeSessionAfterTokens]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      confirmAndLogin,
      loginWithOAuthCode,
      logout,
      refreshUser,
      linkRiot,
    }),
    [
      user,
      loading,
      login,
      register,
      confirmAndLogin,
      loginWithOAuthCode,
      logout,
      refreshUser,
      linkRiot,
    ],
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
