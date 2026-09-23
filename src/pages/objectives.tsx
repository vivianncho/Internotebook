import { useState, type FormEvent } from 'react';
import { BookOpenCheck, Check, ChevronDown, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { EmptyState, Field, FormActions, Modal, PageHeader, ProgressBar, buttonPrimary, buttonQuiet, confirmDelete, hoverReveal, iconButton, iconButtonDanger, inputClass } from '@/components/ui';
import { objectiveTypes, smartKeys, type Actions, type Internship, type Objective, type ObjectiveType, type SmartKey } from '@/hooks/use-notebook';
import { formatDate } from '@/lib/dates';

const smartInfo: Record<SmartKey, { letter: string; label: string; hint: string }> = {
  specific: { letter: 'S', label: 'Specific', hint: 'Says exactly what you will learn or do.' },
  measurable: { letter: 'M', label: 'Measurable', hint: 'You can tell when it has been achieved.' },
  attainable: { letter: 'A', label: 'Attainable', hint: 'Within reach given your role and time.' },
  realistic: { letter: 'R', label: 'Realistic', hint: 'Fits the work and resources you actually have.' },
  timeBound: { letter: 'T', label: 'Time bound', hint: 'Has deadlines along the way.' },
};

const typeInfo: Record<ObjectiveType, { description: string; tone: string }> = {
  Knowledge: { description: 'Learning or applying facts, terminology, and concepts, often building on what you learned in class.', tone: 'bg-secondary text-primary' },
  Skills: { description: 'Something you want to learn how to do, or a skill you want to develop further.', tone: 'bg-[#dce8e5] text-[#3a756a]' },
  Attitude: { description: 'Attitudes, values, or characteristics you believe are important to your development.', tone: 'bg-accent text-[hsl(var(--accent-foreground))]' },
  'Career Growth': { description: 'Career exploration, self-assessment, networking, shadowing, and similar activities.', tone: 'bg-[#e6e4f3] text-[#5d5896]' },
};

const questions: Array<{ key: 'learn' | 'actionSteps' | 'resources' | 'demonstrate'; label: string }> = [
  { key: 'learn', label: 'What do I want to learn or do?' },
  { key: 'actionSteps', label: 'What are my action steps and deadlines?' },
  { key: 'resources', label: 'What information or resources do I need?' },
  { key: 'demonstrate', label: 'How will I show that I achieved it?' },
];

const examples: Array<{ type: ObjectiveType; vague: string; title: string; specific: string }> = [
  {
    type: 'Knowledge', vague: 'Understand the grant writing process.', title: 'Understand the grant writing process',
    specific: 'At the conclusion of this internship, I will be able to demonstrate my understanding of the grant writing process. I will connect with grant writers on staff and interview them to learn more. I will research available grant requirements and create an outline for a grant application to share with my supervisor. I will assist with writing at least one grant application during my internship.',
  },
  {
    type: 'Skills', vague: 'Learn how to use Excel better.', title: 'Analyze financial data in Excel',
    specific: 'By the end of this internship, I will be able to use Excel to analyze financial data. Specifically, I will be able to create, modify and format pivot tables in Excel. To learn these skills, I will work with my supervisor and utilize online courses. I will present Excel data to my supervisor and gain verbal feedback on my work.',
  },
  {
    type: 'Attitude', vague: 'Gain feedback on my work ethic.', title: 'Build a reputation as a top performer',
    specific: 'My goal is to develop a reputation as an emerging top-performing, hardworking professional and earn outstanding, positive feedback from my supervisor. I will ask for any necessary clarification about tasks to understand what is expected of me, provide high quality performance while demonstrating professionalism, learn and grow from my mistakes and constructive criticism, and take initiative to work on extra projects.',
  },
  {
    type: 'Career Growth', vague: 'Find a mentor in my field.', title: 'Find a mentor in my field',
    specific: 'During the first two weeks I will identify 3 potential mentors and reach out for informational interviews with them, articulating my desire to have a mentor. Based on those conversations, I will find a mentor who can guide me on my career path. The goal is to meet one on one with my mentor every other week and develop an action plan for my career.',
  },
];

const noSmart = { specific: false, measurable: false, attainable: false, realistic: false, timeBound: false };
const blank: Omit<Objective, 'id'> = { type: 'Knowledge', title: '', learn: '', actionSteps: '', resources: '', demonstrate: '', deadline: '', progress: 0, smart: noSmart };

export default function Objectives({ internship, actions }: { internship: Internship; actions: Actions }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [guideOpen, setGuideOpen] = useState(internship.objectives.length === 0);
  const [examplesOpen, setExamplesOpen] = useState(false);

  const open = (objective?: Objective) => {
    setForm(objective ? { ...objective } : blank);
    setEditing(objective?.id ?? 'new');
  };
  const useExample = (example: (typeof examples)[number]) => {
    setForm({ ...blank, type: example.type, title: example.title, learn: example.specific });
    setEditing('new');
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    if (editing === 'new') actions.add('objectives', form);
    else if (editing) actions.update('objectives', editing, form);
    setEditing(null);
  };

  const missingTypes = objectiveTypes.filter((type) => !internship.objectives.some((item) => item.type === type));

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Practicum"
        title="Learning objectives"
        body="Behavior-based, measurable statements built from your job description. Share them with your faculty advisor and supervisor so everyone knows what you hope to learn."
        action={<button type="button" className={buttonPrimary} onClick={() => open()}><Plus size={17} /> New objective</button>}
      />

      <section className="paper-card mb-6 rounded-2xl">
        <button type="button" onClick={() => setGuideOpen(!guideOpen)} className="flex w-full items-center justify-between gap-3 p-5 text-left sm:px-6" aria-expanded={guideOpen}>
          <span className="flex items-center gap-3"><BookOpenCheck size={19} className="text-primary" /><span className="font-semibold">How to write a good objective</span></span>
          <ChevronDown size={18} className={`text-muted-foreground transition ${guideOpen ? 'rotate-180' : ''}`} />
        </button>
        {guideOpen && (
          <div className="grid gap-6 border-t border-border p-5 sm:p-6 lg:grid-cols-3">
            <div>
              <p className="eyebrow mb-3">Make it SMART</p>
              <ul className="grid gap-2">
                {smartKeys.map((key) => (
                  <li key={key} className="flex gap-3 text-sm">
                    <span className="display-font flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">{smartInfo[key].letter}</span>
                    <span><span className="font-semibold">{smartInfo[key].label}</span><span className="block text-xs text-muted-foreground">{smartInfo[key].hint}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-3">Types of objectives</p>
              <ul className="grid gap-3">
                {objectiveTypes.map((type) => (
                  <li key={type} className="text-sm">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${typeInfo[type].tone}`}>{type}</span>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{typeInfo[type].description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-3">For each objective, answer</p>
              <ol className="grid gap-2 text-sm">
                {questions.map((question, index) => (
                  <li key={question.key} className="flex gap-2"><span className="mono-font text-primary">{index + 1}.</span>{question.label}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>

      {internship.objectives.length > 0 && missingTypes.length > 0 && missingTypes.length < objectiveTypes.length && (
        <p className="mb-4 text-sm text-muted-foreground">Idea: you don’t have a <span className="font-semibold text-foreground">{missingTypes.join(', ')}</span> objective yet.</p>
      )}

      {internship.objectives.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {internship.objectives.map((objective) => {
            const smartCount = smartKeys.filter((key) => objective.smart[key]).length;
            return (
              <article key={objective.id} className="paper-card group flex flex-col rounded-2xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${typeInfo[objective.type].tone}`}>{objective.type}</span>
                  <div className={hoverReveal}>
                    <button type="button" onClick={() => open(objective)} className={iconButton} aria-label="Edit objective"><Pencil size={15} /></button>
                    <button type="button" onClick={() => confirmDelete('objective') && actions.remove('objectives', objective.id)} className={iconButtonDanger} aria-label="Delete objective"><Trash2 size={15} /></button>
                  </div>
                </div>
                <h2 className="display-font mt-4 text-2xl font-semibold leading-tight">{objective.title}</h2>
                {objective.deadline && <p className="mono-font mt-1 text-xs text-muted-foreground">Due {formatDate(objective.deadline)}</p>}
                <dl className="mt-4 grid flex-1 gap-3">
                  {questions.filter((question) => objective[question.key].trim()).map((question) => (
                    <div key={question.key}>
                      <dt className="text-xs font-bold text-foreground">{question.label}</dt>
                      <dd className="mt-0.5 whitespace-pre-line text-sm leading-6 text-muted-foreground">{objective[question.key]}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs font-semibold"><span>Progress</span><span className="mono-font text-primary">{objective.progress}%</span></div>
                  <ProgressBar value={objective.progress} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-1" title={`${smartCount} of 5 SMART criteria checked`}>
                    {smartKeys.map((key) => (
                      <span key={key} className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${objective.smart[key] ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{smartInfo[key].letter}</span>
                    ))}
                  </div>
                  <input type="range" min="0" max="100" step="5" value={objective.progress} onChange={(e) => actions.update('objectives', objective.id, { progress: Number(e.target.value) })} className="w-32 accent-[hsl(var(--primary))]" aria-label={`Progress for ${objective.title}`} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Target} title="No objectives yet" body="Most practicums have one objective for each type. Start with one, or build from an example below." action={<button type="button" className={buttonPrimary} onClick={() => open()}><Plus size={16} /> Write an objective</button>} />
      )}

      <section className="mt-8">
        <button type="button" onClick={() => setExamplesOpen(!examplesOpen)} className="flex items-center gap-2 text-sm font-semibold text-primary" aria-expanded={examplesOpen}>
          <ChevronDown size={16} className={`transition ${examplesOpen ? 'rotate-180' : ''}`} /> {examplesOpen ? 'Hide' : 'Show'} example objectives: vague vs. specific
        </button>
        {examplesOpen && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {examples.map((example) => (
              <article key={example.type} className="paper-card rounded-2xl p-5">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${typeInfo[example.type].tone}`}>{example.type}</span>
                <p className="mt-4 text-xs font-bold text-muted-foreground">Vague</p>
                <p className="text-sm line-through decoration-muted-foreground/40">{example.vague}</p>
                <p className="mt-3 text-xs font-bold text-primary">Specific</p>
                <p className="text-sm leading-6">{example.specific}</p>
                <button type="button" onClick={() => useExample(example)} className={`${buttonQuiet} mt-4`}>Use as a starting point</button>
              </article>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <Modal title={editing === 'new' ? 'New learning objective' : 'Edit objective'} onClose={() => setEditing(null)} width="max-w-2xl">
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[.8fr_1.2fr]">
              <Field label="Type">
                <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ObjectiveType })}>
                  {objectiveTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </Field>
              <Field label="Short title"><input autoFocus required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Analyze financial data in Excel" /></Field>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">{typeInfo[form.type].description}</p>
            {questions.map((question) => (
              <Field key={question.key} label={question.label}>
                <textarea className={`${inputClass} min-h-20 resize-y`} value={form[question.key]} onChange={(e) => setForm({ ...form, [question.key]: e.target.value })} />
              </Field>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target date"><input type="date" className={inputClass} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
              <Field label={`Progress: ${form.progress}%`}>
                <input type="range" min="0" max="100" step="5" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} className="mt-3 w-full accent-[hsl(var(--primary))]" />
              </Field>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">SMART check</legend>
              <div className="grid gap-2 sm:grid-cols-5">
                {smartKeys.map((key) => (
                  <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-sm transition ${form.smart[key] ? 'border-primary bg-secondary/60' : 'border-border'}`} title={smartInfo[key].hint}>
                    <input type="checkbox" checked={form.smart[key]} onChange={(e) => setForm({ ...form, smart: { ...form.smart, [key]: e.target.checked } })} className="accent-[hsl(var(--primary))]" />
                    {smartInfo[key].label}
                  </label>
                ))}
              </div>
            </fieldset>
            <FormActions onCancel={() => setEditing(null)} submitLabel={<>Save objective <Check size={16} /></>} />
          </form>
        </Modal>
      )}
    </div>
  );
}
