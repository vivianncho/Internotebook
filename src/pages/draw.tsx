import { useRef, useState } from 'react';
import { Check, Download, ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { DrawingPad, type DrawingPadHandle } from '@/components/drawing-pad';
import { Companion, EmptyState, Field, Modal, PageHeader, SpeechBubble, buttonPrimary, buttonQuiet, confirmDelete, iconButtonDanger, inputClass } from '@/components/ui';
import type { Actions, Doodle, Profile } from '@/hooks/use-notebook';
import { formatDate } from '@/lib/dates';

const breakPrompts = [
  'Draw what your desk looks like right now.',
  'Draw your companion on vacation.',
  'Draw the best thing you ate this week.',
  'Draw how today felt, using only colors and shapes.',
  'Draw a tiny plant for your workspace.',
  'Draw your dream office.',
  'Draw your companion celebrating a win.',
];

export default function Draw({ profile, doodles, actions }: { profile: Profile; doodles: Doodle[]; actions: Actions }) {
  const [editingCompanion, setEditingCompanion] = useState(false);
  const [startBlank, setStartBlank] = useState(false);
  const [companionName, setCompanionName] = useState(profile.companionName);
  const [savedDoodle, setSavedDoodle] = useState(false);
  const companionPad = useRef<DrawingPadHandle>(null);
  const sketchPad = useRef<DrawingPadHandle>(null);
  const [prompt, setPrompt] = useState(() => breakPrompts[new Date().getDate() % breakPrompts.length]);

  const openCompanionEditor = (blank: boolean) => {
    setStartBlank(blank);
    setCompanionName(profile.companionName);
    setEditingCompanion(true);
  };

  const saveCompanion = () => {
    const image = companionPad.current?.getImage();
    actions.updateProfile({ companion: image ?? '', companionName: companionName.trim() });
    setEditingCompanion(false);
  };

  const saveDoodle = () => {
    const image = sketchPad.current?.getImage();
    if (!image) return;
    actions.addDoodle(image);
    sketchPad.current?.clear();
    setSavedDoodle(true);
    window.setTimeout(() => setSavedDoodle(false), 2000);
  };

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Creative break" title="Draw" body="Step away from the work for a few minutes. Doodle something, or redraw your companion." />

      <section className="paper-card mb-6 flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-7">
        <Companion image={profile.companion} name={profile.companionName} bob />
        <div className="flex-1">
          <SpeechBubble>
            <p className="display-font text-xl font-semibold">{profile.companionName ? `I’m ${profile.companionName}!` : 'Hi, it’s me, your companion!'}</p>
            <p className="mt-1 text-sm text-muted-foreground">Want to give me a new look? Change as much or as little as you like.</p>
          </SpeechBubble>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => openCompanionEditor(false)} className={buttonPrimary}><Pencil size={15} /> Edit my drawing</button>
            <button type="button" onClick={() => openCompanionEditor(true)} className={buttonQuiet}>Start over</button>
            {profile.companion && <button type="button" onClick={() => window.confirm('Switch back to the bunny? Your drawing will be removed.') && actions.updateProfile({ companion: '' })} className={buttonQuiet}>Use the bunny</button>}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <section className="paper-card rounded-2xl p-5 sm:p-7">
          <div className="mb-4">
            <p className="eyebrow">Sketchbook</p>
            <h2 className="display-font mt-1 text-2xl font-semibold">Free drawing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Need an idea? <span className="font-semibold text-foreground">{prompt}</span>{' '}
              <button type="button" onClick={() => setPrompt(breakPrompts[(breakPrompts.indexOf(prompt) + 1) % breakPrompts.length])} className="font-semibold text-primary">Another idea</button>
            </p>
          </div>
          <DrawingPad ref={sketchPad} />
          <div className="mt-4 flex items-center justify-end gap-3">
            <span className={`text-sm text-primary transition ${savedDoodle ? 'opacity-100' : 'opacity-0'}`}>Saved to your sketchbook</span>
            <button type="button" onClick={saveDoodle} className={buttonPrimary}><ImagePlus size={16} /> Save to sketchbook</button>
          </div>
        </section>

        <section>
          <h2 className="display-font mb-4 text-2xl font-semibold">Saved sketches</h2>
          {doodles.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {doodles.map((doodle) => (
                <figure key={doodle.id} className="paper-card group overflow-hidden rounded-2xl">
                  <img src={doodle.image} alt={`Sketch from ${formatDate(doodle.date)}`} className="aspect-square w-full bg-white object-contain" />
                  <figcaption className="flex items-center justify-between border-t border-border px-3 py-2">
                    <span className="mono-font text-[10px] uppercase tracking-wider text-muted-foreground">{formatDate(doodle.date, { month: 'short', day: 'numeric' })}</span>
                    <span className="flex gap-0.5">
                      <a href={doodle.image} download={`sketch-${doodle.date}.png`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Download sketch"><Download size={14} /></a>
                      <button type="button" onClick={() => confirmDelete('sketch') && actions.removeDoodle(doodle.id)} className={iconButtonDanger} aria-label="Delete sketch"><Trash2 size={14} /></button>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <EmptyState icon={ImagePlus} title="No sketches yet" body="Your saved doodles will show up here." />
          )}
        </section>
      </div>

      {editingCompanion && (
        <Modal title={startBlank ? 'Draw a new companion' : 'Edit your companion'} onClose={() => setEditingCompanion(false)} width="max-w-xl">
          <div className="grid gap-4">
            <DrawingPad ref={companionPad} initialImage={startBlank ? '' : profile.companion} />
            <Field label="Name" hint="Optional">
              <input className={inputClass} value={companionName} onChange={(e) => setCompanionName(e.target.value)} placeholder="e.g. Mochi" />
            </Field>
            <p className="text-xs text-muted-foreground">Saving a blank canvas switches back to the bunny.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingCompanion(false)} className={buttonQuiet}>Cancel</button>
              <button type="button" onClick={saveCompanion} className={buttonPrimary}>Save companion <Check size={16} /></button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
