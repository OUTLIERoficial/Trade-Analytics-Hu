import { useParams, Link } from "wouter";
import { useGetAccount, useGetAccountStats, useGetEquityCurve, useListTrades } from "@workspace/api-client-react";
import { formatCurrency, formatPercent, formatDate, pnlColor, cn, resultBadgeClass, resultLabel, directionLabel, ACCOUNT_STATUS_LABELS, SESSION_LABELS } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Target, Zap } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";

export default function AccountDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id, 10);
  const { data: account, isLoading } = useGetAccount(id, { query: { enabled: !!id } });
  const { data: stats } = useGetAccountStats(id, { query: { enabled: !!id } });
  const { data: equity } = useGetEquityCurve({ accountId: id }, { query: { enabled: !!id } });
  const { data: trades } = useListTrades({ accountId: id, limit: 20 }, { query: { enabled: !!id } });

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />)}
      </div>
    </div>
  );
  if (!account) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-64">
      <p className="text-muted-foreground mb-3">Conta não encontrada.</p>
      <Link href="/contas"><Button variant="outline" size="sm">← Voltar às Contas</Button></Link>
    </div>
  );

  const growth = account.initialBalance > 0 ? ((account.currentBalance - account.initialBalance) / account.initialBalance) * 100 : 0;
  const isPositive = growth >= 0;

  const statusStyle: Record<string, string> = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    passed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    failed: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    blown: "bg-red-500/10 text-red-500 border-red-500/20",
    archived: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/contas">
          <button className="p-1.5 rounded-md hover:bg-accent transition-colors" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black text-foreground">{account.name}</h1>
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-bold border", statusStyle[account.status] ?? "bg-muted text-muted-foreground")}>
              {ACCOUNT_STATUS_LABELS[account.status] ?? account.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{account.brokerName ?? account.accountType} · {account.currency}</p>
        </div>
        <Link href="/diario/novo">
          <Button size="sm" className="brand-bg border-0 text-white font-bold hidden sm:flex">
            <Zap className="h-3.5 w-3.5 mr-1" /> Nova Operação
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Saldo Atual" value={formatCurrency(account.currentBalance, account.currency)} sub={`Inicial: ${formatCurrency(account.initialBalance, account.currency)}`} data-testid="stat-balance" />
        <StatCard label="Crescimento" value={`${growth >= 0 ? "+" : ""}${growth.toFixed(2)}%`} trend={isPositive ? "up" : "down"} variant={isPositive ? "profit" : "loss"} icon={isPositive ? TrendingUp : TrendingDown} data-testid="stat-growth" />
        <StatCard label="Taxa de Acerto" value={stats ? formatPercent(stats.winRate) : "—"} sub={stats ? `${stats.wins}G / ${stats.losses}P` : ""} variant={stats && stats.winRate >= 50 ? "primary" : "default"} icon={BarChart3} data-testid="stat-win-rate" />
        <StatCard label="P&L Total" value={stats ? formatCurrency(stats.totalPnl) : "—"} trend={stats && stats.totalPnl >= 0 ? "up" : "down"} variant={stats && stats.totalPnl >= 0 ? "profit" : "loss"} data-testid="stat-pnl" />
        <StatCard label="Profit Factor" value={stats ? stats.profitFactor.toFixed(2) : "—"} variant={stats && stats.profitFactor >= 1.5 ? "gold" : "default"} icon={Target} data-testid="stat-profit-factor" />
        <StatCard label="Avg R:R" value={stats ? `${stats.averageRR.toFixed(2)}R` : "—"} data-testid="stat-avg-rr" />
        <StatCard label="Disciplina" value={stats ? `${stats.disciplineScore.toFixed(0)}%` : "—"} variant={stats && stats.disciplineScore >= 70 ? "gold" : "default"} data-testid="stat-discipline" />
        <StatCard label="Max Drawdown" value={stats ? formatCurrency(stats.maxDrawdown) : "—"} variant={stats && stats.maxDrawdown > 0 ? "loss" : "default"} data-testid="stat-max-drawdown" />
      </div>

      {/* Best indicators */}
      {stats && (stats.bestSession || stats.bestSetup || stats.bestTimeframe) && (
        <div className="grid grid-cols-3 gap-3">
          {stats.bestTimeframe && (
            <div className="bg-card border border-card-border rounded-xl p-3 stat-card-primary">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Melhor Timeframe</p>
              <p className="text-lg font-black mt-1">{stats.bestTimeframe}</p>
            </div>
          )}
          {stats.bestSetup && (
            <div className="bg-card border border-card-border rounded-xl p-3 stat-card-gold">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Melhor Setup</p>
              <p className="text-lg font-black mt-1">{stats.bestSetup}</p>
            </div>
          )}
          {stats.bestSession && (
            <div className="bg-card border border-card-border rounded-xl p-3 stat-card-profit">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Melhor Sessão</p>
              <p className="text-lg font-black mt-1 capitalize">{SESSION_LABELS[stats.bestSession] ?? stats.bestSession.replace(/_/g, " ")}</p>
            </div>
          )}
        </div>
      )}

      {/* Equity curve */}
      {equity && equity.length > 1 && (
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Curva de Equity
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={equity} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221 83% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221 83% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${v.toLocaleString()}`} width={70} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), "Saldo"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="balance" stroke="hsl(221 83% 60%)" fill="url(#equityGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trade list */}
      <div className="bg-card border border-card-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">Operações Recentes</h2>
          <Link href={`/diario?accountId=${id}`}>
            <span className="text-xs text-primary hover:underline cursor-pointer font-medium">Ver todas →</span>
          </Link>
        </div>
        {!trades?.length ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-3">Nenhuma operação para esta conta.</p>
            <Link href="/diario/novo"><Button size="sm" className="brand-bg border-0 text-white">Registar Operação</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto trading-table">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60">
                <tr className="text-xs text-muted-foreground">
                  {["Data", "Ativo", "Setup", "Trigger", "Resultado", "P&L"].map(h => (
                    <th key={h} className={cn("py-3 pr-4 font-semibold", h === "P&L" ? "text-right pr-0" : "text-left")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id} className="border-b border-border/30" data-testid={`trade-row-${t.id}`}>
                    <td className="py-3 pr-4 text-muted-foreground text-xs whitespace-nowrap">{formatDate(t.tradeDate)}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/diario/${t.id}`}>
                        <span className="font-bold hover:text-primary cursor-pointer">{t.asset}</span>
                      </Link>
                      <span className={cn("ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded", t.direction === "buy" ? "bg-profit text-green-600 dark:text-green-400" : "bg-loss text-red-600 dark:text-red-400")}>{directionLabel(t.direction)}</span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{t.setup ?? "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{t.entryTrigger ?? "—"}</td>
                    <td className="py-3 pr-4"><span className={cn("text-[11px] px-2.5 py-1 rounded-full font-bold", resultBadgeClass(t.result))}>{resultLabel(t.result)}</span></td>
                    <td className={cn("py-3 text-right font-bold font-mono", pnlColor(t.pnl))}>{t.pnl != null ? formatCurrency(t.pnl) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
