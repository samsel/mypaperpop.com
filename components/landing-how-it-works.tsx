import { Reveal } from '@/components/reveal';

const steps = [
  {
    number: '01',
    title: 'Describe it',
    description:
      'A dragon, a robot, your child\u2019s imaginary friend \u2014 type anything.',
  },
  {
    number: '02',
    title: 'AI draws it',
    description:
      'In seconds, get a clean sketch ready for coloring. Keep chatting to refine it until it\u2019s perfect.',
  },
  {
    number: '03',
    title: 'Print & color',
    description:
      'Download or print at home \u2014 optimized for standard paper.',
  },
  {
    number: '04',
    title: 'Show it off',
    description:
      'Snap a photo of the finished page. Color & Show creates a before/after you can save.',
  },
];

export function LandingHowItWorks() {
  return (
    <section className="bg-[var(--paper-card)] py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="reveal-fade-up">
          <h2 className="mb-12 text-center font-display text-4xl text-[var(--ink)] sm:text-5xl">
            How it works
          </h2>
        </Reveal>
        <Reveal className="reveal-stagger-up grid md:grid-cols-3 gap-10 lg:gap-16">
          {steps.map((step) => (
            <div key={step.number}>
              <span className="font-display text-5xl leading-none text-[var(--orange)] sm:text-6xl">
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-[var(--ink)]/65">
                {step.description}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
