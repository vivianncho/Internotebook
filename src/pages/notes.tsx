import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { EmptyState, Field, FormActions, Modal, PageHeader, buttonPrimary, chipClass, confirmDelete, hoverReveal, iconButton, iconButtonDanger, inputClass, splitTags } from '@/components/ui';
import type { Actions, Internship } from '@/hooks/use-notebook';
import { formatDate, todayISO } from '@/lib/dates';

const categories = ['Learning', 'Reflection', 'Feedback', 'Project'];
const blank = () => ({ title: '', body: '', category: 'Learning', tags: '', date: todayISO() });

export default function Notes({ internship, actions }: { internship: Internship; actions: Actions }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blank);

  const filtered = internship.notes.filter((note) =>
    (category === 'All' || note.category === category) &&
    `${note.title} ${note.body} ${note.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));

  const openNew = () => { setForm(blank()); setEditing('new'); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    const payload = { ...form, tags: splitTags(form.tags) };
    if (editing === 'new') actions.add('notes', payload);
    else if (editing) actions.update('notes', editing, payload);
    setEditing(null);
  };

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Field notes" title="Notes" body="What you learned, what you want to ask, and feedback worth keeping." action={<button type="button" className={buttonPrimary} onClick={openNew}><Plus size={17} /> New note</button>} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-muted-foreground" size={17} />
          <input className={`${inputClass} pl-10`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes" aria-label="Search notes" />
        </label>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {['All', ...categories].map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={chipClass(category === item)}>{item}</button>)}
        </div>
      </div>
      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((note) => (
            <article key={note.id} className="paper-card group rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-primary">{note.category}</span>
                <div className={hoverReveal}>
                  <button type="button" onClick={() => { setForm({ ...note, tags: note.tags.join(', ') }); setEditing(note.id); }} className={iconButton} aria-label="Edit note"><Pencil size={15} /></button>
                  <button type="button" onClick={() => confirmDelete('note') && actions.remove('notes', note.id)} className={iconButtonDanger} aria-label="Delete note"><Trash2 size={15} /></button>
                </div>
              </div>
              <h2 className="display-font mt-4 text-2xl font-semibold leading-tight">{note.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{note.body}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <span className="mono-font text-[10px] uppercase tracking-[.12em] text-muted-foreground">{formatDate(note.date)}</span>
                {note.tags.map((tag) => <span key={tag} className="rounded-md bg-accent/55 px-2 py-1 text-[11px] font-semibold text-[hsl(var(--accent-foreground))]">#{tag}</span>)}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Search} title={query || category !== 'All' ? 'No matching notes' : 'No notes yet'} body={query ? 'Try a different word or clear your search.' : 'Start with something you learned this week.'} action={<button type="button" className={buttonPrimary} onClick={openNew}><Plus size={16} /> Write a note</button>} />
      )}
      {editing && (
        <Modal title={editing === 'new' ? 'New note' : 'Edit note'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4">
            <Field label="Title"><input autoFocus className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Note"><textarea className={`${inputClass} min-h-36 resize-y`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Category">
                <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
              </Field>
              <Field label="Date"><input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Tags" hint="Separate with commas"><input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
            </div>
            <FormActions onCancel={() => setEditing(null)} submitLabel={<>Save note <Check size={16} /></>} />
          </form>
        </Modal>
      )}
    </div>
  );
}
