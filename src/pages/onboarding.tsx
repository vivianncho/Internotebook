import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass } from 'lucide-react';
import { DrawingPad, type DrawingPadHandle } from '@/components/drawing-pad';
import { Bunny, Field, SpeechBubble, buttonPrimary, buttonQuiet, inputClass } from '@/components/ui';
import { emptyDetails, type Actions } from '@/hooks/use-notebook';
import { todayISO } from '@/lib/dates';

export default function Onboarding({ actions }: { actions: Actions }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ name: '', email: '', role: '', company: '', startDate: todayISO(), endDate: '' });
  const [companionName, setCompanionName] = useState('');
  const pad = useRef<DrawingPadHandle>(null);

  const next = (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim() && form.email.trim() && form.role.trim() && form.company.trim()) setStep(2);
  };

  const finish = (withDrawing: boolean) => {
    actions.completeOnboarding(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        companion: (withDrawing && pad.current?.getImage()) || '',
        companionName: companionName.trim(),
        reminders: true,
        emailReminders: false,
        weeklyReview: true,
      },
      { ...emptyDetails, company: form.company.trim(), role: form.role.trim(), startDate: form.startDate, endDate: form.endDate },
    );
  };

  return (
    <div className="paper-grid flex min-h-[100dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl animate-rise">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary text-white"><Compass size={20} /></span>
            <span><span className="display-font block text-lg font-semibold leading-none">Internship</span><span className="eyebrow">Notebook</span></span>
          </div>
          <span className="eyebrow">Step {step} of 2</span>
        </div>

        {step === 1 ? (
          <form onSubmit={next} className="paper-card rounded-3xl p-6 sm:p-9">
            <div className="mb-7 flex items-end gap-4">
              <div className="hidden sm:block"><Bunny small /></div>
              <div>
                <h1 className="display-font text-4xl font-semibold tracking-[-.02em]">Welcome! Let’s set up your notebook.</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">A few details to get started. Everything stays private on this device.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name"><input autoFocus required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></Field>
              <Field label="Email"><input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></Field>
              <Field label="Role"><input required className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Marketing Intern" /></Field>
              <Field label="Company"><input required className={inputClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} autoComplete="organization" /></Field>
              <Field label="Start date"><input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
              <Field label="End date" hint="Optional"><input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
            </div>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">Had internships before? You can add those later under <span className="font-semibold text-foreground">My internships</span>.</p>
            <div className="mt-6 flex justify-end">
              <button type="submit" className={buttonPrimary}>Next: draw your companion <ArrowRight size={16} /></button>
            </div>
          </form>
        ) : (
          <div className="paper-card rounded-3xl p-6 sm:p-9">
            <h1 className="display-font text-4xl font-semibold tracking-[-.02em]">Draw your companion</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Anything you like: a pet, a plant, a little creature. They’ll greet you every day with a bit of encouragement. You can redraw them any time.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_.6fr]">
              <DrawingPad ref={pad} />
              <div className="flex flex-col gap-4">
                <Field label="Give them a name" hint="Optional">
                  <input className={inputClass} value={companionName} onChange={(e) => setCompanionName(e.target.value)} placeholder="e.g. Mochi" />
                </Field>
                <SpeechBubble>
                  <p className="text-sm font-semibold">Hi {form.name.split(' ')[0]}!</p>
                  <p className="mt-1 text-sm text-muted-foreground">I’ll be here with a new quote every day.</p>
                </SpeechBubble>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setStep(1)} className={buttonQuiet}><ArrowLeft size={16} /> Back</button>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => finish(false)} className={buttonQuiet}>Skip, use the bunny</button>
                <button type="button" onClick={() => finish(true)} className={buttonPrimary}>Start my notebook <Check size={16} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
