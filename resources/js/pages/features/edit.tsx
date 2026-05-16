import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    index as features,
    show as featuresShow,
    update as featuresUpdate,
} from '@/routes/features';
import type { FeaturesFormProps } from '@/types';

const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

export default function Edit({ feature }: FeaturesFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: feature?.name ?? '',
        key: feature?.key ?? '',
        description: feature?.description ?? '',
        is_enabled: feature?.is_enabled ?? false,
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('name', e.target.value.replace(/[<>{}]/g, '').slice(0, NAME_MAX));
    };

    const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setData('name', e.target.value.replace(/[<>{}]/g, '').trim());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (feature) {
put(featuresUpdate.url(feature.id));
}
    };

    return (
        <>
            <Head title="Edit Feature" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={feature ? featuresShow(feature.id) : features()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
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
                                    disabled
                                    placeholder="e.g. two_factor_auth"
                                    aria-describedby="key-note"
                                />
                                <p id="key-note" className="text-xs text-muted-foreground">
                                    Keys cannot be changed after creation — changing them would break existing references.
                                </p>
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
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={feature ? featuresShow(feature.id) : features()}>Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Features', href: features() },
            { title: 'Edit Feature', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
