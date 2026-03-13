'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type BackButtonProps = {
    href?: string;
    ariaLabel?: string;
    className?: string;
};

export function BackButton({ href, ariaLabel = 'Volver', className = '' }: BackButtonProps) {
    const router = useRouter();

    const baseClasses =
        'w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 border border-white/15 text-gray-200';

    if (href) {
        return (
            <Link
                href={href}
                aria-label={ariaLabel}
                className={`${baseClasses} ${className}`.trim()}
            >
                <ArrowLeft className="w-5 h-5" />
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={() => router.back()}
            aria-label={ariaLabel}
            className={`${baseClasses} ${className}`.trim()}
        >
            <ArrowLeft className="w-5 h-5" />
        </button>
    );
}

