import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { EmptyState, Field, FormActions, Modal, PageHeader, buttonPrimary, buttonQuiet, chipClass, confirmDelete, hoverReveal, iconButton, iconButtonDanger, inputClass } from '@/components/ui';
import type { Actions, Internship, Person } from '@/hooks/use-notebook';
import { formatDate, todayISO } from '@/lib/dates';

const teams = ['Engineering', 'Design', 'Product', 'Marketing', 'Analytics', 'Recruiting', 'Leadership', 'Other'];
const blank = (): Omit<Person, 'id'> => ({ name: '', role: '', team: 'Engineering', date: todayISO(), status: 'planned', notes: '' });

export default function People({ internship, actions }: { internship: Internship; actions: Actions }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState(blank);

  const filtered = internship.people
    .filter((person) => filter === 'All' || person.team === filter)
    .sort((a, b) => (a.status === b.status ? a.date.localeCompare(b.date) : a.status === 'planned' ? -1 : 1));
  const metCount = internship.people.filter((person) => person.status === 'met').length;

  const openNew = () => { setForm(blank()); setEditing('new'); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (editing === 'new') actions.add('people', form);
    else if (editing) actions.update('people', editing, form);
    setEditing(null);
  };

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={`${metCount} met · ${internship.people.length - metCount} planned`}
        title="Coffee chats"
        body="Track the people you meet across teams and what you want to ask them."
        action={<button type="button" className={buttonPrimary} onClick={openNew}><Plus size={17} /> Plan a chat</button>}
      />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {['All', ...teams].map((team) => <button type="button" key={team} onClick={() => setFilter(team)} className={chipClass(filter === team)}>{team}</button>)}
      </div>
      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((person) => (
            <article key={person.id} className="paper-card group rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-[hsl(var(--accent-foreground))]">{person.name.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{person.name}</h2>
                      <p className="text-sm text-muted-foreground">{person.role}</p>
                    </div>
                    <span className={`h-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${person.status === 'met' ? 'bg-[#dce8e5] text-[#3a756a]' : 'bg-secondary text-primary'}`}>{person.status === 'met' ? 'Met' : 'Planned'}</span>
                  </div>
                  <p className="mono-font mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{person.team} · {formatDate(person.date)}</p>
                </div>
              </div>
              {person.notes && <p className="mt-4 whitespace-pre-line rounded-xl bg-muted/65 p-3 text-sm leading-6 text-muted-foreground">{person.notes}</p>}
              <div className={`${hoverReveal} mt-4 justify-end`}>
                <button type="button" onClick={() => actions.update('people', person.id, { status: person.status === 'met' ? 'planned' : 'met' })} className={buttonQuiet}>{person.status === 'met' ? 'Mark planned' : 'Mark met'}</button>
                <button type="button" onClick={() => { setForm({ ...person }); setEditing(person.id); }} className={iconButton} aria-label="Edit"><Pencil size={16} /></button>
                <button type="button" onClick={() => confirmDelete('connection') && actions.remove('people', person.id)} className={iconButtonDanger} aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="No chats yet" body="Start with someone whose work makes you curious. Twenty-five minutes is enough." action={<button type="button" className={buttonPrimary} onClick={openNew}><Plus size={16} /> Add a connection</button>} />
      )}
      {editing && (
        <Modal title={editing === 'new' ? 'Plan a coffee chat' : 'Edit connection'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><input autoFocus className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Role"><input className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
              <Field label="Team"><select className={inputClass} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>{teams.map((team) => <option key={team}>{team}</option>)}</select></Field>
              <Field label="Date"><input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            </div>
            <Field label="Questions and notes"><textarea className={`${inputClass} min-h-28`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <FormActions onCancel={() => setEditing(null)} submitLabel={<>Save <Check size={16} /></>} />
          </form>
        </Modal>
      )}
    </div>
  );
}
