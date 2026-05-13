import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

interface User {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    auth: { user: User | null };
    canRegister?: boolean;
    [key: string]: unknown;
}

const SCHEDULE = [
    { patient: 'Maria Santos',   time: '8:00 AM',  service: 'General Check-up',    status: 'confirmed', visits: 4  },
    { patient: 'Jose Dela Cruz', time: '9:30 AM',  service: 'Follow-up Visit',      status: 'confirmed', visits: 1  },
    { patient: 'Ana Bautista',   time: '10:00 AM', service: 'Hypertension Check',   status: 'pending',   visits: 12 },
    { patient: 'Carlos Ramos',   time: '11:30 AM', service: 'Lab Results Review',   status: 'completed', visits: 3  },
] as const;

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
    confirmed: { bg: 'bg-sky-100 dark:bg-sky-500/20',     text: 'text-sky-700 dark:text-sky-300',     label: 'Confirmed' },
    pending:   { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', label: 'Pending'   },
    completed: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', label: 'Completed' },
};

const FEATURES = [
    {
        path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        title: 'Doctor Schedules',
        desc: "Each doctor sees their own daily and weekly patient queue — who's coming, when, and for what service.",
    },
    {
        path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        title: 'Visit History',
        desc: 'A full chronological log of every visit per patient — vitals, check-in/check-out times, and linked medical records.',
    },
    {
        path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        title: 'Medical Records',
        desc: 'Attach diagnosis, prescription, and clinical notes to each visit so doctors always have prior context.',
    },
    {
        path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        title: 'Patient Profiles',
        desc: 'Centralized patient records with blood type, allergies, emergency contacts, and full appointment history.',
    },
    {
        path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        title: 'Appointment Booking',
        desc: 'Book appointments against each doctor\'s open slots — no double-bookings, no manual conflict checking.',
    },
    {
        path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
        title: 'Notifications',
        desc: 'Doctors are notified when appointments are confirmed so they can prepare before the patient arrives.',
    },
];

