import { useRef, useState, useEffect, useCallback } from "react";
import { X, Pen, Square, ArrowUpRight, Type, Trash2, Undo2, Check, Loader2, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Tool = "pen" | "arrow" | "rect" | "line" | "text";
type Color = string;

interface Point { x: number; y: number }

interface DrawOp {
  tool: Tool;
  color: Color;
  lineWidth: number;
  points: Point[];
  text?: string;
}

interface Props {
  imageSrc: string;
  onClose: () => void;
  onSave: (objectPath: string) => void;
}

const COLORS: { value: string; label: string }[] = [
  { value: "#ffffff", label: "Branco" },
  { value: "#fbbf24", label: "Amarelo" },
  { value: "#22c55e", label: "Verde" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#818cf8", label: "Violeta" },
  { value: "#38bdf8", label: "Azul" },
];

const TOOLS: { id: Tool; Icon: React.ElementType; label: string }[] = [
  { id: "pen", Icon: Pen, label: "Lápis" },
  { id: "line", Icon: Minus, label: "Linha" },
  { id: "arrow", Icon: ArrowUpRight, label: "Seta" },
  { id: "rect", Icon: Square, label: "Retângulo" },
  { id: "text", Icon: Type, label: "Texto" },
];

function drawArrow(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
  const headLen = 14;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function redrawAll(ctx: CanvasRenderingContext2D, ops: DrawOp[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const op of ops) {
    ctx.strokeStyle = op.color;
    ctx.fillStyle = op.color;
    ctx.lineWidth = op.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (op.tool === "pen" && op.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(op.points[0].x, op.points[0].y);
      for (let i = 1; i < op.points.length; i++) ctx.lineTo(op.points[i].x, op.points[i].y);
      ctx.stroke();
    } else if (op.tool === "line" && op.points.length >= 2) {
      const [a, b] = [op.points[0], op.points[op.points.length - 1]];
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    } else if (op.tool === "arrow" && op.points.length >= 2) {
      const [a, b] = [op.points[0], op.points[op.points.length - 1]];
      drawArrow(ctx, a, b);
    } else if (op.tool === "rect" && op.points.length >= 2) {
      const [a, b] = [op.points[0], op.points[op.points.length - 1]];
      ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
    } else if (op.tool === "text" && op.text && op.points.length > 0) {
      ctx.font = `bold ${op.lineWidth * 8 + 12}px Inter, system-ui, sans-serif`;
      ctx.fillText(op.text, op.points[0].x, op.points[0].y);
    }
  }
}

export function TradeAnnotator({ imageSrc, onClose, onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [ops, setOps] = useState<DrawOp[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>("pen");
  const [activeColor, setActiveColor] = useState("#fbbf24");
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentOp, setCurrentOp] = useState<DrawOp | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const redraw = useCallback((extraOp?: DrawOp) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    redrawAll(ctx, extraOp ? [...ops, extraOp] : ops);
  }, [ops]);

  useEffect(() => { redraw(); }, [redraw]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === "text") {
      const pos = getPos(e);
      setTextInput(pos);
      setTextValue("");
      return;
    }
    const pos = getPos(e);
    const op: DrawOp = { tool: activeTool, color: activeColor, lineWidth, points: [pos] };
    setCurrentOp(op);
    setIsDrawing(true);
  }, [activeTool, activeColor, lineWidth, getPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentOp) return;
    const pos = getPos(e);
    const updated: DrawOp = { ...currentOp, points: activeTool === "pen" ? [...currentOp.points, pos] : [currentOp.points[0], pos] };
    setCurrentOp(updated);
    redraw(updated);
  }, [isDrawing, currentOp, activeTool, getPos, redraw]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentOp) return;
    setOps(prev => [...prev, currentOp]);
    setCurrentOp(null);
    setIsDrawing(false);
  }, [isDrawing, currentOp]);

  const confirmText = useCallback(() => {
    if (!textInput || !textValue.trim()) { setTextInput(null); return; }
    const op: DrawOp = { tool: "text", color: activeColor, lineWidth, points: [textInput], text: textValue.trim() };
    setOps(prev => [...prev, op]);
    setTextInput(null);
    setTextValue("");
  }, [textInput, textValue, activeColor, lineWidth]);

  const undo = () => setOps(prev => prev.slice(0, -1));
  const clear = () => setOps([]);

  const handleSave = async () => {
    if (!canvasRef.current || !imageRef.current) return;
    setIsSaving(true);
    try {
      const img = imageRef.current;
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const offCtx = off.getContext("2d")!;
      offCtx.drawImage(img, 0, 0);

      const annotCanvas = canvasRef.current;
      const scaleX = img.naturalWidth / annotCanvas.width;
      const scaleY = img.naturalHeight / annotCanvas.height;
      offCtx.save();
      offCtx.scale(scaleX, scaleY);
      redrawAll(offCtx, ops);
      offCtx.restore();

      const blob = await new Promise<Blob>((res, rej) => off.toBlob(b => b ? res(b) : rej(new Error("failed")), "image/png"));
      const file = new File([blob], "annotated.png", { type: "image/png" });

      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      const { uploadURL, objectPath } = await urlRes.json() as { uploadURL: string; objectPath: string };
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      onSave(objectPath);
    } catch {
      alert("Erro ao guardar anotação");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0b14]">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 flex-shrink-0 flex-wrap">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {TOOLS.map(({ id, Icon, label }) => (
            <button
              key={id}
              title={label}
              onClick={() => { setActiveTool(id); setTextInput(null); }}
              className={cn("p-1.5 rounded-md transition-colors", activeTool === id ? "brand-bg text-white" : "text-white/50 hover:text-white hover:bg-white/10")}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1.5">
          {COLORS.map(({ value, label }) => (
            <button
              key={value}
              title={label}
              onClick={() => setActiveColor(value)}
              className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110", activeColor === value ? "border-white scale-110" : "border-transparent")}
              style={{ background: value }}
            />
          ))}
        </div>

        {/* Line width */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1.5">
          {[1, 2, 4].map(w => (
            <button key={w} onClick={() => setLineWidth(w)} className={cn("flex items-center justify-center rounded transition-colors w-7 h-7", lineWidth === w ? "brand-bg" : "hover:bg-white/10")}>
              <div className="rounded-full bg-white" style={{ width: w * 3 + 2, height: w * 3 + 2 }} />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <button onClick={undo} disabled={ops.length === 0} title="Desfazer" className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors">
          <Undo2 className="h-4 w-4" />
        </button>
        <button onClick={clear} disabled={ops.length === 0} title="Limpar tudo" className="p-1.5 rounded-md text-white/50 hover:text-red-400 hover:bg-white/10 disabled:opacity-30 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || ops.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg brand-bg text-white text-xs font-bold disabled:opacity-50 transition-all hover:opacity-90"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {isSaving ? "A guardar..." : "Guardar"}
        </button>
        <button onClick={onClose} className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Hint bar */}
      <div className="px-3 py-1 text-[11px] text-white/30 border-b border-white/5 flex-shrink-0">
        {activeTool === "pen" && "Desenhe livremente no gráfico"}
        {activeTool === "line" && "Clique e arraste para traçar uma linha"}
        {activeTool === "arrow" && "Clique e arraste para marcar uma seta direcional"}
        {activeTool === "rect" && "Clique e arraste para delimitar uma zona"}
        {activeTool === "text" && "Clique no gráfico para inserir texto"}
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 overflow-hidden flex items-center justify-center bg-[#0a0b14] relative select-none">
        <div className="relative max-w-full max-h-full">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Gráfico"
            crossOrigin="anonymous"
            className="block max-w-full max-h-[calc(100vh-90px)] object-contain"
            onLoad={(e) => {
              const img = e.currentTarget;
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
              }
              setImageLoaded(true);
            }}
          />
          {imageLoaded && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ cursor: activeTool === "text" ? "text" : "crosshair" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            />
          )}

          {/* Inline text input */}
          {textInput && (
            <input
              autoFocus
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") confirmText(); if (e.key === "Escape") setTextInput(null); }}
              onBlur={confirmText}
              className="absolute bg-transparent border-b-2 border-yellow-400 outline-none text-yellow-300 font-bold text-base"
              style={{
                left: `${(textInput.x / (canvasRef.current?.width ?? 1)) * 100}%`,
                top: `${(textInput.y / (canvasRef.current?.height ?? 1)) * 100}%`,
                minWidth: 80,
                fontSize: lineWidth * 8 + 12,
                color: activeColor,
                borderColor: activeColor,
                transform: "translateY(-100%)",
              }}
              placeholder="Texto..."
            />
          )}
        </div>
      </div>

      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
