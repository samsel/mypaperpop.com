import Link from 'next/link';
import type React from 'react';
import { Sheet, StickerBurst } from '@/components/paper-studio';

type AudiencePageProps = {
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
  cta: string;
  accent?: 'orange' | 'blue';
  wash?: string;
  primaryImage: string;
  secondaryImage?: string;
  primaryPrompt: string;
  secondaryPrompt?: string;
  cardsTitle: string;
  cards: Array<{ title: string; body: string }>;
  galleryTitle?: string;
  gallery?: Array<{ image: string; prompt: string; label?: string }>;
  testimonial?: { quote: string; byline: string; blue?: boolean };
};

export function MarketingAudiencePage({
  eyebrow,
  headline,
  body,
  cta,
  accent = 'orange',
  wash,
  primaryImage,
  secondaryImage,
  primaryPrompt,
  secondaryPrompt,
  cardsTitle,
  cards,
  galleryTitle,
  gallery,
  testimonial,
}: AudiencePageProps) {
  const accentColor = accent === 'blue' ? 'var(--blue)' : 'var(--orange)';

  return (
    <div>
      <section className="px-4 py-12 sm:px-6 lg:px-10 lg:py-16" style={wash ? { background: `linear-gradient(180deg, ${wash} 0%, transparent 100%)` } : undefined}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: accentColor }}>{eyebrow}</p>
            <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">
              {headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--ink)]/82">{body}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/#sign-up" className="paper-hover rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-6 py-3 font-display text-lg leading-none text-[var(--paper)]">
                {cta}
              </Link>
            </div>
          </div>
          <div className="relative min-h-[420px]">
            <Sheet image={primaryImage} prompt={primaryPrompt} rotate="-2deg" showReady={false} className="absolute left-0 top-0 w-[84%]" />
            {secondaryImage && secondaryPrompt ? (
              <Sheet image={secondaryImage} prompt={secondaryPrompt} rotate="3deg" showReady={false} className="absolute bottom-0 right-0 z-10 w-[68%]" />
            ) : null}
            <StickerBurst size={70} className="absolute right-8 top-8 z-20 rotate-12" fill={accentColor} />
          </div>
        </div>
      </section>

      <section className="border-t-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] px-4 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-3xl font-display text-5xl leading-none sm:text-6xl">{cardsTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <article key={card.title} className="rounded-lg border-[1.5px] border-[var(--ink)] bg-white p-5">
                <h3 className="font-display text-2xl leading-none" style={{ color: accentColor }}>{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink)]/78">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {gallery?.length ? (
        <section className="px-4 py-14 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55">{galleryTitle ?? 'Popular prompts'}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {gallery.map((item) => (
                <figure key={item.prompt} className="rounded-lg border-[1.5px] border-[var(--ink)] bg-white p-2">
                  <div className="aspect-square overflow-hidden border border-[var(--ink)] bg-white">
                    <img src={item.image} alt={item.prompt} className="h-full w-full object-cover" />
                  </div>
                  <figcaption className="px-1 pt-2 font-hand text-base">&quot;{item.prompt}&quot;</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {testimonial ? (
        <section className={`border-t-[1.5px] border-[var(--ink)] px-4 py-16 text-center sm:px-6 lg:px-10 ${testimonial.blue ? 'bg-[var(--blue)] text-white' : ''}`}>
          <div className="mx-auto max-w-4xl">
            <p className="font-hand text-2xl" style={{ color: testimonial.blue ? 'var(--yellow)' : 'var(--orange)' }}>★ ★ ★ ★ ★</p>
            <blockquote className="mt-3 font-display text-4xl leading-tight">{testimonial.quote}</blockquote>
            <p className={`mt-5 text-sm ${testimonial.blue ? 'text-white/80' : 'text-[var(--ink)]/65'}`}>{testimonial.byline}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
