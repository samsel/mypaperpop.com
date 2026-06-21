import { StickerBurst } from '@/components/paper-studio';

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
    return <StickerBurst size={32} className={className} />;
}
