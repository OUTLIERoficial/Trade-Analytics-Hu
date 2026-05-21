import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCreateTrade, useListAccounts, getListTradesQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { TIMEFRAMES, HIGHER_TF, ENTRY_TRIGGERS, SESSIONS, SESSION_LABELS, SETUPS, EMOTIONS_BEFORE, EMOTIONS_AFTER } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Brain, FileText, DollarSign, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TradeImageUpload } from "@/components/TradeImageUpload";

const NONE = "__none__";

type FormState = {
  accountId: string; tradeDate: string; asset: string; direction: string; strategy: string;
  setup: string; timeframe: string; higherTimeframeBias: string; entryTrigger: string; session: string;
  entryPrice: string; stopLoss: string; takeProfit: string; riskPercent: string; riskAmount: string;
  riskReward: string; result: string; pnl: string; followedPlan: string; validSetup: string;
  impulsiveTrade: string; riskRespected: string; emotionBefore: string; emotionAfter: string;
  disciplineScore: string; notes: string; tags: string;
};

function initialForm(): FormState {
  return {
    accountId: "", tradeDate: new Date().toISOString().slice(0, 16), asset: "", direction: "buy",
    strategy: "", setup: "", timeframe: "", higherTimeframeBias: "", entryTrigger: "", session: "",
    entryPrice: "", stopLoss: "", takeProfit: "", riskPercent: "", riskAmount: "", riskReward: "",
    result: "win", pnl: "", followedPlan: "", validSetup: "", impulsiveTrade: "", riskRespected: "",
    emotionBefore: "", emotionAfter: "", disciplineScore: "", notes: "", tags: "",
  };
}

function SectionHeader({ icon: Icon, title, color = "text-white" }: { icon: React.ElementType; title: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-md brand-bg flex items-center justify-center">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
    </div>
  );
}

