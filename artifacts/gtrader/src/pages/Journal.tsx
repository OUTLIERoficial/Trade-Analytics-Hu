import { useState } from "react";
import { useListTrades, useDeleteTrade, getListTradesQueryKey, useListAccounts } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate, pnlColor, resultBadgeClass, resultLabel, directionLabel, cn, TIMEFRAMES, SESSIONS, SESSION_LABELS, SETUPS, ENTRY_TRIGGERS } from "@/lib/utils";
import { Link } from "wouter";
import { Plus, Trash2, Filter, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ALL = "__all__";

export default function Journal() {
  const { data: accounts } = useListAccounts();
  const [filters, setFilters] = useState<{ accountId?: number; result?: string; timeframe?: string; session?: string; setup?: string; entryTrigger?: string }>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data: trades, isLoading } = useListTrades(filters);
  const deleteTrade = useDeleteTrade();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function setFilter(key: string, value: string) {
    setFilters(f => value === ALL ? (({ [key]: _, ...rest }) => rest)(f as Record<string, string>) : { ...f, [key]: key === "accountId" ? parseInt(value, 10) : value });
  }

  const activeFilterCount = Object.keys(filters).length;

  async function handleDelete(id: number) {
    if (!confirm("Eliminar esta operação permanentemente?")) return;
    deleteTrade.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() }); toast({ title: "Operação eliminada" }); },
    });
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground">Diário de Operações</h1>
          <p className="text-sm text-muted-foreground">{trades?.length ?? 0} operaç{trades?.length !== 1 ? "ões" : "ão"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="relative" data-testid="button-toggle-filters">
            <Filter className="h-3.5 w-3.5 mr-1.5" /> Filtros
            {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full brand-bg text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
          </Button>
          <Link href="/diario/novo">
            <Button size="sm" className="brand-bg border-0 text-white font-bold" data-testid="button-new-trade">
              <Plus className="h-3.5 w-3.5 mr-1" /> Nova Operação
            </Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">Filtros</p>
            {activeFilterCount > 0 && <button onClick={() => setFilters({})} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><X className="h-3 w-3" /> Limpar filtros</button>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <Select value={filters.accountId?.toString() ?? ALL} onValueChange={v => setFilter("accountId", v)}>
              <SelectTrigger className="text-xs" data-testid="filter-account"><SelectValue placeholder="Conta" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as contas</SelectItem>
                {accounts?.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.result ?? ALL} onValueChange={v => setFilter("result", v)}>
              <SelectTrigger className="text-xs" data-testid="filter-result"><SelectValue placeholder="Resultado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                <SelectItem value="win">Ganho</SelectItem>
                <SelectItem value="loss">Perda</SelectItem>
                <SelectItem value="breakeven">Empate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.timeframe ?? ALL} onValueChange={v => setFilter("timeframe", v)}>
              <SelectTrigger className="text-xs" data-testid="filter-timeframe"><SelectValue placeholder="Timeframe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os TF</SelectItem>
                {TIMEFRAMES.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.session ?? ALL} onValueChange={v => setFilter("session", v)}>
              <SelectTrigger className="text-xs" data-testid="filter-session"><SelectValue placeholder="Sessão" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as sessões</SelectItem>
                {SESSIONS.map(s => <SelectItem key={s} value={s}>{SESSION_LABELS[s] ?? s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.setup ?? ALL} onValueChange={v => setFilter("setup", v)}>
              <SelectTrigger className="text-xs" data-testid="filter-setup"><SelectValue placeholder="Setup" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os setups</SelectItem>
                {SETUPS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.entryTrigger ?? ALL} onValueChange={v => setFilter("entryTrigger", v)}>
              <SelectTrigger className="text-xs" data-testid="filter-trigger"><SelectValue placeholder="Trigger" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os triggers</SelectItem>
                {ENTRY_TRIGGERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-card rounded-xl animate-pulse" />)}</div>
      ) : !trades?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl brand-bg flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-bold text-foreground mb-1">
            {activeFilterCount > 0 ? "Nenhum resultado encontrado" : "Diário vazio"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {activeFilterCount > 0 ? "Tente ajustar os filtros" : "Registe a sua primeira operação"}
          </p>
          {!activeFilterCount && <Link href="/diario/novo"><Button className="brand-bg border-0 text-white">Registar Operação</Button></Link>}
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-xl overflow-hidden trading-table">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60">
                <tr className="text-xs text-muted-foreground">
                  {["Data", "Ativo", "TF", "Setup", "Trigger", "Sessão", "R:R", "Resultado", "P&L", ""].map(h => (
                    <th key={h} className={cn("px-4 py-3 font-semibold", h === "P&L" || h === "" ? "text-right" : "text-left")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id} className="border-b border-border/30" data-testid={`trade-row-${t.id}`}>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{formatDate(t.tradeDate)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/diario/${t.id}`}>
                        <span className="font-bold hover:text-primary cursor-pointer">{t.asset}</span>
                      </Link>
                      <span className={cn("ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded", t.direction === "buy" ? "bg-profit text-green-600 dark:text-green-400" : "bg-loss text-red-600 dark:text-red-400")}>{directionLabel(t.direction)}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.timeframe ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.setup ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.entryTrigger ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.session ? (SESSION_LABELS[t.session] ?? t.session) : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{t.riskReward != null ? `${t.riskReward.toFixed(1)}R` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-bold", resultBadgeClass(t.result))}>{resultLabel(t.result)}</span>
                    </td>
                    <td className={cn("px-4 py-3 text-right font-bold font-mono", pnlColor(t.pnl))}>{t.pnl != null ? formatCurrency(t.pnl) : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all" data-testid={`button-delete-trade-${t.id}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
