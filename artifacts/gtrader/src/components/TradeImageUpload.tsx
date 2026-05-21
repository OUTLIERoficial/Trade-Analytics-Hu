import { useState, useRef } from "react";
import { X, Upload, Image, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TradeImageUploadProps {
  value: string[];
  onChange: (paths: string[]) => void;
  maxImages?: number;
}

interface UploadingFile {
  id: string;
  name: string;
  preview: string;
  progress: number;
  error?: string;
  objectPath?: string;
}

export function TradeImageUpload({ value, onChange, maxImages = 8 }: TradeImageUploadProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File): Promise<string | null> {
    const res = await fetch("/api/storage/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "image/png" }),
    });
    if (!res.ok) throw new Error("Falha ao obter URL de upload");
    const { uploadURL, objectPath } = await res.json();
    const putRes = await fetch(uploadURL, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "image/png" },
    });
    if (!putRes.ok) throw new Error("Falha ao fazer upload");
    return objectPath as string;
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = maxImages - value.length - uploading.filter(u => !u.error).length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (!toUpload.length) return;

    const newUploads: UploadingFile[] = toUpload.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      preview: URL.createObjectURL(f),
      progress: 0,
    }));

    setUploading(prev => [...prev, ...newUploads]);

    const newPaths: string[] = [];
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const uploadId = newUploads[i].id;
      setUploading(prev => prev.map(u => u.id === uploadId ? { ...u, progress: 30 } : u));
      try {
        const path = await uploadFile(file);
        if (path) {
          newPaths.push(path);
          setUploading(prev => prev.map(u => u.id === uploadId ? { ...u, progress: 100, objectPath: path } : u));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro";
        setUploading(prev => prev.map(u => u.id === uploadId ? { ...u, error: msg } : u));
      }
    }

    if (newPaths.length > 0) {
      onChange([...value, ...newPaths]);
    }

    setTimeout(() => {
      setUploading(prev => prev.filter(u => !u.objectPath));
    }, 800);
  }

  function removeUploaded(path: string) {
    onChange(value.filter(p => p !== path));
  }

  function removeUploading(id: string) {
    setUploading(prev => prev.filter(u => u.id !== id));
  }

  const totalCount = value.length + uploading.filter(u => !u.error).length;
  const canAddMore = totalCount < maxImages;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Uploaded images */}
        {value.map((path) => (
          <div key={path} className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted">
            <img
              src={`/api/storage${path}`}
              alt="Screenshot"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
            <button
              type="button"
              onClick={() => removeUploaded(path)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Uploading files */}
        {uploading.map((u) => (
          <div key={u.id} className={cn("relative aspect-video rounded-lg overflow-hidden border bg-muted", u.error ? "border-red-500/50" : "border-primary/30")}>
            <img src={u.preview} alt={u.name} className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              {u.error ? (
                <div className="text-center p-1">
                  <p className="text-[10px] text-red-400">{u.error}</p>
                  <button type="button" onClick={() => removeUploading(u.id)} className="text-[10px] text-muted-foreground underline mt-1">Remover</button>
                </div>
              ) : u.progress === 100 ? (
                <div className="w-5 h-5 rounded-full bg-green-500/80 flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              )}
            </div>
            {!u.error && u.progress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${u.progress}%` }} />
              </div>
            )}
          </div>
        ))}

        {/* Add button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/60 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground">Adicionar</span>
          </button>
        )}
      </div>

      {/* Drop zone when no images yet */}
      {value.length === 0 && uploading.length === 0 && (
        <div
          className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full brand-bg flex items-center justify-center">
              <Image className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Clique ou arraste imagens aqui</p>
              <p className="text-xs text-muted-foreground mt-0.5">Antes e depois, gráfico de entrada, análise HTF — até {maxImages} imagens</p>
            </div>
          </div>
        </div>
      )}

      {totalCount > 0 && (
        <p className="text-xs text-muted-foreground">{totalCount}/{maxImages} imagens adicionadas</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
