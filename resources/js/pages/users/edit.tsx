import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/multi-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { index as users, show as usersShow, update as usersUpdate } from '@/routes/users';
import type { UsersFormProps } from '@/types';

export default function Edit({ user, roles }: UsersFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roles: (user?.roles as Array<{ name: string }> ?? []).map((r) => r.name),
    });


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            put(usersUpdate.url(user.id));
        }
    };

    return (
        <>
            <Head title="Edit User" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={user ? usersShow(user.id) : users()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
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
                                    <Label>Roles <span className="text-destructive">*</span></Label>
                                    <MultiSelect
                                        options={roles}
                                        value={data.roles}
                                        onChange={(value) => setData('roles', value)}
                                        placeholder="Select roles…"
                                    />
                                    <InputError message={errors.roles} />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={user ? usersShow(user.id) : users()}>Cancel</Link>
                                    </Button>
                                </div>

                            </CardContent>
                        </Card>
                    </form>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Note</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex gap-3">
                                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <p>To change the password, the user can do so from their <span className="font-medium text-foreground">Security Settings</span> page.</p>
                            </div>
                            {user && (
                                <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
                                    <p className="font-medium text-foreground">Account created</p>
                                    <p className="mt-0.5">{user.created_at}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Users', href: users() },
            { title: 'Edit User', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
