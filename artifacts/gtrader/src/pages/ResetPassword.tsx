import { useState } from "react";
import { Link } from "wouter";
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { OutlierLogoMark } from "@/components/OutlierLogo";

export default function ResetPassword() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="login-bg min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8"><OutlierLogoMark size="lg" /></div>
          <div className="bg-card border border-card-border rounded-2xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="h-7 w-7 text-red-400" />
            </div>
            <h2 className="text-xl font-black text-foreground">Link Inválido</h2>
            <p className="text-sm text-muted-foreground">Este link de recuperação é inválido ou já expirou.</p>
            <Link href="/" className="text-sm text-primary hover:underline font-semibold flex items-center justify-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError("As passwords não coincidem."); return; }
    if (password.length < 6) { setError("A password deve ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao redefinir password.");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(249 100% 60% / 0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(270 80% 55% / 0.06) 0%, transparent 70%)" }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-8">
          <OutlierLogoMark size="lg" />
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-2xl">
          {done ? (
            <div className="flex flex-col items-center text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground mb-2">Password Redefinida!</h2>
                <p className="text-sm text-muted-foreground">
                  A sua password foi alterada com sucesso. Pode agora entrar na sua conta.
                </p>
              </div>
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 brand-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                style={{ boxShadow: "0 4px 20px hsl(249 100% 60% / 0.35)" }}
              >
                Ir para o Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-black tracking-[0.06em] uppercase text-foreground">Nova Password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Introduza a sua nova password. Mínimo 6 caracteres.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nova Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      autoComplete="new-password"
                      className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirmar Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova password"
                      required
                      autoComplete="new-password"
                      className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 brand-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ boxShadow: "0 4px 20px hsl(249 100% 60% / 0.35)" }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      A guardar...
                    </span>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Guardar Nova Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
