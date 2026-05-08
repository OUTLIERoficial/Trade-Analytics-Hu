import { useAuth } from "@workspace/replit-auth-web";
import { TrendingUp, BarChart3, Shield, Brain, ChevronRight } from "lucide-react";

const features = [
  { icon: TrendingUp, title: "Diário de Operações", desc: "Registe cada trade com timeframe, trigger e sessão SMC/ICT" },
  { icon: BarChart3, title: "Analytics Avançado", desc: "Heatmaps, rankings de triggers e curvas de equity em tempo real" },
  { icon: Brain, title: "Psicologia", desc: "Acompanhe o seu estado emocional e pontuação de disciplina" },
  { icon: Shield, title: "Gestão de Risco", desc: "Monitorize drawdown e limites de risco por conta" },
];

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="login-bg min-h-screen flex flex-col items-center justify-center p-6">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(221 83% 60% / 0.06) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(270 65% 60% / 0.06) 0%, transparent 70%)" }} />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Branding */}
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="logo-icon w-12 h-12 flex-shrink-0">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <polyline points="2,17 7,12 11,15 16,9 22,14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,9 22,9 22,14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-foreground tracking-tight">G</span>
                <span className="text-2xl font-black brand-gradient tracking-tight">TRADER</span>
                <span className="text-xs font-bold gold-gradient tracking-widest ml-0.5">PRO</span>
              </div>
              <p className="text-xs text-muted-foreground">Plataforma de Gestão SMC/ICT</p>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-black text-foreground leading-tight mb-3">
              Opere com<br />
              <span className="brand-gradient">disciplina</span> e<br />
              <span className="gold-gradient">consistência</span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              A plataforma profissional para traders SMC e ICT. Registe, analise e melhore o seu desempenho com dados reais.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="flex-shrink-0 w-8 h-8 rounded-md brand-bg flex items-center justify-center mt-0.5">
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
            {/* Card logo */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="logo-icon w-16 h-16">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <polyline points="2,17 7,12 11,15 16,9 22,14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16,9 22,9 22,14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground">Bem-vindo ao GTrader</h2>
              <p className="text-sm text-muted-foreground">Aceda à sua conta de trading profissional</p>
            </div>

            {/* Stats preview */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-xl">
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

            <div className="space-y-3">
              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 brand-bg text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                style={{ boxShadow: "0 4px 20px hsl(221 83% 53% / 0.4)" }}
                data-testid="button-login"
              >
                Entrar na Plataforma
                <ChevronRight className="h-4 w-4" />
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Acesso seguro • Dados protegidos
              </p>
            </div>

            <div className="border-t border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Ao entrar, aceita os nossos{" "}
                <span className="text-primary cursor-pointer hover:underline">Termos de Uso</span>
              </p>
            </div>
          </div>

          {/* Bottom badges */}
          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> SSL Seguro</div>
            <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Dados Privados</div>
            <div className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> Tempo Real</div>
          </div>
        </div>
      </div>
    </div>
  );
}
