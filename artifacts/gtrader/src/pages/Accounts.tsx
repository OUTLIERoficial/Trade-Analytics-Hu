import { useState } from "react";
import { useListAccounts, useCreateAccount, useDeleteAccount, getListAccountsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS, ACCOUNT_STATUSES, ACCOUNT_STATUS_LABELS, cn } from "@/lib/utils";
import { Link } from "wouter";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function statusStyle(status: string) {
  const m: Record<string, string> = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    passed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    failed: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    blown: "bg-red-500/10 text-red-500 border-red-500/20",
    archived: "bg-muted text-muted-foreground border-border",
  };
  return m[status] ?? "bg-muted text-muted-foreground";
}

export default function Accounts() {
  const { data: accounts, isLoading } = useListAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", brokerName: "", accountType: "forex", initialBalance: "", currency: "USD", status: "active", growthTarget: "", dailyLossLimit: "", maxDrawdown: "" });

  function reset() {
    setForm({ name: "", brokerName: "", accountType: "forex", initialBalance: "", currency: "USD", status: "active", growthTarget: "", dailyLossLimit: "", maxDrawdown: "" });
  }

  async function handleCreate() {
    if (!form.name || !form.initialBalance) return;
    createAccount.mutate({
      data: {
        name: form.name,
        brokerName: form.brokerName || null,
        accountType: form.accountType,
        initialBalance: parseFloat(form.initialBalance),
        currentBalance: parseFloat(form.initialBalance),
        currency: form.currency,
        status: form.status,
        growthTarget: form.growthTarget ? parseFloat(form.growthTarget) : null,
        dailyLossLimit: form.dailyLossLimit ? parseFloat(form.dailyLossLimit) : null,
        maxDrawdown: form.maxDrawdown ? parseFloat(form.maxDrawdown) : null,
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
        toast({ title: "Conta criada com sucesso" });
        setOpen(false); reset();
      },
      onError: () => toast({ title: "Erro ao criar conta", variant: "destructive" }),
    });
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Eliminar a conta "${name}"? Todas as operações associadas serão removidas.`)) return;
    deleteAccount.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
        toast({ title: "Conta eliminada" });
      },
    });
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground">Contas</h1>
          <p className="text-sm text-muted-foreground">Gerencie todas as suas contas de trading</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="brand-bg border-0 text-white hover:opacity-90 font-bold" data-testid="button-add-account">
          <Plus className="h-4 w-4 mr-1" /> Nova Conta
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />)}
        </div>
      ) : !accounts?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl brand-bg flex items-center justify-center mb-4" style={{ boxShadow: "0 8px 24px hsl(221 83% 53% / 0.3)" }}>
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-bold text-foreground mb-1">Nenhuma conta ainda</p>
          <p className="text-sm text-muted-foreground mb-4">Crie a sua primeira conta para começar a registar operações</p>
          <Button onClick={() => setOpen(true)} className="brand-bg border-0 text-white" data-testid="button-add-account-empty">Criar Primeira Conta</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => {
            const growth = acc.initialBalance > 0 ? ((acc.currentBalance - acc.initialBalance) / acc.initialBalance) * 100 : 0;
            const isPositive = acc.currentBalance >= acc.initialBalance;
            return (
              <div key={acc.id} className="bg-card border border-card-border rounded-xl p-5 space-y-4 hover:border-primary/40 transition-all hover:shadow-lg group" data-testid={`account-card-${acc.id}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/contas/${acc.id}`}>
                      <h3 className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors text-base">{acc.name}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{acc.brokerName ?? ACCOUNT_TYPE_LABELS[acc.accountType]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold border", statusStyle(acc.status))}>{ACCOUNT_STATUS_LABELS[acc.status] ?? acc.status}</span>
                    <button onClick={() => handleDelete(acc.id, acc.name)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all" data-testid={`button-delete-account-${acc.id}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Balance section */}
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Saldo Atual</p>
                  <p className="text-2xl font-black text-foreground">{formatCurrency(acc.currentBalance, acc.currency)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Inicial: {formatCurrency(acc.initialBalance, acc.currency)}</span>
                    <span className={cn("flex items-center gap-0.5 text-xs font-bold", isPositive ? "text-profit" : "text-loss")}>
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Limits */}
                {(acc.maxDrawdown || acc.dailyLossLimit) && (
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {acc.maxDrawdown && <span>DD máx: {acc.maxDrawdown}%</span>}
                    {acc.dailyLossLimit && <span>Perda diária: {formatCurrency(acc.dailyLossLimit)}</span>}
                  </div>
                )}

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{ACCOUNT_TYPE_LABELS[acc.accountType]} · {acc.currency}</span>
                  <Link href={`/contas/${acc.id}`}>
                    <button className="text-xs text-primary hover:underline font-semibold" data-testid={`link-account-detail-${acc.id}`}>Ver detalhes →</button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-lg font-black">Nova Conta de Trading</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Nome da Conta *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: NAS100 Forex Live" data-testid="input-account-name" />
            </div>
            <div className="grid gap-1.5">
              <Label>Corretora</Label>
              <Input value={form.brokerName} onChange={e => setForm(f => ({ ...f, brokerName: e.target.value }))} placeholder="ex: IC Markets, FTMO" data-testid="input-account-broker" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Tipo</Label>
                <Select value={form.accountType} onValueChange={v => setForm(f => ({ ...f, accountType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ACCOUNT_TYPES.map(t => <SelectItem key={t} value={t}>{ACCOUNT_TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ACCOUNT_STATUSES.map(s => <SelectItem key={s} value={s}>{ACCOUNT_STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Saldo Inicial *</Label>
                <Input type="number" value={form.initialBalance} onChange={e => setForm(f => ({ ...f, initialBalance: e.target.value }))} placeholder="10000" data-testid="input-initial-balance" />
              </div>
              <div className="grid gap-1.5">
                <Label>Moeda</Label>
                <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} placeholder="USD" data-testid="input-currency" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Drawdown Máx. %</Label>
                <Input type="number" value={form.maxDrawdown} onChange={e => setForm(f => ({ ...f, maxDrawdown: e.target.value }))} placeholder="10" data-testid="input-max-drawdown" />
              </div>
              <div className="grid gap-1.5">
                <Label>Meta de Crescimento %</Label>
                <Input type="number" value={form.growthTarget} onChange={e => setForm(f => ({ ...f, growthTarget: e.target.value }))} placeholder="20" data-testid="input-growth-target" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createAccount.isPending || !form.name || !form.initialBalance} className="brand-bg border-0 text-white" data-testid="button-create-account">
              {createAccount.isPending ? "Criando..." : "Criar Conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