const STEPS = [
    {
        num: '01',
        title: 'Register Patient',
        desc: 'Add the patient profile with personal details, contact info, allergies, and relevant medical history.',
    },
    {
        num: '02',
        title: 'Book Appointment',
        desc: 'Select a doctor, choose a service, and pick an available time slot — the system prevents double-bookings.',
    },
    {
        num: '03',
        title: 'Record the Visit',
        desc: 'Log vitals at check-in, attach a medical record with diagnosis and prescription, then check out.',
    },
];

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Clinic Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">

                {/* ── STICKY NAV ── */}
                <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold leading-tight hidden sm:block">
                                Clinic Management
                            </span>
                        </Link>
                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        Sign In
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── HERO ── */}
                <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-20">
                    <div className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center">
                        <div className="mt-[-4rem] h-[40rem] w-[80rem] rounded-full bg-primary/[0.06] blur-3xl" />
                    </div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

                            {/* Left — headline */}
                            <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
                                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-1.5 text-sm font-medium text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Doctor Schedules &amp; Patient Records
                                </span>

                                <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.2rem] lg:leading-[1.1]">
                                    Know Your Patients
                                    <span className="block bg-gradient-to-r from-primary via-sky-500 to-cyan-400 bg-clip-text text-transparent">
                                        Before They
                                    </span>
                                    Walk In
                                </h1>

                                <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                                    Doctors see who's coming, when, and why — with full visit history and medical records at their fingertips before every consultation.
                                </p>

                                <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                                    {!auth.user ? (
                                        <>
                                            <Link
                                                href={login()}
                                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 hover:shadow-lg"
                                            >
                                                Get Started
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </Link>
                                            {canRegister && (
                                                <Link
                                                    href={register()}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3 text-base font-semibold text-card-foreground shadow-sm transition hover:bg-accent"
                                                >
                                                    Create Account
                                                </Link>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href={dashboard()}
                                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                                        >
                                            Open Dashboard
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>

                                <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
                                    {['Doctor Schedules', 'Visit History', 'Medical Records'].map((t) => (
                                        <span key={t} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right — appointments mockup */}
                            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />

                                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                                    {/* Window chrome */}
                                    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                                        <div className="flex gap-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Dr. Reyes — Today's Patients
                                        </span>
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                            {SCHEDULE.length} visits
                                        </span>
                                    </div>

                                    {/* Patient schedule list */}
                                    <div className="divide-y divide-border">
                                        {SCHEDULE.map(({ patient, time, service, status, visits }) => {
                                            const s = STATUS_MAP[status];
                                            return (
                                                <div key={patient} className="flex items-center gap-3 px-4 py-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                                                        {patient.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-semibold text-card-foreground">{patient}</p>
                                                        <p className="truncate text-[10px] text-muted-foreground">
                                                            {service} · <span className="text-primary">{visits} prior visit{visits !== 1 ? 's' : ''}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                                        <span className="text-[10px] font-medium text-muted-foreground">{time}</span>
                                                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${s.bg} ${s.text}`}>
                                                            {s.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Floating badge */}
                                <div className="absolute -bottom-4 -left-3 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40">
                                        <svg className="h-4 w-4 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-xs font-semibold text-card-foreground">Visit history loaded</p>
                                        <p className="text-[10px] text-muted-foreground">Records ready before each visit</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── STATS BAR ── */}
                <div className="border-y border-border bg-muted/30">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                            {[
                                { value: '10+',   label: 'Doctors' },
                                { value: '500+',  label: 'Registered Patients' },
                                { value: '1,200+', label: 'Appointments' },
                                { value: '800+',  label: 'Medical Records' },
                            ].map(({ value, label }) => (
                                <div key={label} className="text-center">
                                    <dt className="text-2xl font-extrabold text-foreground sm:text-3xl">{value}</dt>
                                    <dd className="mt-1 text-sm text-muted-foreground">{label}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>

                {/* ── FEATURES GRID ── */}
                <section className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Built Around the Doctor's Workflow
                            </h2>
                            <p className="mt-3 text-lg text-muted-foreground">
                                From their daily patient queue to every visit record — all in one place
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {FEATURES.map(({ path, title, desc }) => (
                                <div
                                    key={title}
                                    className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md dark:hover:border-primary/30"
                                >
                                    <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 text-primary transition-transform duration-200 group-hover:scale-110">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-base font-semibold text-card-foreground">{title}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section className="bg-muted/30 py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-14 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
                            <p className="mt-3 text-muted-foreground">
                                From first registration to a complete visit record
                            </p>
                        </div>
                        <div className="grid gap-10 sm:grid-cols-3">
                            {STEPS.map(({ num, title, desc }, i) => (
                                <div key={num} className="relative flex flex-col items-center text-center">
                                    {i < STEPS.length - 1 && (
                                        <div className="absolute left-1/2 top-6 hidden h-px w-full translate-x-[3rem] border-t border-dashed border-border sm:block" />
                                    )}
                                    <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground shadow-lg">
                                        {num}
                                    </div>
                                    <h4 className="mb-2 font-semibold text-foreground">{title}</h4>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                {!auth.user && (
                    <section className="py-16 sm:py-20">
                        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
                            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] to-transparent px-8 py-12 sm:px-14">
                                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                                    Ready to get started?
                                </h2>
                                <p className="mb-8 text-muted-foreground">
                                    Sign in and bring order to your clinic's appointments, records, and workflows.
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Link
                                        href={login()}
                                        className="rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
                                    >
                                        Sign In
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-xl border border-border bg-card px-7 py-3 text-base font-semibold text-card-foreground shadow-sm hover:bg-accent"
                                        >
                                            Create Account
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── FOOTER ── */}
                <footer className="border-t border-border py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    Clinic Management System
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                &copy; {new Date().getFullYear()} Clinic Management System
                            </p>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
