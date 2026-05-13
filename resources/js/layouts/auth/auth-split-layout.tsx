import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">

                {/* ── LEFT PANEL — dark with orange accents ── */}
                <div className="relative hidden h-full flex-col overflow-hidden bg-zinc-950 p-10 lg:flex">

                    {/* Dot pattern overlay */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />

                    {/* Soft orange glow — bottom right */}
                    <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-primary/25 blur-[100px]" />
                    {/* Faint top-left accent */}
                    <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

                    {/* ── Logo & Brand ── */}
                    <Link href={home()} className="relative z-20 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
                            <AppLogoIcon className="w-12" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                                Clinic Management
                            </span>
                            <span className="font-semibold text-white leading-tight">{name as string}</span>
                        </div>
                    </Link>

                    {/* ── Main copy ── */}
                    <div className="relative z-20 mt-auto flex flex-1 flex-col justify-center">
                        <div className="mb-8">
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Doctor Schedules &amp; Patient Records
                            </span>

                            <h2 className="mb-4 text-3xl font-bold leading-tight text-white lg:text-4xl">
                                Know Your Patients
                                <span className="mt-1 block text-zinc-400 font-normal">
                                    Before They Walk In
                                </span>
                            </h2>

                            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
                                View your daily patient queue, review visit history, and access
                                medical records — all before the consultation begins.
                            </p>
                        </div>

                        {/* Feature list */}
                        <ul className="flex flex-col gap-3.5">
                            {[
                                'Doctor daily & weekly schedule view',
                                'Full patient visit history',
                                'Medical records per visit',
                                'Appointment notifications for doctors',
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                                        <svg
                                            className="h-3 w-3 text-primary"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2.5}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </span>
                                    <span className="text-sm text-zinc-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Footer ── */}
                    <div className="relative z-20 mt-8 border-t border-zinc-800 pt-5">
                        <p className="text-xs text-zinc-700">
                            &copy; {new Date().getFullYear()} Clinic Management System
                        </p>
                    </div>
                </div>

                {/* ── RIGHT PANEL — form ── */}
                <div className="w-full lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        {/* Mobile logo */}
                        <Link
                            href={home()}
                            className="relative z-20 flex items-center justify-center lg:hidden"
                        >
                            <AppLogoIcon className="h-10 fill-current text-black sm:h-12 dark:text-white" />
                        </Link>

                        <div className="flex flex-col items-start gap-1 text-left sm:items-center sm:text-center">
                            <h1 className="text-xl font-semibold">{title}</h1>
                            <p className="text-sm text-balance text-muted-foreground">{description}</p>
                        </div>

                        {children}
                    </div>
                </div>

            </div>
        </>
    );
}
