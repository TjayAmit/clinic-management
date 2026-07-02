import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    showRole = false,
    role,
    avatarClassName,
    avatarFallbackClassName,
    className,
}: {
    user: User;
    showEmail?: boolean;
    showRole?: boolean;
    role?: string;
    avatarClassName?: string;
    avatarFallbackClassName?: string;
    className?: string;
}) {
    const getInitials = useInitials();

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <Avatar
                className={cn(
                    'h-8 w-8 overflow-hidden rounded-full',
                    avatarClassName,
                )}
            >
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback
                    className={cn(
                        'rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white',
                        avatarFallbackClassName,
                    )}
                >
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
                {showRole && role && (
                    <span className="truncate text-xs text-sidebar-foreground/70">
                        {role}
                    </span>
                )}
            </div>
        </div>
    );
}
