import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { AlertTriangle, Check, Heart, RotateCcw } from 'lucide-react';
import { Companion, Field, Modal, PageHeader, ToggleRow, buttonPrimary, buttonQuiet, inputClass } from '@/components/ui';
import type { Actions, Profile } from '@/hooks/use-notebook';

export default function Settings({ profile, actions }: { profile: Profile; actions: Actions }) {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  const save = (event: FormEvent) => {
    event.preventDefault();
    const { name, email, reminders, emailReminders, weeklyReview } = form;
    actions.updateProfile({ name: name.trim() || profile.name, email: email.trim(), reminders, emailReminders, weeklyReview });
    if (reminders && 'Notification' in window && Notification.permission === 'default') void Notification.requestPermission();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const [, navigate] = useLocation();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const startOver = () => {
    navigate('/');
    actions.reset();
  };

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Make it yours" title="Settings" body="Your profile and reminder preferences." />
      <form onSubmit={save} className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <section className="paper-card rounded-2xl p-5 sm:p-7">
          <h2 className="display-font mb-5 text-2xl font-semibold">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Role and company are saved per internship. Change them under <Link href="/internships" className="font-semibold text-primary">My internships</Link>.</p>
          <div className="mt-6 flex items-center gap-4 rounded-xl border border-border p-4">
            <Companion image={profile.companion} name={profile.companionName} size="sm" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{profile.companionName || 'Your companion'}</p>
              <p className="text-xs text-muted-foreground">Redraw or rename them any time.</p>
            </div>
            <Link href="/draw" className={buttonQuiet}>Open Draw</Link>
          </div>
        </section>
        <section className="paper-card rounded-2xl p-5 sm:p-7">
          <h2 className="display-font mb-5 text-2xl font-semibold">Reminders</h2>
          <div className="grid gap-3">
            <ToggleRow label="Browser pop-ups" detail="Show a small reminder while the notebook is open." checked={form.reminders} onChange={(checked) => setForm({ ...form, reminders: checked })} />
            <ToggleRow label="Email reminders" detail="Assignment and reflection reminders sent to your email." checked={form.emailReminders} onChange={(checked) => setForm({ ...form, emailReminders: checked })} />
            <ToggleRow label="Friday reflection" detail="A nudge to log one win and one question each week." checked={form.weeklyReview} onChange={(checked) => setForm({ ...form, weeklyReview: checked })} />
          </div>
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-secondary/65 p-4 text-sm leading-6 text-[hsl(var(--secondary-foreground))]">
            <Heart size={16} className="mt-1 shrink-0 text-primary" /> Everything is saved in this browser on this device, so it stays private.
          </p>
        </section>
        <div className="flex flex-wrap items-center justify-end gap-3 lg:col-span-2">
          <span className={`text-sm text-primary transition ${saved ? 'opacity-100' : 'opacity-0'}`} role="status">Saved</span>
          <button type="submit" className={buttonPrimary}>Save settings <Check size={16} /></button>
        </div>
      </form>

      <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-semibold">Start over</h2>
          <p className="mt-1 text-sm text-muted-foreground">Erase this notebook and go back to the welcome page.</p>
        </div>
        <button type="button" onClick={() => setConfirmingReset(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-card px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-white">
          <RotateCcw size={16} /> Start over
        </button>
      </section>

      {confirmingReset && (
        <Modal title="Start over?" onClose={() => setConfirmingReset(false)}>
          <div className="flex gap-3 rounded-xl bg-destructive/10 p-4 text-sm leading-6">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-destructive" />
            <p>This permanently deletes <span className="font-semibold">everything</span> saved on this device and cannot be undone.</p>
          </div>
          <ul className="mt-4 grid gap-1 pl-5 text-sm text-muted-foreground [list-style:disc]">
            <li>Your profile and your companion drawing</li>
            <li>All internships, with their notes, learning objectives, calendar, coffee chats, and experience log</li>
            <li>Your sketchbook</li>
          </ul>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" autoFocus onClick={() => setConfirmingReset(false)} className={buttonQuiet}>Cancel</button>
            <button type="button" onClick={startOver} className="inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              <RotateCcw size={16} /> Yes, erase and start over
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
