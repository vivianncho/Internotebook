import { useState, type FormEvent } from 'react';
import { BookOpen, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { EmptyState, Field, FormActions, Modal, PageHeader, buttonPrimary, chipClass, confirmDelete, hoverReveal, iconButton, iconButtonDanger, inputClass, splitTags } from '@/components/ui';
import type { Actions, Internship } from '@/hooks/use-notebook';
import { formatDate, todayISO } from '@/lib/dates';

const types = ['Win', 'Metric', 'Presentation', 'Challenge', 'Reflection', 'Compliment', 'LinkedIn idea'];
const blank = () => ({ date: todayISO(), type: 'Win', title: '', body: '', tags: '' });

export default function Journal({ internship, actions }: { internship: Internship; actions: Actions }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState(blank);

  const filtered = internship.journal
    .filter((entry) => filter === 'All' || entry.type === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const openNew = () => { setForm(blank()); setEditing('new'); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    const payload = { ...form, tags: splitTags(form.tags) };
    if (editing === 'new') actions.add('journal', payload);
    else if (editing) actions.update('journal', editing, payload);
    setEditing(null);
  };

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Evidence of growth" title="Experience log" body="Wins, metrics, presentations, and hard days. Handy for your final reflection, resume, and LinkedIn." action={<button type="button" className={buttonPrimary} onClick={openNew}><Plus size={17} /> Log an entry</button>} />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {['All', ...types].map((type) => <button type="button" key={type} onClick={() => setFilter(type)} className={chipClass(filter === type)}>{type}</button>)}
      </div>
      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((entry) => (
            <article key={entry.id} className="paper-card group rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${entry.type === 'Win' ? 'bg-accent text-[hsl(var(--accent-foreground))]' : 'bg-secondary text-primary'}`}>{entry.type}</span>
                  <span className="mono-font text-[10px] uppercase tracking-wider text-muted-foreground">{formatDate(entry.date)}</span>
                </div>
                <div className={hoverReveal}>
                  <button type="button" onClick={() => { setForm({ ...entry, tags: entry.tags.join(', ') }); setEditing(entry.id); }} className={iconButton} aria-label="Edit entry"><Pencil size={15} /></button>
                  <button type="button" onClick={() => confirmDelete('entry') && actions.remove('journal', entry.id)} className={iconButtonDanger} aria-label="Delete entry"><Trash2 size={15} /></button>
                </div>
              </div>
              <h2 className="display-font mt-4 text-2xl font-semibold">{entry.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{entry.body}</p>
              {entry.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{entry.tags.map((tag) => <span key={tag} className="mono-font text-[10px] uppercase tracking-wider text-muted-foreground">#{tag}</span>)}</div>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="Nothing logged yet" body="One sentence is enough. What would you want to remember six months from now?" action={<button type="button" className={buttonPrimary} onClick={openNew}><Plus size={16} /> Start writing</button>} />
      )}
      {editing && (
        <Modal title={editing === 'new' ? 'Log an entry' : 'Edit entry'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{types.map((type) => <option key={type}>{type}</option>)}</select></Field>
              <Field label="Date"><input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            </div>
            <Field label="Title"><input autoFocus className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="What happened?"><textarea className={`${inputClass} min-h-36 resize-y`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
            <Field label="Tags" hint="Separate with commas"><input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
            <FormActions onCancel={() => setEditing(null)} submitLabel={<>Save entry <Check size={16} /></>} />
          </form>
        </Modal>
      )}
    </div>
  );
}
