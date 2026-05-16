import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { index as users, store as usersStore } from '@/routes/users';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(usersStore.url());
    };

    return (
        <>
            <Head title="Create User" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={users()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <form onSubmit={handleSubmit} className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-base">Account Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter full name"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="user@example.com"
                                            required
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating…' : 'Create User'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={users()}>Cancel</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Access & Permissions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex gap-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <p>After creating the account, assign a <span className="font-medium text-foreground">Role</span> from the Roles section to grant the appropriate permissions.</p>
                            </div>
                            <div className="flex gap-3">
                                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <p>The user will log in with their email and the password you set here. They can change it from their profile settings.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Users', href: users() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
