import type { SVGProps } from 'react';

export default function AppLogoIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 7.5 7 9 7 9C7 10.5 7 11.5 7.5 12.5C8 13.5 8 14 8 15C8 17 9 22 10.5 22C11.5 22 11.5 20 12 18C12.5 20 12.5 22 13.5 22C15 22 16 17 16 15C16 14 16 13.5 16.5 12.5C17 11.5 17 10.5 17 9C17 9 17.5 7.5 17 5.5C16.5 3.5 14.5 2 12 2Z" />
        </svg>
    );
}
