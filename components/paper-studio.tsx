import Image from 'next/image';
import Link from 'next/link';
import { cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils';

const STICKER_BURST_POINTS =
  '50,4 58.282,19.09 73,10.163 72.627,27.373 89.837,27 80.91,41.718 96,50 80.91,58.282 89.837,73 72.627,72.627 73,89.837 58.282,80.91 50,96 41.718,80.91 27,89.837 27.373,72.627 10.163,73 19.09,58.282 4,50 19.09,41.718 10.163,27 27.373,27.373 27,10.163 41.718,19.09';

export const paperImages = [
  { src: '/paperpop/coloring-baby-dragon.png', prompt: 'baby dragon in flowers' },
  { src: '/paperpop/coloring-astronaut.png', prompt: 'astronaut on the moon' },
  { src: '/paperpop/coloring-puppy.png', prompt: 'puppy meets snail' },
  { src: '/paperpop/coloring-mermaid.png', prompt: 'mermaid and dolphins' },
  { src: '/paperpop/coloring-dino.png', prompt: 'dinosaur reading a book' },
  { src: '/paperpop/coloring-bunny.png', prompt: 'bunny with a carrot' },
  { src: '/paperpop/coloring-teddy.png', prompt: 'teddy bear picnic' },
  { src: '/paperpop/coloring-treehouse.png', prompt: 'treehouse in space' },
];

export function StickerBurst({
  className,
  size = 40,
  fill = 'var(--orange)',
  smile = true,
}: {
  className?: string;
  size?: number;
  fill?: string;
  smile?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={cn('block', className)} aria-hidden="true">
      <polygon points={STICKER_BURST_POINTS} fill={fill} stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      {smile && (
        <>
          <circle cx="38" cy="46" r="3.5" fill="var(--ink)" />
          <circle cx="62" cy="46" r="3.5" fill="var(--ink)" />
          <path d="M 38 60 Q 50 70 62 60" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function PaperpopWordmark({ className, markSize = 30 }: { className?: string; markSize?: number }) {
  return (
    <span className={cn('inline-flex items-center text-[var(--ink)] font-display leading-none', className)}>
      <span>mypaperp</span>
      <span className="-mx-1 inline-block translate-y-[1px]">
        <StickerBurst size={markSize} smile={false} />
      </span>
      <span>p</span>
    </span>
  );
}

export function PaperLogo({ className }: { className?: string }) {
  return <StickerBurst size={28} className={className} />;
}

export function PaperButton({
  asChild,
  children,
  className,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'primary' | 'accent' | 'ghost';
}) {
  const classes = cn(
    'paper-hover inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-[1.5px] border-[var(--ink)] px-5 py-2 text-sm font-semibold',
    variant === 'primary' && 'bg-[var(--ink)] text-[var(--paper)]',
    variant === 'accent' && 'bg-[var(--orange)] text-white',
    variant === 'ghost' && 'bg-transparent text-[var(--ink)]',
    className
  );

  if (asChild && isValidElement<{ className?: string }>(children)) {
    return cloneElement(children, {
      className: cn(children.props.className, classes),
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg width="260" height="18" viewBox="0 0 260 18" className={cn('block', className)} aria-hidden="true">
      <path d="M4 12 C 42 2, 78 17, 120 8 S 198 17, 256 6" fill="none" stroke="var(--orange)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Sheet({
  image,
  prompt,
  className,
  rotate = '-1deg',
  priority,
  showReady = true,
}: {
  image: string;
  prompt: string;
  className?: string;
  rotate?: string;
  priority?: boolean;
  showReady?: boolean;
}) {
  return (
    <figure className={cn('paper-sheet overflow-hidden p-3', className)} style={{ transform: `rotate(${rotate})` }}>
      <div className="flex items-center justify-between px-1 pb-2 font-hand text-sm text-[var(--ink)]/75">
        <span>mypaperpop sheet</span>
        {showReady && <span>ready</span>}
      </div>
      <div className="paper-dashed bg-white p-2">
        <Image src={image} alt={prompt} width={900} height={900} priority={priority} className="h-auto w-full" />
      </div>
      <figcaption className="paper-dashed flex items-center justify-between gap-3 px-1 pt-3">
        <span className="font-hand text-sm">&quot;{prompt}&quot;</span>
        {showReady && <span className="rounded-full bg-[var(--orange)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">ready</span>}
      </figcaption>
    </figure>
  );
}

export function Polaroid({
  image,
  prompt,
  className,
  ...props
}: {
  image: string;
  prompt: string;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <figure className={cn('border-[1.5px] border-[var(--ink)] bg-white p-2', className)} {...props}>
      <div className="aspect-square overflow-hidden border border-[var(--ink)] bg-white">
        <Image src={image} alt={prompt} width={520} height={520} className="h-full w-full object-cover" />
      </div>
      <figcaption className="px-1 pb-1 pt-2 text-base leading-5 sm:text-xs sm:leading-normal">
        <span className="font-semibold">&quot;{prompt}&quot;</span>
      </figcaption>
    </figure>
  );
}

export function PublicCta({ isAuthenticated, children }: { isAuthenticated: boolean; children: React.ReactNode }) {
  if (isAuthenticated) {
    return (
      <Link href="/home" className="paper-hover inline-flex min-h-11 items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--paper)] sm:px-6">
        {children}
      </Link>
    );
  }

  return (
    <a
      href="/#sign-up"
      className="paper-hover inline-flex min-h-11 items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--paper)] sm:px-6"
    >
      {children}
    </a>
  );
}
