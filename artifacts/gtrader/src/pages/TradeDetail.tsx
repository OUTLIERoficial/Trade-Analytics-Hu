import { useParams, Link, useLocation } from "wouter";
import { useGetTrade, useDeleteTrade, useUpdateTrade, getListTradesQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDateTime, pnlColor, resultLabel, resultBadgeClass, SESSION_LABELS, cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle, XCircle, TrendingUp, TrendingDown, Target, Brain, FileText, Shield, Trash2, Camera, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { TradeAnnotator } from "@/components/TradeAnnotator";

function BoolBadge({ value, trueLabel = "Sim", falseLabel = "Não" }: { value: boolean | null | undefined; trueLabel?: string; falseLabel?: string }) {
  if (value == null) return <span className="text-muted-foreground text-xs">—</span>;
  return value ? (
    <span className="flex items-center gap-1 text-xs text-green-500 font-semibold"><CheckCircle className="h-3.5 w-3.5" />{trueLabel}</span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-red-500 font-semibold"><XCircle className="h-3.5 w-3.5" />{falseLabel}</span>
  );
}

function Row({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className={cn("text-sm font-semibold text-right", className)}>{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md brand-bg flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        {title}
      </h2>
      {children}
    </div>
  );
}

function BarChart3Icon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
}

export default function TradeDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id, 10);
  const [, setLocation] = useLocation();
  const { data: trade, isLoading, refetch } = useGetTrade(id, { query: { enabled: !!id } });
  const deleteTrade = useDeleteTrade();
  const updateTrade = useUpdateTrade();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [annotating, setAnnotating] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Eliminar esta operação permanentemente?")) return;
    deleteTrade.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Operação eliminada" });
        setLocation("/diario");
      },
    });
  }

  function handleAnnotationSave(newPath: string) {
    if (!trade) return;
    const current: string[] = (() => {
      if (trade.imageUrls) { try { return JSON.parse(trade.imageUrls) as string[]; } catch { /* */ } }
      if (trade.screenshotUrl) return [trade.screenshotUrl];
      return [];
    })();
    const updated = [...current, newPath];
    updateTrade.mutate(
      { id, data: { imageUrls: JSON.stringify(updated) } },
      {
        onSuccess: () => {
          refetch();
          setAnnotating(null);
          toast({ title: "Anotação guardada com sucesso!" });
        },
        onError: () => toast({ title: "Erro ao guardar anotação", variant: "destructive" }),
      }
    );
  }

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />)}
      </div>
    </div>
  );
  if (!trade) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-64">
      <p className="text-muted-foreground mb-3">Operação não encontrada.</p>
      <Link href="/diario"><button className="text-sm text-primary hover:underline font-semibold">← Voltar ao Diário</button></Link>
    </div>
  );

  const images: string[] = (() => {
    if (trade.imageUrls) { try { return JSON.parse(trade.imageUrls) as string[]; } catch { /* */ } }
    if (trade.screenshotUrl) return [trade.screenshotUrl];
    return [];
  })();

  return (
    <>
      {annotating && (
        <TradeAnnotator
          imageSrc={`/api/storage${annotating}`}
          onClose={() => setAnnotating(null)}
          onSave={handleAnnotationSave}
        />
      )}

      <div className="p-4 lg:p-6 space-y-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/diario">
            <button className="p-1.5 rounded-md hover:bg-accent transition-colors" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black">{trade.asset}</h1>
              <span className={cn("text-xs px-2.5 py-1 rounded-full font-bold border", trade.direction === "buy" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                {trade.direction === "buy"
                  ? <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> COMPRA</span>
                  : <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> VENDA</span>}
              </span>
              <span className={cn("text-xs px-2.5 py-1 rounded-full font-bold", resultBadgeClass(trade.result))}>
                {resultLabel(trade.result)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{formatDateTime(trade.tradeDate)}</p>
          </div>
          <div className="flex items-center gap-3">
            {trade.pnl != null && (
              <span className={cn("text-2xl font-black font-mono", pnlColor(trade.pnl))}>
                {trade.pnl >= 0 ? "+" : ""}{formatCurrency(trade.pnl)}
              </span>
            )}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleDelete} data-testid="button-delete-trade">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SMC Context */}
          <SectionCard title="Contexto SMC/ICT" icon={BarChart3Icon}>
            <Row label="Timeframe" value={trade.timeframe} />
            <Row label="Bias HTF" value={trade.higherTimeframeBias} />
            <Row label="Trigger de Entrada" value={<span className="font-bold text-primary">{trade.entryTrigger ?? "—"}</span>} />
            <Row label="Setup" value={trade.setup} />
            <Row label="Sessão" value={trade.session ? (SESSION_LABELS[trade.session] ?? trade.session) : null} />
            <Row label="Estratégia" value={trade.strategy} />
          </SectionCard>

          {/* Price & Risk */}
          <SectionCard title="Preços e Risco" icon={Target}>
            <Row label="Preço de Entrada" value={trade.entryPrice != null ? trade.entryPrice.toFixed(5) : null} />
            <Row label="Stop Loss" value={trade.stopLoss != null ? trade.stopLoss.toFixed(5) : null} />
            <Row label="Take Profit" value={trade.takeProfit != null ? trade.takeProfit.toFixed(5) : null} />
            <Row label="Risk/Reward" value={trade.riskReward != null ? <span className="font-black">{trade.riskReward.toFixed(2)}R</span> : null} />
            <Row label="Risco %" value={trade.riskPercent != null ? `${trade.riskPercent.toFixed(2)}%` : null} />
            <Row label="Valor em Risco" value={trade.riskAmount != null ? formatCurrency(trade.riskAmount) : null} />
          </SectionCard>

          {/* Discipline */}
          <SectionCard title="Disciplina" icon={Shield}>
            <Row label="Seguiu o Plano" value={<BoolBadge value={trade.followedPlan} />} />
            <Row label="Setup Válido" value={<BoolBadge value={trade.validSetup} />} />
            <Row label="Risco Respeitado" value={<BoolBadge value={trade.riskRespected} />} />
            <Row label="Trade Impulsivo" value={<BoolBadge value={trade.impulsiveTrade} trueLabel="Sim ⚠️" falseLabel="Não" />} />
            {trade.disciplineScore != null && (
              <div className="pt-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground font-medium">Pontuação de Disciplina</span>
                  <span className={cn("font-black text-sm", trade.disciplineScore >= 70 ? "text-profit" : trade.disciplineScore >= 50 ? "text-amber-500" : "text-loss")}>
                    {trade.disciplineScore}/100
                  </span>
                </div>
                <div className="progress-bar">
                  <div className={cn("progress-fill", trade.disciplineScore >= 70 ? "bg-green-500" : trade.disciplineScore >= 50 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${trade.disciplineScore}%` }} />
                </div>
              </div>
            )}
          </SectionCard>

          {/* Psychology */}
          <SectionCard title="Psicologia" icon={Brain}>
            <div className="grid grid-cols-2 gap-3 mb-2">
              {trade.emotionBefore && (
                <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground">Antes do trade</p>
                  <p className="text-sm font-bold mt-1 capitalize">{trade.emotionBefore.replace(/_/g, " ")}</p>
                </div>
              )}
              {trade.emotionAfter && (
                <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground">Depois do trade</p>
                  <p className="text-sm font-bold mt-1 capitalize">{trade.emotionAfter.replace(/_/g, " ")}</p>
                </div>
              )}
            </div>
            {trade.tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {trade.tags.split(",").map(tag => (
                  <span key={tag} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{tag.trim()}</span>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {trade.notes && (
          <SectionCard title="Notas e Observações" icon={FileText}>
            <p className="text-sm text-muted-foreground leading-relaxed italic whitespace-pre-wrap">{trade.notes}</p>
          </SectionCard>
        )}

        {/* Screenshots + Annotation */}
        {images.length > 0 && (
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md brand-bg flex items-center justify-center">
                <Camera className="h-3.5 w-3.5 text-white" />
              </div>
              Screenshots do Gráfico
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                {images.length} {images.length === 1 ? "imagem" : "imagens"}
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {images.map((path, i) => (
                <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={`/api/storage${path}`}
                    alt={`Screenshot ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setAnnotating(path)}
                      title="Anotar gráfico"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary rounded-lg text-white text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Anotar
                    </button>
                    <a
                      href={`/api/storage${path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 bg-white/20 rounded-lg text-white text-xs hover:bg-white/30 transition-colors"
                      title="Abrir em ecrã completo"
                    >
                      ↗
                    </a>
                  </div>
                  <div className="absolute bottom-1 left-1 text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded font-mono">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Passe o cursor sobre uma imagem e clique em <strong>Anotar</strong> para marcar entradas, zonas e notas diretamente no gráfico.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
