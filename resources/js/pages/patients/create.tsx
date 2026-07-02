import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Bell, Check, Plus, Search } from 'lucide-react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { index as patients, store as patientsStore } from '@/routes/patients';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CIVIL_STATUSES = [
    'Single',
    'Married',
    'Divorced',
    'Widowed',
    'Separated',
];

function sanitizeName(value: string): string {
    return value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '').slice(0, 100);
}

function sanitizePhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    return digits.startsWith('0') ? digits.slice(1) : digits;
}

function sanitizeFreeText(value: string, max: number): string {
    return (
        value
            // eslint-disable-next-line no-control-regex
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g, '')
            .slice(0, max)
    );
}

function calculateAge(dateOfBirth: string): number | null {
    if (!dateOfBirth) {
        return null;
    }

    const birth = new Date(dateOfBirth);
    const today = new Date();

    if (isNaN(birth.getTime())) {
        return null;
    }

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
        age--;
    }

    return age >= 0 ? age : null;
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        civil_status: '',
        occupation: '',
        nationality: '',
        blood_type: '',
        phone: '',
        email: '',
        street_address: '',
        city: '',
        province: '',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_phone: '',
        allergies: '',
        medical_history: '',
        is_regular: false as boolean,
    });

    const age = useMemo(
        () => calculateAge(data.date_of_birth),
        [data.date_of_birth],
    );

    const personalRef = useRef<HTMLDivElement>(null);
    const contactRef = useRef<HTMLDivElement>(null);
    const emergencyRef = useRef<HTMLDivElement>(null);
    const medicalRef = useRef<HTMLDivElement>(null);

    const steps = useMemo(
        () => [
            { id: 1, title: 'Personal & Demographics', ref: personalRef },
            { id: 2, title: 'Contact & Address', ref: contactRef },
            { id: 3, title: 'Emergency Contact', ref: emergencyRef },
            { id: 4, title: 'Medical Baseline', ref: medicalRef },
        ],
        [],
    );

    const [activeStep, setActiveStep] = useState(1);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = steps.findIndex(
                            (s) => s.ref.current === entry.target,
                        );

                        if (index !== -1) {
                            setActiveStep(index + 1);
                        }
                    }
                });
            },
            { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
        );

        steps.forEach((s) => {
            if (s.ref.current) {
                observer.observe(s.ref.current);
            }
        });

        return () => observer.disconnect();
    }, [steps]);

    const scrollToStep = (index: number) => {
        const ref = steps[index]?.ref;

        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveStep(index + 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(patientsStore.url());
    };

    return (
        <>
            <Head title="Register Patient" />

            <div className="flex min-h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-muted-foreground"
                        >
                            <Link href={patients()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                            Register New Patient
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Capture demographics, contact, and medical baseline.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative hidden md:block">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search patients, appointments..."
                                className="w-72 bg-background pl-9 lg:w-80"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                        >
                            <Bell className="h-4 w-4" />
                        </Button>
                        <Button asChild className="shrink-0">
                            <Link href="/patients/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Patient
                            </Link>
                        </Button>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-6 lg:grid-cols-[1fr_320px]"
                >
                    <div className="flex flex-col gap-6">
                        <SectionCard
                            ref={personalRef}
                            step={1}
                            title="Personal & Demographics"
                        >
                            <div className="grid gap-4 sm:grid-cols-3">
                                <FormField
                                    label="First name"
                                    required
                                    error={errors.first_name}
                                >
                                    <Input
                                        value={data.first_name}
                                        onChange={(e) =>
                                            setData(
                                                'first_name',
                                                sanitizeName(e.target.value),
                                            )
                                        }
                                        placeholder="John"
                                        required
                                    />
                                </FormField>
                                <FormField
                                    label="Middle name"
                                    error={errors.middle_name}
                                >
                                    <Input
                                        value={data.middle_name}
                                        onChange={(e) =>
                                            setData(
                                                'middle_name',
                                                sanitizeName(e.target.value),
                                            )
                                        }
                                        placeholder="—"
                                    />
                                </FormField>
                                <FormField
                                    label="Last name"
                                    required
                                    error={errors.last_name}
                                >
                                    <Input
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData(
                                                'last_name',
                                                sanitizeName(e.target.value),
                                            )
                                        }
                                        placeholder="Doe"
                                        required
                                    />
                                </FormField>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <FormField
                                    label="Date of birth"
                                    required
                                    error={errors.date_of_birth}
                                >
                                    <Input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) =>
                                            setData(
                                                'date_of_birth',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </FormField>
                                <FormField label="Age">
                                    <Input
                                        value={age ?? ''}
                                        readOnly
                                        placeholder="Auto"
                                    />
                                </FormField>
                                <FormField
                                    label="Civil status"
                                    error={errors.civil_status}
                                >
                                    <Select
                                        value={data.civil_status}
                                        onValueChange={(v) =>
                                            setData('civil_status', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CIVIL_STATUSES.map((s) => (
                                                <SelectItem
                                                    key={s.toLowerCase()}
                                                    value={s.toLowerCase()}
                                                >
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Gender{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['male', 'female', 'other'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setData('gender', g)}
                                            className={cn(
                                                'h-10 rounded-lg border text-sm font-medium capitalize transition-colors',
                                                data.gender === g
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-background text-foreground hover:bg-muted',
                                            )}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.gender} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Occupation"
                                    error={errors.occupation}
                                >
                                    <Input
                                        value={data.occupation}
                                        onChange={(e) =>
                                            setData(
                                                'occupation',
                                                sanitizeFreeText(
                                                    e.target.value,
                                                    100,
                                                ),
                                            )
                                        }
                                        placeholder="e.g. Student"
                                    />
                                </FormField>
                                <FormField
                                    label="Nationality"
                                    error={errors.nationality}
                                >
                                    <Input
                                        value={data.nationality}
                                        onChange={(e) =>
                                            setData(
                                                'nationality',
                                                sanitizeFreeText(
                                                    e.target.value,
                                                    100,
                                                ),
                                            )
                                        }
                                        placeholder="Filipino"
                                    />
                                </FormField>
                            </div>
                        </SectionCard>

                        <SectionCard
                            ref={contactRef}
                            step={2}
                            title="Contact & Address"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Phone"
                                    required
                                    error={errors.phone}
                                >
                                    <Input
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData(
                                                'phone',
                                                sanitizePhone(e.target.value),
                                            )
                                        }
                                        placeholder="09XX XXX XXXX"
                                        required
                                    />
                                </FormField>
                                <FormField label="Email" error={errors.email}>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData(
                                                'email',
                                                sanitizeFreeText(
                                                    e.target.value,
                                                    255,
                                                ),
                                            )
                                        }
                                        placeholder="name@email.com"
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label="Street address"
                                error={errors.street_address}
                            >
                                <Input
                                    value={data.street_address}
                                    onChange={(e) =>
                                        setData(
                                            'street_address',
                                            sanitizeFreeText(
                                                e.target.value,
                                                500,
                                            ),
                                        )
                                    }
                                    placeholder="House no., street, barangay"
                                />
                            </FormField>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="City" error={errors.city}>
                                    <Input
                                        value={data.city}
                                        onChange={(e) =>
                                            setData(
                                                'city',
                                                sanitizeFreeText(
                                                    e.target.value,
                                                    100,
                                                ),
                                            )
                                        }
                                        placeholder="Zamboanga City"
                                    />
                                </FormField>
                                <FormField
                                    label="Province"
                                    error={errors.province}
                                >
                                    <Input
                                        value={data.province}
                                        onChange={(e) =>
                                            setData(
                                                'province',
                                                sanitizeFreeText(
                                                    e.target.value,
                                                    100,
                                                ),
                                            )
                                        }
                                        placeholder="Zamboanga del Sur"
                                    />
                                </FormField>
                            </div>
                        </SectionCard>

                        <SectionCard
                            ref={emergencyRef}
                            step={3}
                            title="Emergency Contact"
                        >
                            <div className="grid gap-4 sm:grid-cols-3">
                                <FormField
                                    label="Full name"
                                    error={errors.emergency_contact_name}
                                >
                                    <Input
                                        value={data.emergency_contact_name}
                                        onChange={(e) =>
                                            setData(
                                                'emergency_contact_name',
                                                sanitizeName(e.target.value),
                                            )
                                        }
                                        placeholder="Contact name"
                                    />
                                </FormField>
                                <FormField
                                    label="Relationship"
                                    error={
                                        errors.emergency_contact_relationship
                                    }
                                >
                                    <Input
                                        value={
                                            data.emergency_contact_relationship
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'emergency_contact_relationship',
                                                sanitizeFreeText(
                                                    e.target.value,
                                                    50,
                                                ),
                                            )
                                        }
                                        placeholder="e.g. Guardian"
                                    />
                                </FormField>
                                <FormField
                                    label="Phone"
                                    error={errors.emergency_contact_phone}
                                >
                                    <Input
                                        value={data.emergency_contact_phone}
                                        onChange={(e) =>
                                            setData(
                                                'emergency_contact_phone',
                                                sanitizePhone(e.target.value),
                                            )
                                        }
                                        placeholder="09XX XXX XXXX"
                                    />
                                </FormField>
                            </div>
                        </SectionCard>

                        <SectionCard
                            ref={medicalRef}
                            step={4}
                            title="Medical Baseline"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Blood type"
                                    error={errors.blood_type}
                                >
                                    <Select
                                        value={data.blood_type}
                                        onValueChange={(v) =>
                                            setData('blood_type', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BLOOD_TYPES.map((bt) => (
                                                <SelectItem key={bt} value={bt}>
                                                    {bt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                                <FormField
                                    label="Known allergies"
                                    error={errors.allergies}
                                >
                                    <Input
                                        value={data.allergies}
                                        onChange={(e) =>
                                            setData(
                                                'allergies',
                                                sanitizeFreeText(
                                                    e.target.value,
                                                    1000,
                                                ),
                                            )
                                        }
                                        placeholder="e.g. Penicillin, latex"
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label="Medical history / notes"
                                error={errors.medical_history}
                            >
                                <Textarea
                                    value={data.medical_history}
                                    onChange={(e) =>
                                        setData(
                                            'medical_history',
                                            sanitizeFreeText(
                                                e.target.value,
                                                2000,
                                            ),
                                        )
                                    }
                                    placeholder="Chronic conditions, medications, prior surgeries..."
                                    rows={4}
                                />
                            </FormField>
                        </SectionCard>

                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="gap-2"
                            >
                                <Check className="h-4 w-4" />
                                {processing
                                    ? 'Registering…'
                                    : 'Register patient'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                            >
                                Save draft
                            </Button>
                        </div>
                    </div>

                    <aside className="hidden lg:block">
                        <Card className="sticky top-6 p-5">
                            <h2 className="mb-4 text-sm font-semibold">
                                Registration
                            </h2>
                            <nav className="space-y-3">
                                {steps.map((s, idx) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => scrollToStep(idx)}
                                        className="flex w-full items-center gap-3 text-left"
                                    >
                                        <span
                                            className={cn(
                                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors',
                                                activeStep === s.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            {s.id}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-sm font-medium',
                                                activeStep === s.id
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {s.title}
                                        </span>
                                    </button>
                                ))}
                            </nav>
                            <div className="mt-6 rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                                <p className="mb-1">
                                    Fields marked * are required.
                                </p>
                                <p>
                                    Medical baseline drives allergy alerts
                                    during booking.
                                </p>
                            </div>
                        </Card>
                    </aside>
                </form>
            </div>
        </>
    );
}

type SectionCardProps = {
    children: React.ReactNode;
    step: number;
    title: string;
};

const SectionCard = forwardRef<HTMLDivElement, SectionCardProps>(
    function SectionCard({ children, step, title }, ref) {
        return (
            <div ref={ref}>
                <Card className="overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-border p-5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                            {step}
                        </span>
                        <h2 className="text-base font-semibold">{title}</h2>
                    </div>
                    <CardContent className="grid gap-5 p-5">
                        {children}
                    </CardContent>
                </Card>
            </div>
        );
    },
);

const FormField = ({
    children,
    label,
    required = false,
    error,
}: {
    children: React.ReactNode;
    label: string;
    required?: boolean;
    error?: string;
}) => {
    return (
        <div className="space-y-2">
            <Label>
                {label}
                {required && <span className="text-destructive"> *</span>}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
};

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Patients', href: patients() },
            { title: 'Register Patient', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
