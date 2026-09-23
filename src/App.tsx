import { useState, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { BookOpen, Briefcase, Brush, CalendarDays, Compass, FileText, Home, Menu, Settings as SettingsIcon, Target, Users, X, type LucideIcon } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Companion, EmptyState } from '@/components/ui';
import { useNotebook, type Actions, type Internship, type NotebookData, type Profile } from '@/hooks/use-notebook';
import Calendar from '@/pages/calendar';
import Draw from '@/pages/draw';
import Internships from '@/pages/internships';
import Journal from '@/pages/journal';
import Notes from '@/pages/notes';
import Objectives from '@/pages/objectives';
import Onboarding from '@/pages/onboarding';
import People from '@/pages/people';
import Settings from '@/pages/settings';
import Today from '@/pages/today';

const navItems: Array<{ href: string; label: string; short: string; icon: LucideIcon }> = [
  { href: '/', label: 'Today', short: 'Today', icon: Home },
  { href: '/objectives', label: 'Learning objectives', short: 'Goals', icon: Target },
  { href: '/notes', label: 'Notes', short: 'Notes', icon: FileText },
  { href: '/calendar', label: 'Calendar', short: 'Calendar', icon: CalendarDays },
  { href: '/people', label: 'Coffee chats', short: 'People', icon: Users },
  { href: '/journal', label: 'Experience log', short: 'Log', icon: BookOpen },
  { href: '/draw', label: 'Draw', short: 'Draw', icon: Brush },
];

function Shell({ children, profile, data, active, actions }: { children: ReactNode; profile: Profile; data: NotebookData; active: Internship | null; actions: Actions }) {
  const [location, navigate] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const close = () => setMobileNav(false);
  const linkClass = (href: string) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${location === href ? 'bg-card text-primary shadow-sm' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-foreground'}`;

  return (
    <div className="paper-grid min-h-[100dvh]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col overflow-y-auto border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar)/.95)] px-5 py-6 backdrop-blur transition-transform duration-300 lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" onClick={close} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary text-white"><Compass size={20} /></span>
            <span><span className="display-font block text-lg font-semibold leading-none">Internship</span><span className="eyebrow">Notebook</span></span>
          </Link>
          <button type="button" className="rounded-lg p-1 text-muted-foreground lg:hidden" onClick={close} aria-label="Close navigation"><X size={18} /></button>
        </div>

        {data.internships.length > 0 && (
          <label className="mb-5 grid gap-1">
            <span className="eyebrow px-1">Internship</span>
            <select
              value={data.activeId ?? ''}
              onChange={(e) => e.target.value === '__manage' ? (navigate('/internships'), close()) : actions.setActive(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
            >
              {data.internships.map((item) => <option key={item.id} value={item.id}>{item.company}{item.role ? ` · ${item.role}` : ''}</option>)}
              <option value="__manage">Manage internships…</option>
            </select>
          </label>
        )}

        <nav className="grid gap-1" aria-label="Primary navigation">
          {navItems.map(({ href, label, icon: NavIcon }) => (
            <Link key={href} href={href} onClick={close} className={linkClass(href)} aria-current={location === href ? 'page' : undefined}>
              <NavIcon size={18} strokeWidth={location === href ? 2.3 : 1.8} /><span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <Link href="/draw" onClick={close} className="flex items-end justify-between rounded-2xl border border-[hsl(var(--sidebar-border))] bg-card/70 p-4 transition hover:border-primary">
            <div>
              <p className="text-xs font-semibold">{profile.companionName || 'Your companion'}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Take a quick drawing break.</p>
            </div>
            <Companion image={profile.companion} name={profile.companionName} size="sm" />
          </Link>
          <div className="mt-3 grid gap-1">
            <Link href="/internships" onClick={close} className={linkClass('/internships')}><Briefcase size={18} /><span>My internships</span></Link>
            <Link href="/settings" onClick={close} className={linkClass('/settings')}><SettingsIcon size={18} /><span>Settings</span></Link>
          </div>
        </div>
      </aside>
      {mobileNav && <button type="button" onClick={close} className="fixed inset-0 z-30 bg-[hsl(211_31%_20%/.2)] lg:hidden" aria-label="Close menu" />}

      <main className="min-h-[100dvh] pb-24 lg:pb-0 lg:pl-[260px]">
        <div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
          <div className="mb-7 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setMobileNav(true)} className="rounded-xl border border-border bg-card/85 p-2.5 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>
            {active && (
              <Link href="/internships" className="hidden text-sm text-muted-foreground hover:text-foreground lg:block">
                {active.role} at <span className="font-semibold text-foreground">{active.company}</span>
              </Link>
            )}
            <Link href="/settings" className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card/85 py-1.5 pl-1.5 pr-3 text-sm font-semibold transition hover:border-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-[hsl(var(--accent-foreground))]">{profile.name.slice(0, 1).toUpperCase()}</span>
              {profile.name}
            </Link>
          </div>
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-20 flex justify-around rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur lg:hidden" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map(({ href, short, icon: NavIcon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold ${location === href ? 'text-primary' : 'text-muted-foreground'}`}>
            <NavIcon size={17} /><span>{short}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Routes({ data, active, profile, actions }: { data: NotebookData; active: Internship | null; profile: Profile; actions: Actions }) {
  // Pages that belong to one internship need one to be open.
  const needsInternship = (page: (internship: Internship) => ReactNode) => active ? page(active) : (
    <EmptyState icon={Briefcase} title="No internship open" body="Add an internship to start filling in your notebook." action={<Link href="/internships" className="font-semibold text-primary">Go to My internships</Link>} />
  );
  return (
    <Switch>
      <Route path="/">{needsInternship((internship) => <Today profile={profile} internship={internship} actions={actions} />)}</Route>
      <Route path="/objectives">{needsInternship((internship) => <Objectives key={internship.id} internship={internship} actions={actions} />)}</Route>
      <Route path="/notes">{needsInternship((internship) => <Notes internship={internship} actions={actions} />)}</Route>
      <Route path="/calendar">{needsInternship((internship) => <Calendar internship={internship} actions={actions} />)}</Route>
      <Route path="/people">{needsInternship((internship) => <People internship={internship} actions={actions} />)}</Route>
      <Route path="/journal">{needsInternship((internship) => <Journal internship={internship} actions={actions} />)}</Route>
      <Route path="/draw"><Draw profile={profile} doodles={data.doodles} actions={actions} /></Route>
      <Route path="/internships"><Internships internships={data.internships} activeId={data.activeId} actions={actions} /></Route>
      <Route path="/settings"><Settings profile={profile} actions={actions} /></Route>
      <Route>
        <EmptyState icon={Compass} title="Page not found" body="That page doesn’t exist." action={<Link href="/" className="font-semibold text-primary">Back to Today</Link>} />
      </Route>
    </Switch>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

export default function App() {
  const { data, active, actions } = useNotebook();
  if (!data.profile) return <Onboarding actions={actions} />;
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <RoutedErrorBoundary>
        <Shell profile={data.profile} data={data} active={active} actions={actions}>
          <Routes data={data} active={active} profile={data.profile} actions={actions} />
        </Shell>
      </RoutedErrorBoundary>
    </WouterRouter>
  );
}
