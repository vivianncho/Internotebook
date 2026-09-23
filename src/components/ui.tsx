import type { ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';

export const inputClass = 'w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';
export const buttonPrimary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50';
export const buttonQuiet = 'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/80 px-3.5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary';
export const iconButton = 'rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground';
export const iconButtonDanger = 'rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive';
/** Card actions: always visible on touch screens, revealed on hover with a mouse. */
export const hoverReveal = 'flex gap-1 transition lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100';

export function chipClass(active: boolean) {
  return `whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${active ? 'bg-primary text-white' : 'bg-card/75 text-muted-foreground hover:bg-secondary'}`;
}

export function Bunny({ small = false }: { small?: boolean }) {
  return (
    <div className={`bunny-wrap ${small ? 'bunny-small' : ''}`}>
      <svg viewBox="0 0 160 150" role="img" aria-label="Bunny companion">
        <path d="M45 56C31 32 29 6 42 8c12 2 19 22 23 38 4-19 12-39 23-37 15 2 7 34 0 50" className="bunny-ear" />
        <path d="M42 64c0-26 17-42 39-42s39 16 39 42v30c0 24-17 39-39 39S42 118 42 94V64Z" className="bunny-body" />
        <path d="M48 90c-12 6-22 4-27-4 10-6 22-6 31-1M114 90c13 6 22 4 27-4-10-6-22-6-31-1" className="bunny-body" />
        <circle cx="66" cy="72" r="4.5" className="bunny-ink" /><circle cx="96" cy="72" r="4.5" className="bunny-ink" />
        <path d="M77 83c3 3 7 3 10 0M78 86c0 5-4 8-8 8M87 86c0 5 4 8 8 8" className="bunny-face" />
        <path d="M76 112c7 5 14 5 21 0" className="bunny-ink bunny-smile" />
        <circle cx="56" cy="87" r="3" className="bunny-blush" /><circle cx="106" cy="87" r="3" className="bunny-blush" />
        <path d="M116 127c12 1 19 5 22 11-11 3-24-1-29-7" className="bunny-body" />
      </svg>
    </div>
  );
}

/** The user's hand-drawn companion, or the default bunny if they have not drawn one. */
export function Companion({ image, name, size = 'lg', bob = false }: { image: string; name?: string; size?: 'sm' | 'lg'; bob?: boolean }) {
  const box = size === 'sm' ? 'h-[62px] w-[66px]' : 'h-36 w-36 sm:h-40 sm:w-40';
  return (
    <div className={`${box} shrink-0 ${bob ? 'animate-bob' : ''}`}>
      {image
        ? <img src={image} alt={name ? `${name}, your companion` : 'Your companion'} className="h-full w-full object-contain" draggable={false} />
        : <div className="flex h-full w-full items-end justify-center [&_.bunny-wrap]:h-full [&_.bunny-wrap]:w-full"><Bunny small={size === 'sm'} /></div>}
    </div>
  );
}

export function SpeechBubble({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card px-5 py-4 shadow-[var(--shadow-card)]">
      {children}
      {/* Tail pointing at the companion: left on wide screens, down on phones. */}
      <span className="absolute -left-2 top-8 hidden h-4 w-4 rotate-45 border-b border-l border-border bg-card sm:block" />
      <span className="absolute -bottom-2 left-12 h-4 w-4 rotate-45 border-b border-r border-border bg-card sm:hidden" />
    </div>
  );
}

export function Modal({ title, onClose, children, width = 'max-w-lg' }: { title: string; onClose: () => void; children: ReactNode; width?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(211_31%_20%/.35)] p-4 backdrop-blur-sm animate-fade" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`paper-card ${width} max-h-[90dvh] w-full overflow-y-auto rounded-2xl p-5 sm:p-6 animate-rise`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="display-font text-2xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className={iconButton} aria-label="Close dialog"><X size={19} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      <span>{label}</span>
      {children}
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function FormActions({ onCancel, submitLabel, cancelLabel = 'Cancel', left }: { onCancel: () => void; submitLabel: ReactNode; cancelLabel?: string; left?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      {left ?? <span />}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className={buttonQuiet}>{cancelLabel}</button>
        <button type="submit" className={buttonPrimary}>{submitLabel}</button>
      </div>
    </div>
  );
}

export function EmptyState({ icon: IconComponent, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/55 p-8 text-center">
      <span className="mb-3 rounded-2xl bg-secondary p-3 text-primary"><IconComponent size={23} /></span>
      <h3 className="display-font text-xl font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function PageHeader({ eyebrow, title, body, action }: { eyebrow: string; title: string; body: string; action?: ReactNode }) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow mb-2 !text-primary">{eyebrow}</p>
        <h1 className="display-font text-4xl font-semibold tracking-[-.025em] sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{body}</p>
      </div>
      {action}
    </header>
  );
}

export function ToggleRow({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3.5">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-primary' : 'bg-border'}`}>
        <span className={`absolute left-0 top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export const splitTags = (value: string) => value.split(',').map((tag) => tag.trim()).filter(Boolean);

export const confirmDelete = (what: string) => window.confirm(`Delete this ${what}? This cannot be undone.`);
