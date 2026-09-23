import { useEffect, useMemo, useState } from 'react';
import { todayISO } from '@/lib/dates';

export type Task = { id: string; title: string; due: string; done: boolean; kind: 'focus' | 'reminder' };
export type Note = { id: string; title: string; body: string; category: string; tags: string[]; date: string };
export type CalendarEvent = { id: string; title: string; date: string; time: string; type: 'assignment' | 'reminder' | 'coffee'; detail: string };
export type Person = { id: string; name: string; role: string; team: string; date: string; status: 'planned' | 'met'; notes: string };
export type JournalEntry = { id: string; date: string; type: string; title: string; body: string; tags: string[] };

export const objectiveTypes = ['Knowledge', 'Skills', 'Attitude', 'Career Growth'] as const;
export type ObjectiveType = (typeof objectiveTypes)[number];
export const smartKeys = ['specific', 'measurable', 'attainable', 'realistic', 'timeBound'] as const;
export type SmartKey = (typeof smartKeys)[number];

/** A practicum learning objective, structured around the four planning questions. */
export type Objective = {
  id: string;
  type: ObjectiveType;
  title: string;
  /** What do I want to learn or do? */
  learn: string;
  /** What are my action steps and deadlines? */
  actionSteps: string;
  /** What information or resources are needed? */
  resources: string;
  /** How will I demonstrate that I achieved it? */
  demonstrate: string;
  deadline: string;
  progress: number;
  smart: Record<SmartKey, boolean>;
};

export type InternshipDetails = {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  facultyAdvisor: string;
  description: string;
};

export type Internship = InternshipDetails & {
  id: string;
  createdAt: string;
  tasks: Task[];
  notes: Note[];
  objectives: Objective[];
  events: CalendarEvent[];
  people: Person[];
  journal: JournalEntry[];
};

export type Profile = {
  name: string;
  email: string;
  /** The user's hand-drawn companion as a PNG data URL; empty means the default bunny. */
  companion: string;
  companionName: string;
  reminders: boolean;
  emailReminders: boolean;
  weeklyReview: boolean;
};

export type Doodle = { id: string; image: string; date: string };

export type NotebookData = {
  version: 2;
  profile: Profile | null;
  /** Break-time sketches; kept small because they live in browser storage. */
  doodles: Doodle[];
  internships: Internship[];
  activeId: string | null;
};

type CollectionKey = 'tasks' | 'notes' | 'objectives' | 'events' | 'people' | 'journal';
type ItemOf<K extends CollectionKey> = Internship[K][number];

const storageKey = 'internship-notebook-data-v2';
const legacyStorageKey = 'internship-notebook-data-v1';
const empty: NotebookData = { version: 2, profile: null, doodles: [], internships: [], activeId: null };
const maxDoodles = 24;

export const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const emptyDetails: InternshipDetails = { company: '', role: '', location: '', startDate: '', endDate: '', supervisor: '', facultyAdvisor: '', description: '' };

export function createInternship(details: InternshipDetails): Internship {
  return { ...details, id: newId('internship'), createdAt: todayISO(), tasks: [], notes: [], objectives: [], events: [], people: [], journal: [] };
}

/** Carries notebooks saved by the first version (one internship, three goals) into the new shape. */
function migrateLegacy(raw: string): NotebookData | null {
  try {
    const old = JSON.parse(raw);
    const settings = old?.settings;
    // The first version always saved its sample notebook; skip it if it was never personalised.
    if (!settings || settings.email === 'sofia.park@example.com') return null;
    const internship = createInternship({ ...emptyDetails, company: settings.company ?? '', role: settings.role ?? '' });
    internship.tasks = old.tasks ?? [];
    internship.notes = old.notes ?? [];
    internship.events = old.events ?? [];
    internship.people = old.people ?? [];
    internship.journal = old.journal ?? [];
    internship.objectives = (old.goals ?? []).map((goal: { id: string; title: string; why: string; measure: string; progress: number }) => ({
      id: goal.id, type: 'Skills', title: goal.title, learn: goal.why, actionSteps: '', resources: '', demonstrate: goal.measure,
      deadline: '', progress: goal.progress, smart: { specific: false, measurable: false, attainable: false, realistic: false, timeBound: false },
    }));
    return {
      version: 2,
      doodles: [],
      profile: { name: settings.name ?? '', email: settings.email ?? '', companion: '', companionName: '', reminders: !!settings.reminders, emailReminders: !!settings.emailReminders, weeklyReview: !!settings.weeklyReview },
      internships: [internship],
      activeId: internship.id,
    };
  } catch {
    return null;
  }
}

function loadData(): NotebookData {
  if (typeof window === 'undefined') return empty;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) return { ...empty, ...JSON.parse(saved) };
    const legacy = window.localStorage.getItem(legacyStorageKey);
    return (legacy && migrateLegacy(legacy)) || empty;
  } catch {
    return empty;
  }
}

export function useNotebook() {
  const [data, setData] = useState<NotebookData>(loadData);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // Storage can be unavailable (private mode, full quota); the app keeps working in memory.
    }
  }, [data]);

  const actions = useMemo(() => {
    const updateActive = (fn: (internship: Internship) => Internship) =>
      setData((d) => ({ ...d, internships: d.internships.map((item) => (item.id === d.activeId ? fn(item) : item)) }));

    return {
      completeOnboarding: (profile: Profile, details: InternshipDetails) => {
        const internship = createInternship(details);
        setData((d) => ({ ...d, profile, internships: [internship, ...d.internships], activeId: internship.id }));
      },
      updateProfile: (changes: Partial<Profile>) => setData((d) => (d.profile ? { ...d, profile: { ...d.profile, ...changes } } : d)),

      addInternship: (details: InternshipDetails) => {
        const internship = createInternship(details);
        setData((d) => ({ ...d, internships: [internship, ...d.internships], activeId: internship.id }));
      },
      updateInternship: (id: string, details: InternshipDetails) =>
        setData((d) => ({ ...d, internships: d.internships.map((item) => (item.id === id ? { ...item, ...details } : item)) })),
      deleteInternship: (id: string) =>
        setData((d) => {
          const internships = d.internships.filter((item) => item.id !== id);
          return { ...d, internships, activeId: d.activeId === id ? internships[0]?.id ?? null : d.activeId };
        }),
      setActive: (id: string) => setData((d) => ({ ...d, activeId: id })),

      add: <K extends CollectionKey>(key: K, item: Omit<ItemOf<K>, 'id'>) =>
        updateActive((internship) => ({ ...internship, [key]: [{ ...item, id: newId(key) }, ...internship[key]] })),
      update: <K extends CollectionKey>(key: K, id: string, changes: Partial<ItemOf<K>>) =>
        updateActive((internship) => ({ ...internship, [key]: (internship[key] as ItemOf<K>[]).map((item) => (item.id === id ? { ...item, ...changes } : item)) })),
      remove: (key: CollectionKey, id: string) =>
        updateActive((internship) => ({ ...internship, [key]: (internship[key] as Array<{ id: string }>).filter((item) => item.id !== id) })),

      addDoodle: (image: string) =>
        setData((d) => ({ ...d, doodles: [{ id: newId('doodle'), image, date: todayISO() }, ...d.doodles].slice(0, maxDoodles) })),
      removeDoodle: (id: string) => setData((d) => ({ ...d, doodles: d.doodles.filter((item) => item.id !== id) })),

      reset: () => setData(empty),
    };
  }, []);

  const active = data.internships.find((item) => item.id === data.activeId) ?? null;
  return { data, active, actions };
}

export type Actions = ReturnType<typeof useNotebook>['actions'];
