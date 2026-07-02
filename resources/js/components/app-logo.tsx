import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const name = usePage().props.name as string;

    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <AppLogoIcon className="size-6 fill-current" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold text-sidebar-foreground">
                    {name}
                </span>
                <span className="text-[10px] text-sidebar-foreground/70">
                    Dental Care Suite
                </span>
            </div>
        </>
    );
}
