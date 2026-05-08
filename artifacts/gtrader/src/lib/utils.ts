import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function pnlColor(pnl: number | null | undefined): string {
  if (pnl == null) return "text-muted-foreground";
  return pnl > 0 ? "text-profit" : pnl < 0 ? "text-loss" : "text-muted-foreground";
}

export function resultLabel(result: string): string {
  const m: Record<string, string> = { win: "Ganho", loss: "Perda", breakeven: "Empate" };
  return m[result] ?? result;
}

export function resultBadgeClass(result: string): string {
  if (result === "win") return "bg-profit text-green-600 dark:text-green-400";
  if (result === "loss") return "bg-loss text-red-600 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

export function directionLabel(d: string | null | undefined): string {
  if (d === "buy") return "COMPRA";
  if (d === "sell") return "VENDA";
  return d ?? "—";
}

export const TIMEFRAMES = ["M1", "M2", "M3", "M5", "M10", "M15", "M30", "H1"];
export const HIGHER_TF = ["H1", "H4", "Diário"];
export const ENTRY_TRIGGERS = [
  "MSS", "BOS", "LiquiditySweep", "OrderBlock", "FVG",
  "SMTDivergence", "RejectionCandle", "Engulfing",
  "BreakerBlock", "MitigationBlock", "SessionManipulation", "CHOCH",
];
export const SESSIONS = ["london", "new_york", "asian", "london_open", "ny_open"];
export const SESSION_LABELS: Record<string, string> = {
  london: "Londres",
  new_york: "Nova York",
  asian: "Asiática",
  london_open: "Abertura Londres",
  ny_open: "Abertura NY",
};
export const SETUPS = [
  "LiquiditySweep", "OrderBlock", "FVG", "BOS", "MSS",
  "Breaker", "Mitigation", "CHOCH", "SMT", "IFVG",
];
export const EMOTIONS_BEFORE = ["confiante", "com_medo", "ansioso", "confiante_demais", "cansado", "vinganca", "focado"];
export const EMOTIONS_AFTER = ["calmo", "frustrado", "disciplinado", "emocional", "feliz", "impulsivo"];
export const ACCOUNT_TYPES = ["forex", "crypto", "prop_firm", "demo", "cent"];
export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  forex: "Forex", crypto: "Cripto", prop_firm: "Prop Firm", demo: "Demo", cent: "Cent",
};
export const ACCOUNT_STATUSES = ["active", "passed", "failed", "blown", "archived"];
export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: "Ativo", passed: "Aprovado", failed: "Reprovado", blown: "Queimado", archived: "Arquivado",
};
