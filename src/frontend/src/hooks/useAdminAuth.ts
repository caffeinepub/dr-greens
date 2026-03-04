import {
  type PropsWithChildren,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";

const STORAGE_KEY = "drgreens_admin_session";
const CREDENTIALS_KEY = "drgreens_admin_credentials";

interface AdminCredentials {
  email: string;
  password: string;
}

function loadSession(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function loadCredentials(): AdminCredentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminCredentials;
  } catch {
    return null;
  }
}

interface AdminAuthContext {
  isAuthenticated: boolean;
  isFirstTime: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => void;
  register: (email: string, password: string) => void;
  logout: () => void;
}

const AdminAuthCtx = createContext<AdminAuthContext | undefined>(undefined);

export function AdminAuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadSession(),
  );
  const [isFirstTime, setIsFirstTime] = useState<boolean>(
    () => loadCredentials() === null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const register = useCallback((email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const credentials: AdminCredentials = {
        email: email.trim().toLowerCase(),
        password,
      };
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      localStorage.setItem(STORAGE_KEY, "true");
      setIsFirstTime(false);
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 400);
  }, []);

  const login = useCallback((email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const saved = loadCredentials();
      if (!saved) {
        setError("No account found. Please register first.");
        setIsLoading(false);
        return;
      }
      if (
        email.trim().toLowerCase() === saved.email &&
        password === saved.password
      ) {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsAuthenticated(true);
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setIsLoading(false);
    }, 400);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return createElement(AdminAuthCtx.Provider, {
    value: {
      isAuthenticated,
      isFirstTime,
      isLoading,
      error,
      login,
      register,
      logout,
    },
    children,
  });
}

export function useAdminAuth(): AdminAuthContext {
  const ctx = useContext(AdminAuthCtx);
  if (!ctx) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return ctx;
}
