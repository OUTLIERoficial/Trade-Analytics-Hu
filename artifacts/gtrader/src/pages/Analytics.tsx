import { useState } from "react";
import { useGetTimeframeAnalytics, useGetTriggerAnalytics, useGetSessionAnalytics, useGetSetupAnalytics, useGetCombinationAnalytics, useListAccounts } from "@workspace/api-client-react";
import { formatCurrency, formatPercent, cn, SESSION_LABELS } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

const ALL = "__all__";

function winRateColor(wr: number) {
  if (wr >= 60) return "hsl(142 71% 42%)";
  if (wr >= 40) return "hsl(43 96% 56%)";
  return "hsl(0 72% 54%)";
}
function winRateTextClass(wr: number) {
  if (wr >= 60) return "text-profit";
  if (wr >= 40) return "text-amber-500";
  return "text-loss";
}

function PerfTable({ data, keyLabel, keyField, displayFn }: {
  data: { winRate: number; totalPnl: number; totalTrades: number; profitFactor: number; averageRR: number; [key: string]: unknown }[];
  keyLabel: string; keyField: string; displayFn?: (v: string) => string;
}) {
  return (
    <div className="overflow-x-auto trading-table">
      <table className="w-full text-sm">
        <thead className="border-b border-border/60">
          <tr className="text-xs text-muted-foreground">
            <th className="text-left py-3 pr-4 font-semibold">{keyLabel}</th>
            <th className="text-right py-3 pr-4 font-semibold">Operações</th>
            <th className="text-right py-3 pr-4 font-semibold">Acerto</th>
            <th className="text-right py-3 pr-4 font-semibold">P&L Total</th>
            <th className="text-right py-3 pr-4 font-semibold">Profit Factor</th>
            <th className="text-right py-3 font-semibold">Avg R:R</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const raw = String(row[keyField] ?? "—");
            const display = displayFn ? displayFn(raw) : raw;
            return (
              <tr key={i} className="border-b border-border/30">
                <td className="py-3 pr-4 font-bold">{display}</td>
                <td className="py-3 pr-4 text-right text-muted-foreground">{row.totalTrades}</td>
                <td className={cn("py-3 pr-4 text-right font-bold", winRateTextClass(row.winRate))}>{formatPercent(row.winRate)}</td>
                <td className={cn("py-3 pr-4 text-right font-bold font-mono", row.totalPnl >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(row.totalPnl)}</td>
                <td className="py-3 pr-4 text-right text-muted-foreground font-mono">{row.profitFactor.toFixed(2)}</td>
                <td className="py-3 text-right text-muted-foreground font-mono">{row.averageRR.toFixed(2)}R</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { key: "timeframes", label: "Timeframes" },
  { key: "triggers", label: "Triggers" },
  { key: "sessions", label: "Sessões" },
  { key: "setups", label: "Setups" },
  { key: "combinations", label: "Melhores Combos" },
] as const;

export default function Analytics() {
  const { data: accounts } = useListAccounts();
  const [accountId, setAccountId] = useState<number | undefined>();
  const [tab, setTab] = useState<"timeframes" | "triggers" | "sessions" | "setups" | "combinations">("timeframes");
  const params = accountId ? { accountId } : {};
  const { data: timeframes } = useGetTimeframeAnalytics(params);
  const { data: triggers } = useGetTriggerAnalytics(params);
  const { data: sessions } = useGetSessionAnalytics(params);
  const { data: setups } = useGetSetupAnalytics(params);
  const { data: combinations } = useGetCombinationAnalytics(params);

  const chartDataMap = {
    timeframes: timeframes?.slice(0, 8).map(d => ({ name: d.timeframe, winRate: parseFloat(d.winRate.toFixed(1)) })) ?? [],
    triggers: triggers?.slice(0, 8).map(d => ({ name: d.entryTrigger.slice(0, 10), winRate: parseFloat(d.winRate.toFixed(1)) })) ?? [],
    sessions: sessions?.map(d => ({ name: SESSION_LABELS[d.session] ?? d.session, winRate: parseFloat(d.winRate.toFixed(1)) })) ?? [],
    setups: setups?.slice(0, 8).map(d => ({ name: d.setup.slice(0, 12), winRate: parseFloat(d.winRate.toFixed(1)) })) ?? [],
    combinations: [],
  };
  const chartData = chartDataMap[tab] ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Análise detalhada do desempenho</p>
        </div>
        <Select value={accountId?.toString() ?? ALL} onValueChange={v => setAccountId(v === ALL ? undefined : parseInt(v, 10))}>
          <SelectTrigger className="w-44 text-sm" data-testid="select-analytics-account">
            <SelectValue placeholder="Todas as contas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as contas</SelectItem>
            {accounts?.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/60 p-1 rounded-xl w-fit border border-border/50">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("px-4 py-2 text-sm rounded-lg font-semibold transition-all", tab === t.key ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground")} data-testid={`tab-${t.key}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {tab !== "combinations" && chartData.length > 0 && (
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Taxa de Acerto — {TABS.find(t => t.key === tab)?.label}
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 25, left: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip
                formatter={(v: number) => [`${v.toFixed(1)}%`, "Taxa de Acerto"]}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
              />
              <Bar dataKey="winRate" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={winRateColor(entry.winRate)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-card-border rounded-xl p-5">
        {tab === "timeframes" && (
          <>
            <h2 className="text-sm font-bold mb-4">Desempenho por Timeframe</h2>
            {timeframes?.length ? <PerfTable data={timeframes} keyLabel="Timeframe" keyField="timeframe" /> : <p className="text-sm text-muted-foreground py-8 text-center">Nenhum dado ainda. Registe operações para ver analytics.</p>}
          </>
        )}
        {tab === "triggers" && (
          <>
            <h2 className="text-sm font-bold mb-4">Desempenho por Trigger de Entrada</h2>
            {triggers?.length ? <PerfTable data={triggers} keyLabel="Entry Trigger" keyField="entryTrigger" /> : <p className="text-sm text-muted-foreground py-8 text-center">Nenhum dado ainda.</p>}
          </>
        )}
        {tab === "sessions" && (
          <>
            <h2 className="text-sm font-bold mb-4">Desempenho por Sessão</h2>
            {sessions?.length ? <PerfTable data={sessions} keyLabel="Sessão" keyField="session" displayFn={v => SESSION_LABELS[v] ?? v} /> : <p className="text-sm text-muted-foreground py-8 text-center">Nenhum dado ainda.</p>}
          </>
        )}
        {tab === "setups" && (
          <>
            <h2 className="text-sm font-bold mb-4">Desempenho por Setup</h2>
            {setups?.length ? <PerfTable data={setups} keyLabel="Setup" keyField="setup" /> : <p className="text-sm text-muted-foreground py-8 text-center">Nenhum dado ainda.</p>}
          </>
        )}
        {tab === "combinations" && (
          <>
            <h2 className="text-sm font-bold mb-4">Melhores Combinações de Setup</h2>
            {combinations?.length ? (
              <div className="space-y-2.5">
                {combinations.map((c, i) => (
                  <div key={i} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all", i === 0 ? "border-amber-500/30 bg-amber-500/5" : "border-border/50 bg-muted/30")} data-testid={`combo-row-${i}`}>
                    <div className="flex items-center gap-3">
                      {i < 3 && <span className="text-lg font-black">{["🥇", "🥈", "🥉"][i]}</span>}
                      <div>
                        <p className="text-sm font-bold">{[c.timeframe, c.entryTrigger, c.setup].filter(Boolean).join(" + ") || "Combinação Geral"}</p>
                        <p className="text-xs text-muted-foreground">{c.totalTrades} operações · PF: {c.profitFactor.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-black", winRateTextClass(c.winRate))}>{c.winRate.toFixed(1)}%</p>
                      <p className={cn("text-xs font-mono font-bold", c.totalPnl >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(c.totalPnl)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">Registe pelo menos 2 operações com a mesma combinação TF+Trigger+Setup para ver os melhores combos.</p>}
          </>
        )}
      </div>
    </div>
  );
}
