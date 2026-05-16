import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as features, store as featuresStore } from '@/routes/features';

const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;
const KEY_MAX = 100;

function deriveKey(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        key: '',
        description: '',
        is_enabled: false,
    });

    const [keyManuallySet, setKeyManuallySet] = useState(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[<>{}]/g, '').slice(0, NAME_MAX);
        setData((prev) => ({
            ...prev,
            name: raw,
            key: keyManuallySet ? prev.key : deriveKey(raw).slice(0, KEY_MAX),
        }));
    };

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, KEY_MAX);
        setKeyManuallySet(sanitized.length > 0);
        setData('key', sanitized);
    };

    const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setData('name', e.target.value.replace(/[<>{}]/g, '').trim());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(featuresStore.url());
    };

    return (
        <>
            <Head title="New Feature" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={features()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Feature Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    onBlur={handleNameBlur}
                                    placeholder="e.g. Two-Factor Authentication"
                                    maxLength={NAME_MAX}
                                    required
                                />
                                {data.name.length > 0 && (
                                    <p className="text-right text-xs text-muted-foreground">
                                        {data.name.length}/{NAME_MAX}
                                    </p>
                                )}
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="key">Key <span className="text-destructive">*</span></Label>
                                <Input
                                    id="key"
                                    value={data.key}
                                    onChange={handleKeyChange}
                                    placeholder="e.g. two_factor_auth"
                                    maxLength={KEY_MAX}
                                    required
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        Lowercase letters, numbers, hyphens, and underscores only.
                                        {!keyManuallySet && data.name.length > 0 && (
                                            <span className="ml-1 italic">Auto-generated from name.</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{data.key.length}/{KEY_MAX}</p>
                                </div>
                                <InputError message={errors.key} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <div className="relative">
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value.slice(0, DESCRIPTION_MAX))}
                                        placeholder="What this feature controls…"
                                        className="min-h-[120px] resize-none"
                                        maxLength={DESCRIPTION_MAX}
                                    />
                                    <p className="mt-1 text-right text-xs text-muted-foreground">
                                        {data.description.length}/{DESCRIPTION_MAX}
                                    </p>
                                </div>
                                <InputError message={errors.description} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-full flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="is_enabled"
                                    checked={data.is_enabled}
                                    onCheckedChange={(v) => setData('is_enabled', v)}
                                />
                                <Label htmlFor="is_enabled">Enabled</Label>
                            </div>

                            <div className="mt-auto flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating…' : 'Create Feature'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={features()}>Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Features', href: features() },
            { title: 'New Feature', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
