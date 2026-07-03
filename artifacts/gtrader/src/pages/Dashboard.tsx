import { useGetDashboardSummary, useGetRecentTrades, useGetEquityCurve } from "@workspace/api-client-react";
import { formatCurrency, formatPercent, formatDateTime, pnlColor, cn, directionLabel } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import { BarChart3, Wallet, Activity, TrendingUp, TrendingDown, Zap, Star, Calendar, StickyNote, LineChart as LineChartIcon } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function EquityCurveCard() {
  const { data: equity, isLoading } = useGetEquityCurve();
  const first = equity?.[0]?.balance ?? 0;
  const last = equity?.[equity.length - 1]?.balance ?? 0;
  const growth = first > 0 ? ((last - first) / first) * 100 : 0;
  const positive = growth >= 0;

  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-md brand-bg flex items-center justify-center">
            <LineChartIcon className="h-3.5 w-3.5 text-white" />
          </div>
          Curva de Capital
        </h2>
        {equity && equity.length > 1 && (
          <span className={cn("text-xs font-bold px-2 py-1 rounded-full", positive ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss")} data-testid="text-equity-growth">
            {positive ? "+" : ""}{growth.toFixed(1)}% crescimento
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="h-[220px] bg-muted/40 rounded-lg animate-pulse" />
      ) : !equity || equity.length < 2 ? (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Sem dados suficientes. Registe operações para ver a evolução do capital.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={equity} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="dashEquityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221 83% 60%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(221 83% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString("pt-PT", { month: "short", day: "numeric" })} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${v.toLocaleString()}`} width={70} />
            <Tooltip
              labelFormatter={v => new Date(v).toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" })}
              formatter={(v: number) => [formatCurrency(v), "Saldo"]}
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="balance" stroke="hsl(221 83% 60%)" fill="url(#dashEquityGrad)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function QuickNotes() {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `outlier_notes_${today}`;

  const [text, setText] = useState(() => {
    try { return localStorage.getItem(storageKey) ?? ""; } catch { return ""; }
  });
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(val: string) {
    setText(val);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try { localStorage.setItem(storageKey, val); } catch {}
      setSaved(true);
      timerRef.current = setTimeout(() => setSaved(false), 2000);
    }, 600);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const dateLabel = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="bg-card border border-card-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-md brand-bg flex items-center justify-center">
            <StickyNote className="h-3.5 w-3.5 text-white" />
          </div>
          Notas do Dia
        </h2>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[10px] text-green-500 font-semibold">Guardado</span>}
          <span className="text-[10px] text-muted-foreground capitalize">{dateLabel}</span>
        </div>
      </div>
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        placeholder="Plano do dia, observações de mercado, regras para cumprir..."
        className="w-full h-24 bg-muted/40 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 resize-none transition-all"
      />
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: recentTrades } = useGetRecentTrades({ limit: 8 });

  if (isLoading) {
    return (
      <div className="p-5 space-y-5">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const s = summary;
  const positiveTotal = !s || s.totalPnl >= 0;
  const positiveWeek = !s || s.totalPnlThisWeek >= 0;
  const positiveMonth = !s || s.totalPnlThisMonth >= 0;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral do portfólio</p>
        </div>
        <Link href="/diario/novo">
          <button className="flex items-center gap-2 px-4 py-2.5 brand-bg text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-lg" style={{ boxShadow: "0 4px 14px hsl(221 83% 53% / 0.35)" }} data-testid="button-new-trade">
            <Zap className="h-3.5 w-3.5" /> + Nova Operação
          </button>
        </Link>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="P&L Total"
          value={s ? formatCurrency(s.totalPnl) : "—"}
          sub={`Hoje: ${s ? formatCurrency(s.totalPnlToday) : "—"}`}
          variant={positiveTotal ? "profit" : "loss"}
          trend={positiveTotal ? "up" : "down"}
          icon={positiveTotal ? TrendingUp : TrendingDown}
          data-testid="stat-total-pnl"
        />
        <StatCard
          label="Taxa de Acerto"
          value={s ? formatPercent(s.overallWinRate) : "—"}
          sub={`${s?.totalWins ?? 0}G · ${s?.totalLosses ?? 0}P`}
          variant={s && s.overallWinRate >= 50 ? "primary" : "default"}
          icon={BarChart3}
          data-testid="stat-win-rate"
        />
        <StatCard
          label="Operações"
          value={s?.totalTrades ?? "—"}
          sub={`${s?.activeAccounts ?? 0} contas ativas`}
          variant="primary"
          icon={Activity}
          data-testid="stat-total-trades"
        />
        <StatCard
          label="Disciplina"
          value={s ? `${s.averageDisciplineScore.toFixed(0)}%` : "—"}
          sub="Aderência às regras"
          variant={s && s.averageDisciplineScore >= 70 ? "gold" : "default"}
          icon={Star}
          data-testid="stat-discipline"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Esta Semana" value={s ? formatCurrency(s.totalPnlThisWeek) : "—"} trend={positiveWeek ? "up" : "down"} variant={positiveWeek ? "profit" : "loss"} icon={Calendar} data-testid="stat-week-pnl" />
        <StatCard label="Este Mês" value={s ? formatCurrency(s.totalPnlThisMonth) : "—"} trend={positiveMonth ? "up" : "down"} variant={positiveMonth ? "profit" : "loss"} data-testid="stat-month-pnl" />
        <StatCard label="Melhor Setup" value={s?.bestSetup ?? "—"} sub="Por lucro" variant="gold" data-testid="stat-best-setup" />
        <StatCard label="Melhor Sessão" value={s?.bestSession?.replace(/_/g, " ") ?? "—"} sub="Por lucro" data-testid="stat-best-session" />
      </div>

      <EquityCurveCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account breakdown */}
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <div className="w-6 h-6 rounded-md brand-bg flex items-center justify-center">
                <Wallet className="h-3.5 w-3.5 text-white" />
              </div>
              Contas
            </h2>
            <Link href="/contas">
              <span className="text-xs text-primary hover:underline cursor-pointer font-medium">Ver todas →</span>
            </Link>
          </div>
          {!s?.accountBreakdown?.length ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhuma conta ainda.</p>
              <Link href="/contas"><span className="text-xs text-primary cursor-pointer hover:underline mt-1 block">Criar conta</span></Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {s.accountBreakdown.slice(0, 5).map(acc => (
                <Link key={acc.accountId} href={`/contas/${acc.accountId}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer border border-transparent hover:border-border/50" data-testid={`account-row-${acc.accountId}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-2 h-8 rounded-full flex-shrink-0", acc.totalPnl >= 0 ? "bg-profit" : "bg-loss")} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{acc.accountName}</p>
                        <p className="text-xs text-muted-foreground">{acc.totalTrades} ops · {acc.winRate.toFixed(0)}% acerto</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", acc.totalPnl >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(acc.totalPnl)}</p>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold", acc.status === "active" ? "bg-green-500/15 text-green-500" : "bg-muted text-muted-foreground")}>{acc.status === "active" ? "Ativo" : acc.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent trades */}
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <div className="w-6 h-6 rounded-md brand-bg flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-white" />
              </div>
              Operações Recentes
            </h2>
            <Link href="/diario">
              <span className="text-xs text-primary hover:underline cursor-pointer font-medium">Ver todas →</span>
            </Link>
          </div>
          {!recentTrades?.length ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhuma operação ainda.</p>
              <Link href="/diario/novo"><span className="text-xs text-primary cursor-pointer hover:underline mt-1 block">Registar operação</span></Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentTrades.map(t => (
                <Link key={t.id} href={`/diario/${t.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer border border-transparent hover:border-border/50" data-testid={`trade-row-${t.id}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", t.result === "win" ? "bg-green-500" : t.result === "loss" ? "bg-red-500" : "bg-muted-foreground")} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.asset}
                          <span className={cn("ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded", t.direction === "buy" ? "bg-profit text-green-600 dark:text-green-400" : "bg-loss text-red-600 dark:text-red-400")}>
                            {directionLabel(t.direction)}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">{t.setup ?? t.entryTrigger ?? "—"} · {formatDateTime(t.tradeDate)}</p>
                      </div>
                    </div>
                    <p className={cn("text-sm font-bold", pnlColor(t.pnl))}>{t.pnl != null ? formatCurrency(t.pnl) : "—"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Notes */}
      <QuickNotes />

      {/* Top performers */}
      {s && (s.bestTrigger || s.bestTimeframe) && (
        <div className="bg-card border border-card-border rounded-xl p-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md brand-bg flex items-center justify-center">
              <Star className="h-3.5 w-3.5 text-white" />
            </div>
            Melhores Desempenhos
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {s.bestTimeframe && <div className="bg-muted/40 border border-border/50 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Timeframe</p><p className="text-base font-black text-foreground mt-1">{s.bestTimeframe}</p></div>}
            {s.bestTrigger && <div className="bg-muted/40 border border-border/50 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Trigger</p><p className="text-base font-black text-foreground mt-1">{s.bestTrigger}</p></div>}
            {s.bestSetup && <div className="bg-muted/40 border border-border/50 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Setup</p><p className="text-base font-black text-foreground mt-1">{s.bestSetup}</p></div>}
            {s.bestSession && <div className="bg-muted/40 border border-border/50 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Sessão</p><p className="text-base font-black text-foreground mt-1 capitalize">{s.bestSession.replace(/_/g, " ")}</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
