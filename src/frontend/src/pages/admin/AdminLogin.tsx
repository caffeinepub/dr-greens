import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Leaf,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useEffect, useState } from "react";

type Mode = "login" | "register";

export function AdminLogin() {
  const { login, register, isLoading, error, isFirstTime } = useAdminAuth();

  const [mode, setMode] = useState<Mode>(() =>
    isFirstTime ? "register" : "login",
  );

  // Sync mode when isFirstTime changes (edge case on mount)
  useEffect(() => {
    if (isFirstTime) setMode("register");
  }, [isFirstTime]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regErrors, setRegErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    login(loginEmail, loginPassword);
  }

  function validateRegister() {
    const errs: typeof regErrors = {};
    if (!regEmail.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail))
      errs.email = "Enter a valid email address.";
    if (!regPassword) errs.password = "Password is required.";
    else if (regPassword.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (!regConfirm) errs.confirm = "Please confirm your password.";
    else if (regPassword !== regConfirm)
      errs.confirm = "Passwords do not match.";
    return errs;
  }

  function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateRegister();
    if (Object.keys(errs).length > 0) {
      setRegErrors(errs);
      return;
    }
    register(regEmail.trim(), regPassword);
  }

  function toggleMode() {
    setRegErrors({});
    setMode((m) => (m === "login" ? "register" : "login"));
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Logo + Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <img
                src="/assets/generated/verdant-greens-logo-transparent.dim_300x300.png"
                alt="Verdant Greens"
                className="h-16 w-16 object-contain"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Verdant Greens
            </h1>
            <AnimatePresence mode="wait">
              {mode === "register" ? (
                <motion.div
                  key="register-heading"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-center"
                >
                  <p className="text-sm text-muted-foreground mt-1 font-semibold uppercase tracking-widest">
                    Create Admin Account
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    First-time setup for Verdant Greens admin panel
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="login-heading"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-muted-foreground mt-1 font-semibold uppercase tracking-widest"
                >
                  Admin Panel
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-6" />

          {/* Error state */}
          {error && (
            <div
              data-ocid="admin.login.error_state"
              className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === "register" ? (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
              >
                {/* Register info banner */}
                <div className="flex items-start gap-2 bg-primary/8 border border-primary/20 rounded-xl p-3">
                  <UserPlus className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-primary font-medium">
                    Set up your admin credentials. You'll use these to log in
                    every time.
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="reg-email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reg-email"
                      data-ocid="admin.register.email_input"
                      type="email"
                      autoComplete="email"
                      placeholder="Verdant Greens2026@gmail.com"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (regErrors.email)
                          setRegErrors((p) => ({ ...p, email: undefined }));
                      }}
                      required
                      disabled={isLoading}
                      className={`pl-10 h-11 rounded-xl border-border bg-background focus-visible:ring-primary/30 ${regErrors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {regErrors.email && (
                    <p className="text-destructive text-xs">
                      {regErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="reg-password"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reg-password"
                      data-ocid="admin.register.password_input"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Min. 6 characters"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (regErrors.password)
                          setRegErrors((p) => ({ ...p, password: undefined }));
                      }}
                      required
                      disabled={isLoading}
                      className={`pl-10 h-11 rounded-xl border-border bg-background focus-visible:ring-primary/30 ${regErrors.password ? "border-destructive" : ""}`}
                    />
                  </div>
                  {regErrors.password && (
                    <p className="text-destructive text-xs">
                      {regErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="reg-confirm"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reg-confirm"
                      data-ocid="admin.register.confirm_password_input"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={regConfirm}
                      onChange={(e) => {
                        setRegConfirm(e.target.value);
                        if (regErrors.confirm)
                          setRegErrors((p) => ({ ...p, confirm: undefined }));
                      }}
                      required
                      disabled={isLoading}
                      className={`pl-10 h-11 rounded-xl border-border bg-background focus-visible:ring-primary/30 ${regErrors.confirm ? "border-destructive" : ""}`}
                    />
                  </div>
                  {regErrors.confirm && (
                    <p className="text-destructive text-xs">
                      {regErrors.confirm}
                    </p>
                  )}
                </div>

                {/* Password match indicator */}
                {regPassword && regConfirm && regPassword === regConfirm && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Passwords match
                  </div>
                )}

                <Button
                  type="submit"
                  data-ocid="admin.register.submit_button"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold gap-2 text-sm mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account…
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Admin Account
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="admin-email"
                      data-ocid="admin.login.email_input"
                      type="email"
                      autoComplete="email"
                      placeholder="admin@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11 rounded-xl border-border bg-background focus-visible:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-password"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="admin-password"
                      data-ocid="admin.login.password_input"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11 rounded-xl border-border bg-background focus-visible:ring-primary/30"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  data-ocid="admin.login.submit_button"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold gap-2 text-sm mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing In…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Toggle between modes */}
          <div className="mt-5 text-center space-y-3">
            {mode === "login" ? (
              <button
                type="button"
                data-ocid="admin.register.toggle_link"
                onClick={toggleMode}
                className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                First time? Create account →
              </button>
            ) : (
              <button
                type="button"
                data-ocid="admin.login.toggle_link"
                onClick={toggleMode}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Already registered? Sign in →
              </button>
            )}

            <div>
              <a
                data-ocid="admin.login.back_link"
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <Leaf className="w-3 h-3" />← Back to Store
              </a>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Only authorized admins can access this panel
        </p>
      </motion.div>
    </div>
  );
}
