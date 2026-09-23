import { useEffect, useImperativeHandle, useRef, useState, type PointerEvent as ReactPointerEvent, type Ref } from 'react';
import { Eraser, PenLine, Redo2, Trash2, Undo2 } from 'lucide-react';

export type DrawingPadHandle = {
  /** PNG data URL of the drawing, or null if the canvas is blank. */
  getImage: () => string | null;
  clear: () => void;
};

const SIZE = 480; // internal resolution; the canvas scales to fit its container
const EXPORT_SIZE = 320; // stored size, kept small because drawings live in browser storage
const HISTORY_LIMIT = 30;

const palette = ['#294557', '#2a7ab8', '#7cc0e8', '#3a756a', '#8cc9a0', '#f2c14e', '#e9a87b', '#e4717a', '#efb1a7', '#9e9ac9', '#8b5e3c', '#ffffff'];
const sizes = [{ label: 'Fine', value: 4 }, { label: 'Medium', value: 9 }, { label: 'Bold', value: 18 }];

export function DrawingPad({ initialImage = '', ref }: { initialImage?: string; ref?: Ref<DrawingPadHandle> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState(palette[0]);
  const [size, setSize] = useState(sizes[1].value);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  const context = () => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null;

  useEffect(() => {
    const ctx = context();
    if (!ctx || !initialImage) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, SIZE, SIZE);
    img.src = initialImage;
  }, [initialImage]);

  const snapshot = () => context()?.getImageData(0, 0, SIZE, SIZE);

  const pushHistory = () => {
    const current = snapshot();
    if (!current) return;
    setUndoStack((stack) => [...stack.slice(-(HISTORY_LIMIT - 1)), current]);
    setRedoStack([]);
  };

  const restore = (from: ImageData[], setFrom: (next: ImageData[]) => void, setTo: (fn: (stack: ImageData[]) => ImageData[]) => void) => {
    const ctx = context();
    const previous = from[from.length - 1];
    const current = snapshot();
    if (!ctx || !previous || !current) return;
    setTo((stack) => [...stack, current]);
    setFrom(from.slice(0, -1));
    ctx.putImageData(previous, 0, 0);
  };
  const undo = () => restore(undoStack, setUndoStack, setRedoStack);
  const redo = () => restore(redoStack, setRedoStack, setUndoStack);

  const clear = () => {
    const ctx = context();
    if (!ctx) return;
    pushHistory();
    ctx.clearRect(0, 0, SIZE, SIZE);
  };

  useImperativeHandle(ref, () => ({
    clear,
    getImage: () => {
      const canvas = canvasRef.current;
      const pixels = snapshot()?.data;
      if (!canvas || !pixels) return null;
      let blank = true;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) { blank = false; break; }
      if (blank) return null;
      const out = document.createElement('canvas');
      out.width = EXPORT_SIZE;
      out.height = EXPORT_SIZE;
      out.getContext('2d')?.drawImage(canvas, 0, 0, EXPORT_SIZE, EXPORT_SIZE);
      return out.toDataURL('image/png');
    },
  }));

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * SIZE, y: ((event.clientY - rect.top) / rect.height) * SIZE };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }, pressure: number) => {
    const ctx = context();
    if (!ctx) return;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    // Stylus pressure varies the line a little; mouse and touch report 0.5.
    ctx.lineWidth = (tool === 'eraser' ? size * 2 : size) * (0.6 + pressure * 0.8);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pushHistory();
    drawing.current = true;
    const p = point(event);
    last.current = p;
    stroke(p, { x: p.x + 0.01, y: p.y }, event.pressure || 0.5); // a tap leaves a dot
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const p = point(event);
    stroke(last.current, p, event.pressure || 0.5);
    last.current = p;
  };
  const stop = () => {
    drawing.current = false;
    last.current = null;
  };

  const toolButton = (active: boolean) => `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-border bg-card p-1">
          <button type="button" className={toolButton(tool === 'pen')} onClick={() => setTool('pen')} aria-pressed={tool === 'pen'}><PenLine size={16} /> Pen</button>
          <button type="button" className={toolButton(tool === 'eraser')} onClick={() => setTool('eraser')} aria-pressed={tool === 'eraser'}><Eraser size={16} /> Eraser</button>
        </div>
        <div className="flex rounded-xl border border-border bg-card p-1" role="group" aria-label="Brush size">
          {sizes.map((item) => (
            <button key={item.value} type="button" onClick={() => setSize(item.value)} className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${size === item.value ? 'bg-secondary' : 'hover:bg-secondary/60'}`} aria-label={`${item.label} brush`} aria-pressed={size === item.value}>
              <span className="rounded-full bg-foreground" style={{ width: item.value / 1.5 + 2, height: item.value / 1.5 + 2 }} />
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          <button type="button" onClick={undo} disabled={!undoStack.length} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-35" aria-label="Undo"><Undo2 size={18} /></button>
          <button type="button" onClick={redo} disabled={!redoStack.length} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-35" aria-label="Redo"><Redo2 size={18} /></button>
          <button type="button" onClick={clear} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Clear drawing"><Trash2 size={18} /></button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Colors">
        {palette.map((swatch) => (
          <button key={swatch} type="button" onClick={() => { setColor(swatch); setTool('pen'); }} className={`h-8 w-8 rounded-full border-2 transition hover:scale-110 ${color === swatch && tool === 'pen' ? 'border-foreground ring-2 ring-primary/30' : 'border-border'}`} style={{ background: swatch }} aria-label={`Color ${swatch}`} aria-pressed={color === swatch} />
        ))}
        <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 border-border bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] transition hover:scale-110" title="Pick any color">
          <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool('pen'); }} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Custom color" />
        </label>
      </div>

      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        className={`aspect-square w-full max-w-[480px] touch-none rounded-2xl border border-border bg-white paper-grid ${tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
        aria-label="Drawing canvas"
      />
    </div>
  );
}
