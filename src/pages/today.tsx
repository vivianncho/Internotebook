import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Brush, Check, CheckCircle2, Coffee, Plus, Target, Trash2 } from 'lucide-react';
import { Companion, EmptyState, Field, FormActions, Modal, ProgressBar, SpeechBubble, buttonQuiet, confirmDelete, iconButtonDanger, inputClass } from '@/components/ui';
import type { Actions, Internship, Profile, Task } from '@/hooks/use-notebook';
import { formatDate, formatTime, greeting, todayISO } from '@/lib/dates';
import { quoteOfTheDay } from '@/lib/quotes';

const blankTask: Omit<Task, 'id'> = { title: '', due: 'Today', done: false, kind: 'focus' };

export default function Today({ profile, internship, actions }: { profile: Profile; internship: Internship; actions: Actions }) {
  const [taskOpen, setTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState(blankTask);
  const quote = quoteOfTheDay();
  const today = todayISO();
  const firstName = profile.name.split(' ')[0];

  const openTasks = internship.tasks.filter((task) => !task.done);
  const completed = internship.tasks.length - openTasks.length;
  const nextChat = internship.people
    .filter((person) => person.status === 'planned' && person.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const averageProgress = internship.objectives.length
    ? Math.round(internship.objectives.reduce((sum, item) => sum + item.progress, 0) / internship.objectives.length)
    : 0;

  const submitTask = (event: FormEvent) => {
    event.preventDefault();
    if (!newTask.title.trim()) return;
    actions.add('tasks', { ...newTask, title: newTask.title.trim() });
    setNewTask(blankTask);
    setTaskOpen(false);
  };

  return (
    <div className="animate-rise">
      <section className="mb-6 rounded-[26px] border border-border bg-card/80 px-6 py-7 shadow-[var(--shadow-card)] sm:px-9">
        <p className="eyebrow mb-5 !text-primary">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="order-2 sm:order-1"><Companion image={profile.companion} name={profile.companionName} bob /></div>
          <div className="order-1 flex-1 sm:order-2">
            <SpeechBubble>
              <p className="display-font text-2xl font-semibold sm:text-3xl">{greeting()}, {firstName}!</p>
              <blockquote className="mt-3 text-base leading-7">“{quote.text}”</blockquote>
              <p className="mt-1 text-sm text-muted-foreground">— {quote.author}</p>
              {profile.companionName && <p className="eyebrow mt-3">{profile.companionName}’s quote of the day</p>}
            </SpeechBubble>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <section className="paper-card rounded-2xl p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="eyebrow">Today</p>
              <h2 className="display-font mt-1 text-2xl font-semibold">To-do list</h2>
            </div>
            <button type="button" onClick={() => setTaskOpen(true)} className="rounded-xl bg-secondary p-2.5 text-primary hover:bg-accent" aria-label="Add task"><Plus size={18} /></button>
          </div>
          {openTasks.length > 0 ? (
            <div className="grid gap-1">
              {openTasks.map((task) => (
                <div key={task.id} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-secondary/55">
                  <button type="button" onClick={() => actions.update('tasks', task.id, { done: true })} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border transition hover:border-primary" aria-label="Mark task complete" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{task.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{task.due} · {task.kind === 'focus' ? 'Focus' : 'Reminder'}</p>
                  </div>
                  <button type="button" onClick={() => confirmDelete('task') && actions.remove('tasks', task.id)} className={`${iconButtonDanger} lg:opacity-0 lg:group-hover:opacity-100`} aria-label="Delete task"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} title={internship.tasks.length ? 'All done' : 'Nothing on the list yet'} body={internship.tasks.length ? 'Everything is checked off. Nice work.' : 'Add one small thing you want to get done today.'} />
          )}
          {completed > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span>{completed} completed</span>
              <button type="button" onClick={() => internship.tasks.filter((task) => task.done).forEach((task) => actions.remove('tasks', task.id))} className="font-semibold text-primary">Clear completed</button>
            </div>
          )}
        </section>

        <div className="grid content-start gap-5">
          <section className="paper-card rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow">Learning objectives</p>
                <h2 className="display-font mt-1 text-2xl font-semibold">{internship.objectives.length ? `${averageProgress}% overall` : 'Set your objectives'}</h2>
              </div>
              <Link href="/objectives" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary" aria-label="View objectives"><ArrowRight size={18} /></Link>
            </div>
            {internship.objectives.length ? (
              <div className="grid gap-4">
                {internship.objectives.slice(0, 4).map((objective) => (
                  <div key={objective.id}>
                    <div className="mb-1.5 flex items-start justify-between gap-3 text-sm">
                      <p className="font-semibold leading-5">{objective.title}</p>
                      <span className="mono-font text-xs text-muted-foreground">{objective.progress}%</span>
                    </div>
                    <ProgressBar value={objective.progress} />
                  </div>
                ))}
              </div>
            ) : (
              <Link href="/objectives" className={buttonQuiet}><Target size={15} /> Write your first objective</Link>
            )}
          </section>

          <section className="paper-card rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-accent p-2.5 text-[hsl(var(--accent-foreground))]"><Coffee size={18} /></span>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Next coffee chat</p>
                <h2 className="mt-1 truncate text-lg font-semibold">{nextChat ? nextChat.name : 'None planned'}</h2>
                {nextChat && <p className="text-sm text-muted-foreground">{formatDate(nextChat.date)} · {nextChat.role}</p>}
              </div>
              <Link href="/people" className="rounded-lg p-2 text-primary hover:bg-secondary" aria-label="Open coffee chats"><ArrowRight size={18} /></Link>
            </div>
          </section>

          <Link href="/draw" className="paper-card group flex items-center gap-4 rounded-2xl p-5 transition hover:-translate-y-0.5 sm:p-6">
            <span className="rounded-xl bg-secondary p-2.5 text-primary"><Brush size={18} /></span>
            <div className="flex-1">
              <p className="font-semibold">Take a creative break</p>
              <p className="text-sm text-muted-foreground">Doodle for five minutes, or give your companion a makeover.</p>
            </div>
            <ArrowRight size={18} className="text-primary transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {upcomingEvents(internship, today).length > 0 && (
        <section className="paper-card mt-5 rounded-2xl p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="display-font text-xl font-semibold">Coming up</h2>
            <Link href="/calendar" className="text-sm font-semibold text-primary">See calendar</Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {upcomingEvents(internship, today).map((event) => (
              <div key={event.id} className="rounded-xl bg-secondary/50 p-3">
                <p className="mono-font text-[11px] text-muted-foreground">{formatDate(event.date, { weekday: 'short', month: 'short', day: 'numeric' })}{event.time && ` · ${formatTime(event.time)}`}</p>
                <p className="mt-1 text-sm font-semibold">{event.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {taskOpen && (
        <Modal title="Add a task" onClose={() => setTaskOpen(false)}>
          <form onSubmit={submitTask} className="grid gap-4">
            <Field label="Task"><input autoFocus className={inputClass} value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="When">
                <select className={inputClass} value={newTask.due} onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}>
                  <option>Today</option><option>Tomorrow</option><option>This week</option>
                </select>
              </Field>
              <Field label="Kind">
                <select className={inputClass} value={newTask.kind} onChange={(e) => setNewTask({ ...newTask, kind: e.target.value as Task['kind'] })}>
                  <option value="focus">Focus</option><option value="reminder">Reminder</option>
                </select>
              </Field>
            </div>
            <FormActions onCancel={() => setTaskOpen(false)} submitLabel={<>Add task <Check size={16} /></>} />
          </form>
        </Modal>
      )}
    </div>
  );
}

function upcomingEvents(internship: Internship, today: string) {
  return internship.events.filter((event) => event.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 3);
}
