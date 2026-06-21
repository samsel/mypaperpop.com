import { Reveal } from '@/components/reveal';

const testimonials = [
  {
    quote:
      'My daughter asks to use it every single day. She describes the wildest characters and then colors them for hours.',
    name: 'Sarah M.',
    role: 'Parent of two',
  },
  {
    quote:
      'I use it for my classroom reward time. The kids love describing their own coloring pages \u2014 it keeps them so engaged.',
    name: 'Ms. Rivera',
    role: '2nd grade teacher',
  },
  {
    quote:
      'We replaced screen time with coloring time. He describes a character, we print it, and he colors it. Win-win.',
    name: 'James T.',
    role: 'Dad & homeschooler',
  },
];

export function LandingSocialProof() {
  return (
    <section className="bg-[var(--blue)] py-16 text-[var(--paper)] sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="reveal-fade-in">
          <h2 className="mb-12 text-center font-display text-4xl text-[var(--paper)] sm:text-5xl">
            Loved by parents and teachers
          </h2>
        </Reveal>
        <Reveal className="reveal-stagger-in grid md:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((t) => (
            <div key={t.name} className="text-center md:text-left">
              <p className="text-lg leading-relaxed text-[var(--paper)]/80 sm:text-xl">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5">
                <span className="text-sm font-semibold text-[var(--paper)]">
                  {t.name}
                </span>
                <span className="ml-2 text-sm text-[var(--paper)]/55">{t.role}</span>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
