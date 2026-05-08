import { useListAccounts, useGetAccountStats } from "@workspace/api-client-react";
import { formatCurrency, formatPercent, cn, ACCOUNT_STATUS_LABELS } from "@/lib/utils";
import { Link } from "wouter";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle, ShieldX } from "lucide-react";

function RiskCard({ accountId }: { accountId: number }) {
  const { data: accounts } = useListAccounts();
  const { data: stats } = useGetAccountStats(accountId, { query: { enabled: !!accountId } });
  const account = accounts?.find(a => a.id === accountId);
  if (!account || !stats) return <div className="h-56 bg-card rounded-xl animate-pulse border border-card-border" />;

  const ddPercent = account.initialBalance > 0 ? (stats.maxDrawdown / account.initialBalance) * 100 : 0;
  const maxDdLimit = account.maxDrawdown ?? 10;
  const ddRatio = maxDdLimit > 0 ? ddPercent / maxDdLimit : 0;

  const alerts: string[] = [];
  if (ddRatio >= 0.8) alerts.push("Próximo do limite de drawdown máximo");
  if (stats.winRate < 40 && stats.totalTrades >= 5) alerts.push("Taxa de acerto abaixo de 40%");
  if (stats.disciplineScore < 60 && stats.totalTrades >= 3) alerts.push("Pontuação de disciplina baixa");
  if (stats.profitFactor < 1 && stats.totalTrades >= 5) alerts.push("Profit Factor inferior a 1.0");

  const checks = [
    { label: "Drawdown Máximo", ok: ddRatio < 0.8, value: account.maxDrawdown ? `${maxDdLimit}% limite · ${ddPercent.toFixed(1)}% usado` : "Sem limite definido" },
    { label: "Perda Diária", ok: true, value: account.dailyLossLimit ? formatCurrency(account.dailyLossLimit) : "Sem limite definido" },
    { label: "Trades Máx./Dia", ok: true, value: account.maxTradesPerDay ? `${account.maxTradesPerDay} operações` : "Sem limite definido" },
    { label: "Taxa de Acerto", ok: stats.winRate >= 40, value: formatPercent(stats.winRate) },
    { label: "Disciplina", ok: stats.disciplineScore >= 60, value: `${stats.disciplineScore.toFixed(0)}%` },
    { label: "Profit Factor", ok: stats.profitFactor >= 1, value: stats.profitFactor.toFixed(2) },
  ];

  const hasAlerts = alerts.length > 0;
  const ddBarColor = ddRatio >= 0.8 ? "bg-red-500" : ddRatio >= 0.5 ? "bg-amber-500" : "bg-green-500";

  return (
    <div className={cn("bg-card border rounded-xl p-5 space-y-4 transition-all", hasAlerts ? "border-red-500/30" : "border-card-border")} data-testid={`risk-card-${accountId}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/contas/${accountId}`}>
            <h3 className="font-bold text-base hover:text-primary cursor-pointer transition-colors">{account.name}</h3>
          </Link>
          <p className="text-xs text-muted-foreground">{ACCOUNT_STATUS_LABELS[account.status] ?? account.status} · {formatCurrency(account.currentBalance, account.currency)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("text-xs font-bold px-2.5 py-1 rounded-full", stats.profitFactor >= 1.5 ? "bg-profit text-profit" : stats.profitFactor >= 1 ? "bg-amber-500/15 text-amber-500" : "bg-loss text-loss")}>
            PF: {stats.profitFactor.toFixed(2)}
          </div>
          {hasAlerts
            ? <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"><ShieldAlert className="h-5 w-5 text-red-500" /></div>
            : <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center"><ShieldCheck className="h-5 w-5 text-green-500" /></div>
          }
        </div>
      </div>

      {/* Alerts */}
      {hasAlerts && (
        <div className="space-y-1.5">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-red-500 bg-red-500/8 border border-red-500/15 px-3 py-2 rounded-lg">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" /> {a}
            </div>
          ))}
        </div>
      )}

      {/* Drawdown bar */}
      {account.maxDrawdown && (
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground font-medium">Uso do Drawdown</span>
            <span className={cn("font-bold", ddRatio >= 0.8 ? "text-red-500" : ddRatio >= 0.5 ? "text-amber-500" : "text-profit")}>
              {ddPercent.toFixed(1)}% / {maxDdLimit}%
            </span>
          </div>
          <div className="progress-bar">
            <div className={cn("progress-fill", ddBarColor)} style={{ width: `${Math.min(100, ddRatio * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Check list */}
      <div className="grid grid-cols-1 gap-1.5 pt-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {c.ok
                ? <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                : <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
              <span className="text-muted-foreground">{c.label}</span>
            </div>
            <span className={cn("font-semibold", !c.ok ? "text-red-500" : "text-foreground")}>{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Risk() {
  const { data: accounts, isLoading } = useListAccounts();

  const summary = accounts ? {
    total: accounts.length,
    active: accounts.filter(a => a.status === "active").length,
    blown: accounts.filter(a => a.status === "blown").length,
    passed: accounts.filter(a => a.status === "passed").length,
  } : null;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-black">Gestão de Risco</h1>
        <p className="text-sm text-muted-foreground">Monitorize limites de risco e disciplina em todas as contas</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="h-56 bg-card rounded-xl animate-pulse" />)}</div>
      ) : !accounts?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><ShieldX className="h-8 w-8 text-muted-foreground" /></div>
          <p className="text-lg font-bold mb-1">Nenhuma conta ainda</p>
          <p className="text-sm text-muted-foreground mb-4">Crie uma conta para monitorizar o risco</p>
          <Link href="/contas"><button className="text-sm text-primary hover:underline font-semibold">Criar conta →</button></Link>
        </div>
      ) : (
        <>
          {/* Summary */}
          {summary && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total de Contas", value: summary.total, color: "text-foreground", bg: "bg-muted/40" },
                { label: "Ativas", value: summary.active, color: "text-green-500", bg: "bg-green-500/8" },
                { label: "Queimadas", value: summary.blown, color: "text-red-500", bg: "bg-red-500/8" },
                { label: "Aprovadas", value: summary.passed, color: "text-blue-500", bg: "bg-blue-500/8" },
              ].map(item => (
                <div key={item.label} className={cn("rounded-xl p-4 text-center border border-border/50", item.bg)}>
                  <p className={cn("text-3xl font-black", item.color)}>{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {accounts.map(a => <RiskCard key={a.id} accountId={a.id} />)}
          </div>
        </>
      )}
    </div>
  );
}
