import { useState, type FormEvent } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, Coffee, ListChecks, Plus } from 'lucide-react';
import { EmptyState, Field, FormActions, Modal, PageHeader, buttonPrimary, buttonQuiet, confirmDelete, inputClass } from '@/components/ui';
import type { Actions, CalendarEvent, Internship } from '@/hooks/use-notebook';
import { addDays, formatDate, formatTime, startOfWeek, toISO, todayISO } from '@/lib/dates';

const tones: Record<CalendarEvent['type'], string> = { assignment: 'bg-[#dce8e5]', coffee: 'bg-accent/70', reminder: 'bg-secondary' };
const icons = { assignment: ListChecks, coffee: Coffee, reminder: CircleHelp };
const blank = (date = todayISO()): Omit<CalendarEvent, 'id'> => ({ title: '', date, time: '09:00', type: 'assignment', detail: '' });

export default function Calendar({ internship, actions }: { internship: Internship; actions: Actions }) {
  const [view, setView] = useState<'week' | 'list'>('week');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(() => blank());
  const today = todayISO();

  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const sorted = [...internship.events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = sorted.filter((event) => event.date >= today);
  const past = sorted.filter((event) => event.date < today).reverse();

  const openNew = (date?: string) => { setForm(blank(date)); setEditing('new'); };
  const openEdit = (event: CalendarEvent) => { setForm({ ...event }); setEditing(event.id); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    if (editing === 'new') actions.add('events', form);
    else if (editing) actions.update('events', editing, form);
    setEditing(null);
  };

  const viewButton = (active: boolean) => `rounded-lg px-3 py-1.5 text-sm font-semibold ${active ? 'bg-primary text-white' : 'text-muted-foreground'}`;

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Plan ahead" title="Calendar" body="Deadlines, reminders, and coffee chats in one place." action={<button type="button" className={buttonPrimary} onClick={() => openNew()}><Plus size={17} /> Add event</button>} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-border bg-card/70 p-1">
          <button type="button" onClick={() => setView('week')} className={viewButton(view === 'week')}>Week</button>
          <button type="button" onClick={() => setView('list')} className={viewButton(view === 'list')}>List</button>
        </div>
        {view === 'week' && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setWeekStart(addDays(weekStart, -7))} className="rounded-lg p-2 hover:bg-secondary" aria-label="Previous week"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => setWeekStart(startOfWeek(new Date()))} className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-secondary">Today</button>
            <button type="button" onClick={() => setWeekStart(addDays(weekStart, 7))} className="rounded-lg p-2 hover:bg-secondary" aria-label="Next week"><ChevronRight size={18} /></button>
            <span className="mono-font ml-2 text-xs uppercase text-muted-foreground">{weekStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      {view === 'week' ? (
        <div className="paper-card overflow-x-auto rounded-2xl">
          <div className="grid min-w-[700px] grid-cols-7">
            {days.map((day) => {
              const iso = toISO(day);
              const isToday = iso === today;
              return (
                <div key={iso} className={`flex min-h-[340px] flex-col border-r border-border last:border-0 ${isToday ? 'bg-secondary/40' : ''}`}>
                  <button type="button" onClick={() => openNew(iso)} className="border-b border-border p-3 text-left hover:bg-secondary/50" aria-label={`Add event on ${formatDate(iso)}`}>
                    <p className="mono-font text-[10px] uppercase tracking-wider text-muted-foreground">{day.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                    <p className={`mt-0.5 text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>{day.getDate()}</p>
                  </button>
                  <div className="flex-1 p-2">
                    {sorted.filter((event) => event.date === iso).map((event) => (
                      <button type="button" key={event.id} onClick={() => openEdit(event)} className={`mb-2 w-full rounded-xl p-2 text-left transition hover:-translate-y-0.5 ${tones[event.type]}`}>
                        {event.time && <span className="mono-font text-[10px] text-muted-foreground">{formatTime(event.time)}</span>}
                        <span className="mt-0.5 block break-words text-xs font-bold leading-4">{event.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : sorted.length ? (
        <div className="grid gap-6">
          {[['Upcoming', upcoming], ['Past', past]].map(([label, events]) => (events as CalendarEvent[]).length > 0 && (
            <section key={label as string}>
              <h2 className="eyebrow mb-3">{label as string}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(events as CalendarEvent[]).map((event) => {
                  const TypeIcon = icons[event.type];
                  return (
                    <button type="button" key={event.id} onClick={() => openEdit(event)} className={`flex items-center gap-4 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 ${tones[event.type]}`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card/65 text-primary"><TypeIcon size={18} /></span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{event.title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{formatDate(event.date, { weekday: 'short', month: 'short', day: 'numeric' })}{event.time && ` · ${formatTime(event.time)}`}{event.detail && ` · ${event.detail}`}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarDays} title="Nothing scheduled" body="Add assignment deadlines, reminders, and coffee chats." />
      )}

      {view === 'week' && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {(Object.keys(tones) as CalendarEvent['type'][]).map((type) => <span key={type} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${tones[type]}`} />{type === 'coffee' ? 'Coffee chat' : type[0].toUpperCase() + type.slice(1)}</span>)}
          <span className="ml-auto">Tip: click a day to add an event.</span>
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add event' : 'Edit event'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4">
            <Field label="Title"><input autoFocus className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date"><input type="date" required className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Time"><input type="time" className={inputClass} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
              <Field label="Kind">
                <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CalendarEvent['type'] })}>
                  <option value="assignment">Assignment</option><option value="reminder">Reminder</option><option value="coffee">Coffee chat</option>
                </select>
              </Field>
            </div>
            <Field label="Details"><textarea className={`${inputClass} min-h-24`} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} /></Field>
            <FormActions
              onCancel={() => setEditing(null)}
              submitLabel={<>Save event <Check size={16} /></>}
              left={editing !== 'new' ? <button type="button" onClick={() => { if (confirmDelete('event')) { actions.remove('events', editing); setEditing(null); } }} className={`${buttonQuiet} !border-transparent text-destructive`}>Delete</button> : undefined}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}
