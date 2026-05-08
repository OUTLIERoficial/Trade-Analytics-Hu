import { useState } from "react";
import { useListPsychologyLogs, useCreatePsychologyLog, useDeletePsychologyLog, getListPsychologyLogsQueryKey, useListAccounts } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate, cn } from "@/lib/utils";
import { Plus, Brain, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const NONE = "__none__";

const EMOTION_STATES = [
  { value: "excellent", label: "Excelente", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25" },
  { value: "good", label: "Bom", color: "bg-green-500/15 text-green-500 border-green-500/25" },
  { value: "neutral", label: "Neutro", color: "bg-slate-500/15 text-slate-500 border-slate-500/25" },
  { value: "anxious", label: "Ansioso", color: "bg-amber-500/15 text-amber-500 border-amber-500/25" },
  { value: "stressed", label: "Stressado", color: "bg-orange-500/15 text-orange-500 border-orange-500/25" },
  { value: "fearful", label: "Com Medo", color: "bg-red-500/15 text-red-500 border-red-500/25" },
  { value: "overconfident", label: "Demasiado Confiante", color: "bg-purple-500/15 text-purple-500 border-purple-500/25" },
  { value: "revenge_mode", label: "Modo Vingança", color: "bg-rose-600/15 text-rose-600 border-rose-600/25" },
  { value: "focused", label: "Focado", color: "bg-blue-500/15 text-blue-500 border-blue-500/25" },
  { value: "tired", label: "Cansado", color: "bg-zinc-500/15 text-zinc-500 border-zinc-500/25" },
];

function getEmotionStyle(state: string) {
  return EMOTION_STATES.find(e => e.value === state)?.color ?? "bg-muted text-muted-foreground";
}
function getEmotionLabel(state: string) {
  return EMOTION_STATES.find(e => e.value === state)?.label ?? state;
}

function ScoreBar({ label, value, invert = false }: { label: string; value: number | null | undefined; invert?: boolean }) {
  if (value == null) return null;
  const display = invert ? 10 - value : value;
  const color = display >= 7 ? "bg-green-500" : display >= 4 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold text-foreground">{value}/10</span>
      </div>
      <div className="progress-bar">
        <div className={cn("progress-fill", color)} style={{ width: `${display * 10}%` }} />
      </div>
    </div>
  );
}

export default function Psychology() {
  const { data: accounts } = useListAccounts();
  const { data: logs, isLoading } = useListPsychologyLogs();
  const createLog = useCreatePsychologyLog();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ accountId: "", logDate: new Date().toISOString().slice(0, 10), emotionState: "focused", energyLevel: "", stressLevel: "", focusLevel: "", notes: "", tradedToday: "", followedRules: "", overallScore: "" });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function optBool(v: string) { return v === "true" ? true : v === "false" ? false : null; }

  async function handleCreate() {
    createLog.mutate({
      data: {
        accountId: form.accountId && form.accountId !== NONE ? parseInt(form.accountId, 10) : null,
        logDate: new Date(form.logDate + "T12:00:00Z").toISOString(),
        emotionState: form.emotionState,
        energyLevel: form.energyLevel ? parseInt(form.energyLevel, 10) : null,
        stressLevel: form.stressLevel ? parseInt(form.stressLevel, 10) : null,
        focusLevel: form.focusLevel ? parseInt(form.focusLevel, 10) : null,
        notes: form.notes || null,
        tradedToday: optBool(form.tradedToday),
        followedRules: optBool(form.followedRules),
        overallScore: form.overallScore ? parseInt(form.overallScore, 10) : null,
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPsychologyLogsQueryKey() });
        toast({ title: "Registo de psicologia guardado" });
        setOpen(false);
        setForm({ accountId: "", logDate: new Date().toISOString().slice(0, 10), emotionState: "focused", energyLevel: "", stressLevel: "", focusLevel: "", notes: "", tradedToday: "", followedRules: "", overallScore: "" });
      },
      onError: () => toast({ title: "Erro ao guardar registo", variant: "destructive" }),
    });
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Psicologia</h1>
          <p className="text-sm text-muted-foreground">Registe o seu estado emocional e mental</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="brand-bg border-0 text-white font-bold" data-testid="button-new-log">
          <Plus className="h-3.5 w-3.5 mr-1" /> Registar Hoje
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-card rounded-xl animate-pulse" />)}</div>
      ) : !logs?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl brand-bg flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-bold mb-1">Nenhum registo ainda</p>
          <p className="text-sm text-muted-foreground mb-4">Monitorize o seu estado mental para melhorar a disciplina</p>
          <Button onClick={() => setOpen(true)} className="brand-bg border-0 text-white">Criar Primeiro Registo</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="bg-card border border-card-border rounded-xl p-5" data-testid={`psychology-log-${log.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs px-3 py-1 rounded-full font-bold border", getEmotionStyle(log.emotionState))}>{getEmotionLabel(log.emotionState)}</span>
                  <span className="text-sm text-muted-foreground">{formatDate(log.logDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {log.overallScore != null && (
                    <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black", log.overallScore >= 7 ? "bg-profit text-profit" : log.overallScore >= 5 ? "bg-amber-500/15 text-amber-500" : "bg-loss text-loss")}>
                      {log.overallScore}/10
                    </div>
                  )}
                  {log.tradedToday != null && <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", log.tradedToday ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground")}>{log.tradedToday ? "Operou" : "Sem trades"}</span>}
                  {log.followedRules != null && (
                    log.followedRules
                      ? <span className="flex items-center gap-1 text-[10px] bg-profit text-profit px-2 py-0.5 rounded-full font-semibold"><CheckCircle className="h-3 w-3" /> Regras OK</span>
                      : <span className="flex items-center gap-1 text-[10px] bg-loss text-loss px-2 py-0.5 rounded-full font-semibold"><XCircle className="h-3 w-3" /> Regras quebradas</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <ScoreBar label="Energia" value={log.energyLevel} />
                <ScoreBar label="Foco" value={log.focusLevel} />
                <ScoreBar label="Calma" value={log.stressLevel} invert />
              </div>
              {log.notes && <div className="border-t border-border/50 pt-3 mt-3"><p className="text-xs text-muted-foreground italic leading-relaxed">{log.notes}</p></div>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-lg font-black">Registo de Psicologia</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Data</Label>
                <Input type="date" value={form.logDate} onChange={e => set("logDate", e.target.value)} data-testid="input-log-date" />
              </div>
              <div className="grid gap-1.5">
                <Label>Conta</Label>
                <Select value={form.accountId || NONE} onValueChange={v => set("accountId", v === NONE ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent><SelectItem value={NONE}>Todas</SelectItem>{accounts?.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Estado Emocional</Label>
              <Select value={form.emotionState} onValueChange={v => set("emotionState", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EMOTION_STATES.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["energyLevel", "Energia (1-10)"], ["focusLevel", "Foco (1-10)"], ["stressLevel", "Stress (1-10)"]].map(([key, label]) => (
                <div key={key} className="grid gap-1.5">
                  <Label className="text-xs">{label}</Label>
                  <Input type="number" min="1" max="10" value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} placeholder="—" data-testid={`input-${key}`} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["tradedToday", "Operou?"], ["followedRules", "Seguiu regras?"]].map(([key, label]) => (
                <div key={key} className="grid gap-1.5">
                  <Label className="text-xs">{label}</Label>
                  <Select value={(form as Record<string, string>)[key] || NONE} onValueChange={v => set(key, v === NONE ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent><SelectItem value={NONE}>—</SelectItem><SelectItem value="true">Sim</SelectItem><SelectItem value="false">Não</SelectItem></SelectContent>
                  </Select>
                </div>
              ))}
              <div className="grid gap-1.5">
                <Label className="text-xs">Pontuação (1-10)</Label>
                <Input type="number" min="1" max="10" value={form.overallScore} onChange={e => set("overallScore", e.target.value)} placeholder="—" data-testid="input-overall-score" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Como se sentiu hoje? Que observações tem?" data-testid="textarea-psych-notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createLog.isPending} className="brand-bg border-0 text-white" data-testid="button-save-log">
              {createLog.isPending ? "Guardando..." : "Guardar Registo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
