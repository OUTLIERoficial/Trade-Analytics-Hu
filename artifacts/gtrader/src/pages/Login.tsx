import { useAuth } from "@workspace/replit-auth-web";
import { TrendingUp, BarChart3, Shield, Brain, UserPlus, LogIn } from "lucide-react";
import { OutlierLogoMark } from "@/components/OutlierLogo";

const features = [
  { icon: TrendingUp, title: "Diário de Operações", desc: "Registe cada trade com timeframe, trigger, sessão e imagens de gráfico" },
  { icon: BarChart3, title: "Analytics Avançado", desc: "Heatmaps, rankings de triggers e curvas de equity em tempo real" },
  { icon: Brain, title: "Psicologia", desc: "Acompanhe o seu estado emocional e pontuação de disciplina" },
  { icon: Shield, title: "Gestão de Risco", desc: "Monitorize drawdown e limites de risco por conta" },
];

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="login-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(249 100% 60% / 0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(270 80% 55% / 0.06) 0%, transparent 70%)" }} />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left: Branding */}
        <div className="space-y-8">
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
              A plataforma profissional para traders SMC e ICT. Registe, analise e melhore o seu desempenho com dados reais.
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

        {/* Right: Login card */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm bg-card border border-card-border rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-2">
                <OutlierLogoMark size="lg" />
              </div>
              <h2 className="text-2xl font-black tracking-[0.1em] uppercase text-foreground">OUTLIER</h2>
              <p className="text-sm text-muted-foreground">Aceda ou crie a sua conta de trading profissional</p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-xl border border-border/40">
              <div className="text-center">
                <p className="text-lg font-bold text-profit">+12.4%</p>
                <p className="text-xs text-muted-foreground">Retorno</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-lg font-bold text-foreground">68%</p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">91%</p>
                <p className="text-xs text-muted-foreground">Disciplina</p>
              </div>
            </div>

            {/* Login + Register buttons */}
            <div className="space-y-3">
              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 brand-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98]"
                style={{ boxShadow: "0 4px 20px hsl(249 100% 60% / 0.4)" }}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4" />
                Entrar na Conta
              </button>

              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border-2 border-primary/50 text-primary rounded-xl font-bold text-sm hover:bg-primary/10 hover:border-primary transition-all active:scale-[0.98]"
                data-testid="button-register"
              >
                <UserPlus className="h-4 w-4" />
                Criar Conta Gratuita
              </button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                Novo utilizador? A conta é criada automaticamente no primeiro acesso.
              </p>
            </div>

            <div className="border-t border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">Acesso seguro · Dados privados · Cada utilizador tem os seus dados</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> SSL Seguro</div>
            <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Dados Privados</div>
            <div className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> Tempo Real</div>
          </div>
        </div>
      </div>
    </div>
  );
}
