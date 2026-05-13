import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    index as services,
    show as servicesShow,
    update as servicesUpdate,
} from '@/routes/services';
import type { ServicesFormProps } from '@/types';

export default function Edit({ service }: ServicesFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: service?.name ?? '',
        description: service?.description ?? '',
        price: service?.price ?? '',
        duration_minutes: String(service?.duration_minutes ?? 30),
        is_active: service?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (service) put(servicesUpdate.url(service.id));
    };

    return (
        <>
            <Head title="Edit Service" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={service ? servicesShow(service.id) : services()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Service Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Service Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. General Check-up"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of what this service covers…"
                                    className="min-h-[180px] resize-none"
                                />
                                <InputError message={errors.description} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Pricing & Availability</CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-full flex-col gap-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₱) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    <InputError message={errors.price} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration_minutes">Duration (min) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="duration_minutes"
                                        type="number"
                                        min="5"
                                        step="5"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', e.target.value)}
                                        placeholder="30"
                                        required
                                    />
                                    <InputError message={errors.duration_minutes} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(v) => setData('is_active', Boolean(v))}
                                />
                                <Label htmlFor="is_active">Active (available for booking)</Label>
                            </div>

                            <div className="mt-auto flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={service ? servicesShow(service.id) : services()}>Cancel</Link>
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
            { title: 'Services', href: services() },
            { title: 'Edit Service', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
