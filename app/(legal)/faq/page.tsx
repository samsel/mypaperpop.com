import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/json-ld';
import { StickerBurst } from '@/components/paper-studio';

export const metadata: Metadata = {
  title: 'FAQ — MyPaperPop',
  description: 'Quick answers about making, refining, printing, and sharing MyPaperPop coloring pages.',
  alternates: { canonical: '/faq' },
};

const sections = [
  {
    group: 'Getting started',
    items: [
      ['What is MyPaperPop?', 'A coloring-page generator. You describe what you want, we draw it, you print it. Pages are clean black-and-white outlines, ready to color.'],
      ['Who is it for?', 'Parents of kids 2-12, teachers in classrooms K-5, and anyone who likes coloring and wants something specific.'],
      ['Do I need an account?', 'Yes, but no card up front. Sign in, then start with 3 free pages a day.'],
    ],
  },
  {
    group: 'Coloring pages & pricing',
    items: [
      ['Do paid coloring pages expire?', 'Never. Buy them once, use them whenever.'],
      ['Is there a subscription?', 'No. Only one-time coloring page packs.'],
      ['What if I run out?', 'Buy a pack, wait until midnight for free pages to refresh, or invite a friend so you both get more pages.'],
      ['Can I get a refund?', 'Yes. Within 30 days, email us and we will help.'],
    ],
  },
  {
    group: 'The technology',
    items: [
      ['How does generation work?', 'You type a prompt, we make a print-ready outline page, and you can keep refining in the same sketchpad.'],
      ['Will it draw inappropriate stuff?', 'We use child-safety guardrails and redirect unsafe prompts.'],
      ['Can I edit the page after?', 'Yes. Ask for changes like “add a rainbow” or “make it simpler”. Each visual refine uses one coloring page.'],
    ],
  },
  {
    group: 'Privacy & safety',
    items: [
      ['Do you store our pages?', 'Yes, in your sketchpad. You can delete pages or your account.'],
      ['Are children using the app directly?', 'No. MyPaperPop is parent-and-teacher-facing.'],
      ['Can teachers use it?', 'Yes. It is designed for teacher-created, printed classroom pages.'],
    ],
  },
] as const;

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: sections.flatMap((section) =>
    section.items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    }))
  ),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <section className="text-center">
        <h1 className="font-display text-6xl leading-none sm:text-7xl">
          Common questions,<br />quick answers.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--ink)]/72">
          Can&apos;t find what you need? Email <a className="font-semibold underline" href="mailto:goodcreatorllc@gmail.com">goodcreatorllc@gmail.com</a>. A real human reads every message.
        </p>
      </section>

      <section className="mt-10 space-y-8">
        {sections.map((section) => (
          <div key={section.group}>
            <h2 className="border-b-[1.5px] border-[var(--ink)] pb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)]/60">
              {section.group}
            </h2>
            <div>
              {section.items.map(([question, answer], index) => (
                <details key={question} open={index < 2 && section.group === 'Getting started'} className="group border-b border-dashed border-[var(--ink)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="font-display text-2xl leading-none">{question}</span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border-[1.5px] border-[var(--ink)] text-lg">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:block">-</span>
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-5 text-[15px] leading-7 text-[var(--ink)]/80">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12 flex flex-col gap-4 rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--blue)] p-6 text-white sm:flex-row sm:items-center">
        <StickerBurst size={56} fill="var(--yellow)" />
        <div className="flex-1">
          <h2 className="font-display text-3xl leading-none" style={{ color: '#fff' }}>Still stuck?</h2>
          <p className="mt-2 text-sm leading-6 text-white/85">Email goodcreatorllc@gmail.com. We reply within a business day, usually faster.</p>
        </div>
        <a className="paper-hover rounded-full bg-white px-5 py-2 text-sm font-semibold text-[var(--ink)]" href="mailto:goodcreatorllc@gmail.com">
          Email us
        </a>
      </section>
    </>
  );
}
