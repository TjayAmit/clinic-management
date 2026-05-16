import { useMemo, useCallback } from 'react';
import { usePage } from '@inertiajs/react';

interface FeatureFlags {
    [key: string]: boolean;
}

interface UseFeatureFlagsReturn {
    featureFlags: FeatureFlags;
    isEnabled: (key: string) => boolean;
}

export function useFeatureFlags(): UseFeatureFlagsReturn {
    const { props } = usePage();
    
    const featureFlags = useMemo(() => {
        const flags: FeatureFlags = {};
        
        if (props.featureFlags && typeof props.featureFlags === 'object') {
            Object.entries(props.featureFlags).forEach(([key, value]) => {
                flags[key] = Boolean(value);
            });
        }
        
        return flags;
    }, [props.featureFlags]);

    const isEnabled = useCallback((key: string): boolean => {
        return featureFlags[key] ?? false;
    }, [featureFlags]);
    
    return { featureFlags, isEnabled };
}