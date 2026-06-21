import { LandingDemo } from '@/components/landing-demo';
import { MobileGalleryCarousel } from '@/components/mobile-gallery-carousel';
import { LandingPricing } from '@/components/landing-pricing';
import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';
import { Polaroid, PublicCta, Sheet, Squiggle, StickerBurst, paperImages } from '@/components/paper-studio';
import Link from 'next/link';

const popularColoringPages = [
  ['Dinosaur coloring pages', '/coloring-pages/dinosaur-world'],
  ['Unicorn coloring pages', '/coloring-pages/unicorn'],
  ['Princess coloring pages', '/coloring-pages/princess'],
  ['Space coloring pages', '/coloring-pages/space-adventure'],
  ['Animal coloring pages', '/coloring-pages/animals'],
  ['Teacher coloring worksheets', '/coloring-pages/teacher-worksheets'],
  ['Preschool coloring pages', '/coloring-pages/preschool'],
  ['Ocean coloring pages', '/coloring-pages/under-the-sea'],
] as const;

export default async function HomePage() {
  const isAuthenticated = false;
  const featuredPaper = paperImages[0];
  const carouselPapers = paperImages.slice(1);
  return (
    <main className="b-paper min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <PublicHeader isAuthenticated={isAuthenticated} useAnchors />

      <section data-testid="landing-hero" className="px-4 py-7 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="min-w-0">
            <h1 className="max-w-3xl text-balance font-display text-5xl leading-[0.92] sm:text-7xl lg:text-8xl">
              AI coloring pages for <span className="relative inline-block text-[var(--orange)]">any wish<Squiggle className="absolute -bottom-3 left-0 w-full max-w-[280px]" /></span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--ink)]/80 sm:mt-8 sm:text-lg sm:leading-8">
              MyPaperPop is an AI coloring page generator for printable custom coloring pages for kids, parents, and teachers. Start with any idea, then keep chatting for bigger shapes, simpler lines, a new character, or a whole different scene.
            </p>

            <div className="mt-5 sm:mt-8">
              <LandingDemo isAuthenticated={isAuthenticated} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-[var(--ink)]/75 sm:mt-6 sm:flex sm:flex-wrap sm:items-center">
              <span className="font-semibold text-[var(--ink)]">4.9 from 2,100 parents</span>
              <span>Chat to refine</span>
              <span>3 free pages a day</span>
              <span>No card</span>
            </div>
          </div>

          <div data-testid="landing-sample-preview" className="relative min-h-[420px] min-w-0 overflow-hidden sm:min-h-[520px] sm:overflow-visible">
            <Sheet
              image="/paperpop/coloring-baby-dragon.png"
              prompt="a baby dragon in a flower field"
              rotate="-2deg"
              priority
              showReady={false}
              className="absolute left-0 top-0 w-[95%] sm:w-[88%]"
            />
            <Sheet
              image="/paperpop/coloring-puppy.png"
              prompt="puppy meets snail"
              rotate="3deg"
              showReady={false}
              className="absolute bottom-8 right-0 z-10 w-[70%] sm:bottom-3 sm:w-[62%]"
            />
            <StickerBurst size={70} className="absolute right-3 top-2 z-20 rotate-12 sm:right-10 sm:top-0 sm:size-[84px]" />
          </div>
        </div>
      </section>

      <section className="border-y-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--ink)]/60">Printable coloring page ideas</p>
              <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">Start with what kids already ask for.</h2>
            </div>
            <Link href="/for-teachers" className="text-sm font-semibold underline decoration-[var(--orange)] decoration-2 underline-offset-4">
              Classroom pages
            </Link>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularColoringPages.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="paper-hover rounded-lg border-[1.5px] border-[var(--ink)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)] shadow-[3px_3px_0_var(--ink)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-testid="landing-how-it-works" className="scroll-mt-14 border-y-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] px-4 py-10 sm:scroll-mt-20 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:gap-8 lg:grid-cols-[0.45fr_1.55fr]">
            <p className="text-xs font-bold uppercase text-[var(--ink)]/60">How it works</p>
            <h2 className="font-display text-4xl leading-none sm:text-6xl">Three steps. The third is the fun one.</h2>
          </div>
          <div className="mt-7 grid gap-5 border-t-[1.5px] border-[var(--ink)] pt-6 sm:mt-10 sm:gap-8 sm:pt-8 md:grid-cols-3">
            {[
              ['01', 'Describe it.', 'Type what your kid wants. Be wild, specific, or both.'],
              ['02', 'Chat to change it.', 'Ask for edits like simpler lines, a bigger puppy, more stars, or no background.'],
              ['03', 'Print the keeper.', 'Once the page looks right, download, print, color, and snap a photo.'],
            ].map(([n, title, body]) => (
              <div key={n} className="grid grid-cols-[4.25rem_1fr] gap-4 border-b border-dashed border-[var(--ink)]/35 pb-5 last:border-b-0 last:pb-0 md:block md:border-b-0 md:pb-0">
                <div className="font-display text-5xl leading-none text-[var(--orange)] sm:text-6xl">{n}</div>
                <div>
                  <h3 className="font-display text-2xl sm:mt-4 sm:text-3xl">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--ink)]/78 sm:mt-3 sm:text-base sm:leading-7">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 sm:hidden">
            <PublicCta isAuthenticated={isAuthenticated}>Try a page free</PublicCta>
          </div>
        </div>
      </section>

      <section id="gallery" data-testid="landing-gallery" className="scroll-mt-14 px-4 py-12 sm:scroll-mt-20 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--ink)]/60">Made this week</p>
              <h2 className="mt-2 font-display text-4xl leading-none sm:text-6xl">Real prompts, real kids.</h2>
            </div>
            <PublicCta isAuthenticated={isAuthenticated}>Draw yours</PublicCta>
          </div>
          <div data-testid="mobile-gallery-featured" className="mt-7 sm:hidden">
            <Polaroid
              image={featuredPaper.src}
              prompt={featuredPaper.prompt}
              className="shadow-[6px_7px_0_var(--ink)]"
            />
          </div>
          <div className="mt-6 sm:hidden">
            <div data-testid="mobile-gallery-scroll-cue" className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-2xl leading-none">More kid ideas</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]/65">Swipe sideways to browse prompts</p>
              </div>
              <div aria-hidden="true" className="flex h-11 min-w-11 items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--yellow)] shadow-[3px_3px_0_var(--ink)]">
                <span className="text-2xl leading-none">&rarr;</span>
              </div>
            </div>
            <MobileGalleryCarousel items={carouselPapers} />
          </div>
          <div data-testid="desktop-gallery-grid" className="mt-7 hidden grid-cols-1 gap-5 sm:mt-9 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {paperImages.map((item) => (
              <Polaroid key={item.src} image={item.src} prompt={item.prompt} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-4 py-12 text-[var(--paper)] sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          {[
            ['For parents', 'Boredom buster for any whim.', 'Your kid asks for a shark riding a unicorn. If it is not quite right, keep chatting until it is.', 'var(--orange)'],
            ['For teachers', 'A worksheet for every lesson plan.', 'Build a themed page, then tweak the difficulty, details, and scene before class starts.', 'var(--yellow)'],
          ].map(([eyebrow, title, body, accent]) => (
            <div key={eyebrow} className="border-l-2 pl-6" style={{ borderColor: accent }}>
              <p className="text-xs font-bold uppercase" style={{ color: accent }}>{eyebrow}</p>
              <h3 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{title}</h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--paper)]/75">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <LandingPricing currency="usd" isAuthenticated={isAuthenticated} />

      <section className="relative overflow-hidden border-t-[1.5px] border-[var(--ink)] bg-[var(--orange)] px-4 py-14 text-center text-white sm:px-6 sm:py-20">
        <StickerBurst size={72} fill="white" className="absolute left-10 top-10 hidden -rotate-12 sm:block" />
        <StickerBurst size={58} fill="var(--yellow)" className="absolute right-14 top-16 hidden rotate-6 sm:block" />
        <h2 className="mx-auto max-w-4xl font-display text-4xl leading-none sm:text-7xl">
          Make something nobody&apos;s drawn before.
        </h2>
        <div className="mt-8">
          <PublicCta isAuthenticated={isAuthenticated}>Start drawing free</PublicCta>
        </div>
        <p className="mt-5 font-hand text-xl">3 free pages a day · no card · made for kids and adults</p>
      </section>

      <PublicFooter />
    </main>
  );
}
