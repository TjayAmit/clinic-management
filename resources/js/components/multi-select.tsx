import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = 'Select options…',
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        const updated = value.includes(option)
            ? value.filter((v) => v !== option)
            : [...value, option];
        onChange(updated);
    };

    const removeOption = (e: React.MouseEvent, option: string) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== option));
    };

    return (
        <div ref={ref} className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    'flex w-full min-h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                    open && 'ring-3 ring-ring/50 border-ring'
                )}
            >
                <div className="flex flex-wrap items-center gap-1">
                    {value.length === 0 ? (
                        <span className="text-muted-foreground">{placeholder}</span>
                    ) : (
                        value.map((v) => (
                            <Badge
                                key={v}
                                variant="secondary"
                                className="flex items-center gap-1 pr-1 text-xs"
                            >
                                {v}
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => removeOption(e, v)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            removeOption(e as unknown as React.MouseEvent, v);
                                        }
                                    }}
                                    className="ml-0.5 inline-flex cursor-pointer items-center rounded-sm hover:bg-accent hover:text-accent-foreground"
                                >
                                    <X className="h-3 w-3" />
                                </span>
                            </Badge>
                        ))
                    )}
                </div>
                <ChevronDown
                    className={cn(
                        'ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                        open && 'rotate-180'
                    )}
                />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
                    <div className="max-h-60 overflow-auto p-1">
                        {options.map((option) => (
                            <label
                                key={option}
                                htmlFor={`ms-${option}`}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                <Checkbox
                                    id={`ms-${option}`}
                                    checked={value.includes(option)}
                                    onCheckedChange={() => toggleOption(option)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
