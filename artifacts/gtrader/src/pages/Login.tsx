import { useState } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { TrendingUp, BarChart3, Shield, Brain, LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { OutlierLogoMark } from "@/components/OutlierLogo";

const features = [
  { icon: TrendingUp, title: "Diário de Operações", desc: "Registe cada trade com timeframe, trigger, sessão e imagens de gráfico" },
  { icon: BarChart3, title: "Analytics Avançado", desc: "Heatmaps, rankings de triggers e curvas de equity" },
  { icon: Brain, title: "Psicologia", desc: "Acompanhe o seu estado emocional e pontuação de disciplina" },
  { icon: Shield, title: "Gestão de Risco", desc: "Monitorize drawdown e limites de risco por conta" },
];

type Mode = "login" | "register" | "registered";

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register") {
      if (!name.trim()) { setError("Introduza o seu nome."); return; }
      if (password !== confirmPassword) { setError("As passwords não coincidem."); return; }
      if (password.length < 6) { setError("A password deve ter pelo menos 6 caracteres."); return; }

      setLoading(true);
      const err = await register(email, password, name);
      setLoading(false);
      if (err) { setError(err); return; }

      // Success: save email, show success screen, then redirect to login
      setRegisteredEmail(email);
      setMode("registered");
      return;
    }

    // Login mode
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) setError(err);
    // on success, useAuth sets user → AuthGate auto-redirects to app
  }

  function goToLogin() {
    setEmail(registeredEmail);
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError(null);
    setMode("login");
  }

  return (
    <div className="login-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(249 100% 60% / 0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(270 80% 55% / 0.06) 0%, transparent 70%)" }} />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left: Branding (desktop only) */}
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center gap-4">
            <OutlierLogoMark size="lg" />
            <div>
              <div className="text-3xl font-black text-foreground tracking-[0.12em] uppercase">OUTLIER</div>
              <p className="text-xs text-muted-foreground mt-0.5">Plataforma de Gestão SMC/ICT</p>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black text-foreground leading-tight mb-3">
              A consistência nasce<br />da repetição de<br />
              <span className="brand-gradient">contextos outlier.</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A plataforma profissional para traders SMC e ICT.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3.5 rounded-xl bg-card/60 border border-border/50">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg brand-bg flex items-center justify-center mt-0.5">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Auth card */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full max-w-sm bg-card border border-card-border rounded-2xl p-8 shadow-2xl">

            {/* Mobile logo */}
            <div className="flex lg:hidden justify-center mb-6">
              <OutlierLogoMark size="lg" />
            </div>

            {/* ── SUCCESS STATE ── */}
            {mode === "registered" && (
              <div className="flex flex-col items-center text-center py-4 space-y-5">
                <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground mb-1">Registo Concluído!</h2>
                  <p className="text-sm text-muted-foreground">
                    A sua conta foi criada com sucesso.<br />
                    Faça login para aceder à plataforma.
                  </p>
                </div>
                <div className="w-full pt-2">
                  <button
                    onClick={goToLogin}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 brand-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                    style={{ boxShadow: "0 4px 20px hsl(249 100% 60% / 0.35)" }}
                  >
                    <LogIn className="h-4 w-4" />
                    Ir para o Login
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Email registado: <span className="text-foreground font-semibold">{registeredEmail}</span>
                </p>
              </div>
            )}

            {/* ── LOGIN / REGISTER FORMS ── */}
            {mode !== "registered" && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black tracking-[0.08em] uppercase text-foreground">
                    {mode === "login" ? "Entrar" : "Criar Conta"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mode === "login" ? "Aceda à sua conta OUTLIER" : "Crie a sua conta gratuita"}
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="flex rounded-lg bg-muted/50 border border-border p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition-all ${mode === "login" ? "brand-bg text-white" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LogIn className="h-3.5 w-3.5" /> Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("register"); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition-all ${mode === "register" ? "brand-bg text-white" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Registar
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome completo</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="O seu nome"
                        required
                        className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      required
                      autoComplete="email"
                      className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirmar password</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Repita a password"
                          required
                          autoComplete="new-password"
                          className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {mode === "login" && (
                    <div className="text-right -mt-1">
                      <a href="esqueceu-password" className="text-xs text-primary hover:underline font-medium">
                        Esqueceu a password?
                      </a>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 brand-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
                    style={{ boxShadow: "0 4px 20px hsl(249 100% 60% / 0.35)" }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {mode === "login" ? "A entrar..." : "A criar conta..."}
                      </span>
                    ) : (
                      <>
                        {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        {mode === "login" ? "Entrar na Conta" : "Criar Conta Gratuita"}
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  {mode === "login"
                    ? <>Não tem conta? <button type="button" onClick={() => { setMode("register"); setError(null); }} className="text-primary hover:underline font-semibold">Registar agora</button></>
                    : <>Já tem conta? <button type="button" onClick={() => { setMode("login"); setError(null); }} className="text-primary hover:underline font-semibold">Entrar</button></>
                  }
                </p>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> SSL Seguro</div>
            <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Dados Privados</div>
          </div>
        </div>
      </div>
    </div>
  );
}
