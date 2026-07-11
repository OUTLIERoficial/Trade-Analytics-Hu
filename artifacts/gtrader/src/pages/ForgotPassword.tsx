import { useState } from "react";
import { Link } from "wouter";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { OutlierLogoMark } from "@/components/OutlierLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido.");
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar email.");
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
          {sent ? (
            <div className="flex flex-col items-center text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground mb-2">Email Enviado!</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Se o endereço <span className="text-foreground font-semibold">{email}</span> corresponde a uma conta OUTLIER, receberá um email com instruções para redefinir a sua password.
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  O link é válido durante 1 hora. Verifique a pasta de spam se não receber o email.
                </p>
              </div>
              <Link href="/" className="text-sm text-primary hover:underline font-semibold flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-black tracking-[0.06em] uppercase text-foreground">Recuperar Password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Introduza o seu email e enviamos um link para redefinir a password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      required
                      autoComplete="email"
                      className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
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
                      A enviar...
                    </span>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Enviar Link de Recuperação
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4">
                <Link href="/" className="text-primary hover:underline font-semibold flex items-center justify-center gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