export default function NewTrade() {
  const [, setLocation] = useLocation();
  const { data: accounts } = useListAccounts();
  const createTrade = useCreateTrade();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function optionalBool(v: string): boolean | null {
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.accountId || !form.asset || !form.result) {
      toast({ title: "Preencha os campos obrigatórios: Conta, Ativo e Resultado", variant: "destructive" }); return;
    }
    createTrade.mutate({
      data: {
        accountId: parseInt(form.accountId, 10),
        tradeDate: form.tradeDate,
        asset: form.asset,
        direction: form.direction,
        strategy: form.strategy || null,
        setup: form.setup === NONE ? null : form.setup || null,
        timeframe: form.timeframe === NONE ? null : form.timeframe || null,
        higherTimeframeBias: form.higherTimeframeBias === NONE ? null : form.higherTimeframeBias || null,
        entryTrigger: form.entryTrigger === NONE ? null : form.entryTrigger || null,
        session: form.session === NONE ? null : form.session || null,
        entryPrice: form.entryPrice ? parseFloat(form.entryPrice) : null,
        stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null,
        takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : null,
        riskPercent: form.riskPercent ? parseFloat(form.riskPercent) : null,
        riskAmount: form.riskAmount ? parseFloat(form.riskAmount) : null,
        riskReward: form.riskReward ? parseFloat(form.riskReward) : null,
        result: form.result,
        pnl: form.pnl ? parseFloat(form.pnl) : null,
        followedPlan: optionalBool(form.followedPlan),
        validSetup: optionalBool(form.validSetup),
        impulsiveTrade: optionalBool(form.impulsiveTrade),
        riskRespected: optionalBool(form.riskRespected),
        emotionBefore: form.emotionBefore === NONE ? null : form.emotionBefore || null,
        emotionAfter: form.emotionAfter === NONE ? null : form.emotionAfter || null,
        disciplineScore: form.disciplineScore ? parseInt(form.disciplineScore, 10) : null,
        notes: form.notes || null,
        tags: form.tags || null,
        screenshotUrl: imageUrls.length > 0 ? imageUrls[0] : null,
        imageUrls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
      },
    }, {
      onSuccess: (trade) => {
        queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Operação registada com sucesso!" });
        setLocation(`/diario/${trade.id}`);
      },
      onError: () => toast({ title: "Erro ao registar operação", variant: "destructive" }),
    });
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/diario">
          <button className="p-1.5 rounded-md hover:bg-accent transition-colors" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-black text-foreground">Nova Operação</h1>
          <p className="text-sm text-muted-foreground">Registe todos os detalhes do seu trade SMC/ICT</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core trade info */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader icon={BarChart3} title="Informação da Operação" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Conta *</Label>
              <Select value={form.accountId} onValueChange={v => set("accountId", v)}>
                <SelectTrigger data-testid="select-account"><SelectValue placeholder="Selecionar conta" /></SelectTrigger>
                <SelectContent>{accounts?.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Data e Hora</Label>
              <Input type="datetime-local" value={form.tradeDate} onChange={e => set("tradeDate", e.target.value)} data-testid="input-trade-date" />
            </div>
            <div className="grid gap-1.5">
              <Label>Ativo *</Label>
              <Input value={form.asset} onChange={e => set("asset", e.target.value)} placeholder="ex: NAS100, EURUSD, XAUUSD" data-testid="input-asset" />
            </div>
            <div className="grid gap-1.5">
              <Label>Direção</Label>
              <Select value={form.direction} onValueChange={v => set("direction", v)}>
                <SelectTrigger data-testid="select-direction"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy"><span className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-green-500" /> Compra (Long)</span></SelectItem>
                  <SelectItem value="sell"><span className="flex items-center gap-2"><TrendingDown className="h-3.5 w-3.5 text-red-500" /> Venda (Short)</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Resultado *</Label>
              <Select value={form.result} onValueChange={v => set("result", v)}>
                <SelectTrigger data-testid="select-result"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="win">Ganho</SelectItem>
                  <SelectItem value="loss">Perda</SelectItem>
                  <SelectItem value="breakeven">Empate (BE)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>P&L ($)</Label>
              <Input type="number" step="0.01" value={form.pnl} onChange={e => set("pnl", e.target.value)} placeholder="ex: 250.00 ou -100.00" data-testid="input-pnl" />
            </div>
          </div>
        </div>

        {/* Timeframe & SMC context */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader icon={BarChart3} title="Timeframe e Contexto SMC/ICT" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Timeframe de Entrada</Label>
              <Select value={form.timeframe || NONE} onValueChange={v => set("timeframe", v === NONE ? "" : v)}>
                <SelectTrigger data-testid="select-timeframe"><SelectValue placeholder="Selecionar TF" /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>Nenhum</SelectItem>{TIMEFRAMES.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Bias HTF</Label>
              <Select value={form.higherTimeframeBias || NONE} onValueChange={v => set("higherTimeframeBias", v === NONE ? "" : v)}>
                <SelectTrigger data-testid="select-htf"><SelectValue placeholder="Bias HTF" /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>Nenhum</SelectItem>{HIGHER_TF.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Trigger de Entrada</Label>
              <Select value={form.entryTrigger || NONE} onValueChange={v => set("entryTrigger", v === NONE ? "" : v)}>
                <SelectTrigger data-testid="select-trigger"><SelectValue placeholder="Trigger" /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>Nenhum</SelectItem>{ENTRY_TRIGGERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Setup / Contexto</Label>
              <Select value={form.setup || NONE} onValueChange={v => set("setup", v === NONE ? "" : v)}>
                <SelectTrigger data-testid="select-setup"><SelectValue placeholder="Setup" /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>Nenhum</SelectItem>{SETUPS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Sessão</Label>
              <Select value={form.session || NONE} onValueChange={v => set("session", v === NONE ? "" : v)}>
                <SelectTrigger data-testid="select-session"><SelectValue placeholder="Sessão" /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>Nenhum</SelectItem>{SESSIONS.map(s => <SelectItem key={s} value={s}>{SESSION_LABELS[s] ?? s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Estratégia</Label>
              <Input value={form.strategy} onChange={e => set("strategy", e.target.value)} placeholder="ex: SMC, ICT" data-testid="input-strategy" />
            </div>
          </div>
        </div>

        {/* Price & risk */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader icon={DollarSign} title="Preços e Gestão de Risco" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="grid gap-1.5"><Label>Entrada</Label><Input type="number" step="any" value={form.entryPrice} onChange={e => set("entryPrice", e.target.value)} placeholder="0.000" data-testid="input-entry-price" /></div>
            <div className="grid gap-1.5"><Label>Stop Loss</Label><Input type="number" step="any" value={form.stopLoss} onChange={e => set("stopLoss", e.target.value)} placeholder="0.000" data-testid="input-stop-loss" /></div>
            <div className="grid gap-1.5"><Label>Take Profit</Label><Input type="number" step="any" value={form.takeProfit} onChange={e => set("takeProfit", e.target.value)} placeholder="0.000" data-testid="input-take-profit" /></div>
            <div className="grid gap-1.5"><Label>R:R</Label><Input type="number" step="0.1" value={form.riskReward} onChange={e => set("riskReward", e.target.value)} placeholder="2.0" data-testid="input-rr" /></div>
            <div className="grid gap-1.5"><Label>Risco %</Label><Input type="number" step="0.1" value={form.riskPercent} onChange={e => set("riskPercent", e.target.value)} placeholder="1.0" data-testid="input-risk-percent" /></div>
            <div className="grid gap-1.5"><Label>Valor em Risco</Label><Input type="number" step="0.01" value={form.riskAmount} onChange={e => set("riskAmount", e.target.value)} placeholder="100" data-testid="input-risk-amount" /></div>
          </div>
        </div>

        {/* Screenshots */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader icon={Camera} title="Screenshots do Gráfico" />
          <p className="text-xs text-muted-foreground mb-3">Adicione imagens de antes e depois da operação — análise HTF, ponto de entrada, resultado. Até 8 imagens.</p>
          <TradeImageUpload
            value={imageUrls}
            onChange={setImageUrls}
            maxImages={8}
          />
        </div>

        {/* Discipline */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader icon={BarChart3} title="Disciplina e Execução" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {[
              { key: "followedPlan", label: "Seguiu o Plano?" },
              { key: "validSetup", label: "Setup Válido?" },
              { key: "riskRespected", label: "Risco Respeitado?" },
              { key: "impulsiveTrade", label: "Trade Impulsivo?" },
            ].map(({ key, label }) => (
              <div key={key} className="grid gap-1.5">
                <Label className="text-xs">{label}</Label>
                <Select value={form[key as keyof FormState] || NONE} onValueChange={v => set(key as keyof FormState, v === NONE ? "" : v)}>
                  <SelectTrigger data-testid={`select-${key}`}><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent><SelectItem value={NONE}>—</SelectItem><SelectItem value="true">Sim</SelectItem><SelectItem value="false">Não</SelectItem></SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="grid gap-1.5">
            <Label>Pontuação de Disciplina (0–100)</Label>
            <Input type="number" min="0" max="100" value={form.disciplineScore} onChange={e => set("disciplineScore", e.target.value)} placeholder="85" data-testid="input-discipline-score" />
          </div>
        </div>

        {/* Psychology */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader icon={Brain} title="Psicologia" />
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Estado Emocional — Antes</Label>
              <Select value={form.emotionBefore || NONE} onValueChange={v => set("emotionBefore", v === NONE ? "" : v)}>
                <SelectTrigger data-testid="select-emotion-before"><SelectValue placeholder="Antes do trade" /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>Nenhum</SelectItem>{EMOTIONS_BEFORE.map(e => <SelectItem key={e} value={e}>{e.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Estado Emocional — Depois</Label>
              <Select value={form.emotionAfter || NONE} onValueChange={v => set("emotionAfter", v === NONE ? "" : v)}>
                <SelectTrigger data-testid="select-emotion-after"><SelectValue placeholder="Depois do trade" /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>Nenhum</SelectItem>{EMOTIONS_AFTER.map(e => <SelectItem key={e} value={e}>{e.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader icon={FileText} title="Notas e Observações" />
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label>Notas (raciocínio, observações, lições)</Label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Descreva o raciocínio por detrás do trade, o que correu bem/mal..." rows={3} data-testid="textarea-notes" />
            </div>
            <div className="grid gap-1.5">
              <Label>Tags (separadas por vírgula)</Label>
              <Input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="killzone, alta-convicção, notícias" data-testid="input-tags" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={createTrade.isPending} className="brand-bg border-0 text-white font-bold px-8" data-testid="button-submit-trade" style={{ boxShadow: "0 4px 14px hsl(221 83% 53% / 0.35)" }}>
            {createTrade.isPending ? "A guardar..." : "Guardar Operação"}
          </Button>
          <Link href="/diario"><Button type="button" variant="outline">Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
