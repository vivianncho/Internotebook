import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { Briefcase, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { Field, FormActions, Modal, PageHeader, buttonPrimary, buttonQuiet, hoverReveal, iconButton, iconButtonDanger, inputClass } from '@/components/ui';
import { emptyDetails, type Actions, type Internship, type InternshipDetails } from '@/hooks/use-notebook';
import { formatRange, internshipStatus } from '@/lib/dates';

const statusTone = { Current: 'bg-[#dce8e5] text-[#3a756a]', Upcoming: 'bg-secondary text-primary', Past: 'bg-muted text-muted-foreground' };

export default function Internships({ internships, activeId, actions }: { internships: Internship[]; activeId: string | null; actions: Actions }) {
  const [, navigate] = useLocation();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<InternshipDetails>(emptyDetails);

  const sorted = [...internships].sort((a, b) => (b.startDate || b.createdAt).localeCompare(a.startDate || a.createdAt));

  const open = (internship?: Internship) => {
    setForm(internship ? pickDetails(internship) : emptyDetails);
    setEditing(internship?.id ?? 'new');
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    if (editing === 'new') actions.addInternship(form);
    else if (editing) actions.updateInternship(editing, form);
    setEditing(null);
  };
  const openNotebook = (id: string) => {
    actions.setActive(id);
    navigate('/');
  };
  const remove = (internship: Internship) => {
    if (internships.length === 1) {
      window.alert('You need at least one internship. Add another one before deleting this one.');
      return;
    }
    if (window.confirm(`Delete ${internship.company} and everything saved in it (notes, objectives, chats, and log)? This cannot be undone.`)) actions.deleteInternship(internship.id);
  };

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Your experience"
        title="My internships"
        body="Every internship keeps its own notes, objectives, calendar, coffee chats, and experience log. Open one to pick up where you left off."
        action={<button type="button" className={buttonPrimary} onClick={() => open()}><Plus size={17} /> Add internship</button>}
      />
      <div className="grid gap-5 md:grid-cols-2">
        {sorted.map((internship) => {
          const status = internshipStatus(internship.startDate, internship.endDate);
          const isActive = internship.id === activeId;
          const counts = [
            [internship.objectives.length, 'objectives'],
            [internship.notes.length, 'notes'],
            [internship.people.length, 'chats'],
            [internship.journal.length, 'log entries'],
          ] as const;
          return (
            <article key={internship.id} className={`paper-card group flex flex-col rounded-2xl p-5 sm:p-6 ${isActive ? 'ring-2 ring-primary/40' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone[status]}`}>{status}</span>
                  {isActive && <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white">Open now</span>}
                </div>
                <div className={hoverReveal}>
                  <button type="button" onClick={() => open(internship)} className={iconButton} aria-label="Edit internship details"><Pencil size={15} /></button>
                  <button type="button" onClick={() => remove(internship)} className={iconButtonDanger} aria-label="Delete internship"><Trash2 size={15} /></button>
                </div>
              </div>
              <h2 className="display-font mt-4 text-2xl font-semibold">{internship.company}</h2>
              <p className="text-sm font-semibold">{internship.role}</p>
              <p className="mono-font mt-1 text-xs text-muted-foreground">{formatRange(internship.startDate, internship.endDate)}{internship.location && ` · ${internship.location}`}</p>
              {internship.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{internship.description}</p>}
              {(internship.supervisor || internship.facultyAdvisor) && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {internship.supervisor && <>Supervisor: <span className="font-semibold text-foreground">{internship.supervisor}</span></>}
                  {internship.supervisor && internship.facultyAdvisor && ' · '}
                  {internship.facultyAdvisor && <>Faculty advisor: <span className="font-semibold text-foreground">{internship.facultyAdvisor}</span></>}
                </p>
              )}
              <div className="mt-4 flex flex-1 flex-wrap content-end gap-x-4 gap-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
                {counts.map(([count, label]) => <span key={label}><span className="font-semibold text-foreground">{count}</span> {label}</span>)}
              </div>
              <button type="button" onClick={() => openNotebook(internship.id)} className={`${isActive ? buttonQuiet : buttonPrimary} mt-4`}>
                <Briefcase size={15} /> {isActive ? 'Go to this notebook' : 'Open this notebook'}
              </button>
            </article>
          );
        })}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Add an internship' : 'Edit internship'} onClose={() => setEditing(null)} width="max-w-xl">
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company"><input autoFocus required className={inputClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
              <Field label="Role"><input required className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
              <Field label="Start date"><input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
              <Field label="End date" hint="Leave blank if ongoing"><input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
              <Field label="Location"><input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City or Remote" /></Field>
              <Field label="Supervisor"><input className={inputClass} value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} /></Field>
              <Field label="Faculty advisor"><input className={inputClass} value={form.facultyAdvisor} onChange={(e) => setForm({ ...form, facultyAdvisor: e.target.value })} /></Field>
            </div>
            <Field label="Job description" hint="Your learning objectives are based on this">
              <textarea className={`${inputClass} min-h-28 resize-y`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <FormActions onCancel={() => setEditing(null)} submitLabel={<>{editing === 'new' ? 'Add internship' : 'Save changes'} <Check size={16} /></>} />
          </form>
        </Modal>
      )}
    </div>
  );
}

function pickDetails(internship: Internship): InternshipDetails {
  const { company, role, location, startDate, endDate, supervisor, facultyAdvisor, description } = internship;
  return { company, role, location, startDate, endDate, supervisor, facultyAdvisor, description };
}
