import type { Metadata } from 'next';
import { MarketingAudiencePage } from '@/components/marketing-audience-page';

export const metadata: Metadata = {
  title: 'Coloring Pages for Parents — MyPaperPop',
  description: 'Make custom printable coloring pages for exactly what your kid asked for. Three free pages a day, no card.',
  alternates: { canonical: '/for-parents' },
};

export default function ForParentsPage() {
  return (
    <MarketingAudiencePage
      eyebrow="For parents"
      headline={<>When they say<br /><span className="text-[var(--orange)]">&quot;draw me a—&quot;</span><br />you say &quot;got it.&quot;</>}
      body="Your kid's imagination runs fast. MyPaperPop keeps up: type their wish, print the page, hand over the crayons. Three minutes flat."
      cta="Make your first page"
      primaryImage="/paperpop/coloring-puppy.png"
      primaryPrompt="puppy in a garden"
      secondaryImage="/paperpop/coloring-bunny.png"
      secondaryPrompt="bunny with a carrot"
      cardsTitle="What parents actually use it for"
      cards={[
        { title: 'Rainy-Saturday afternoons', body: 'Kid bored. House loud. Print four pages of whatever they are obsessed with this week.' },
        { title: 'Birthday party favors', body: 'Personalized pages are cheaper and more memorable than another plastic goody bag.' },
        { title: 'Summer break activities', body: 'Turn their latest obsession into a fresh printable page when the long summer days need something new.' },
        { title: 'Quiet time', body: 'A fresh page buys a little calm without opening another video app.' },
        { title: 'Friends visiting', body: 'When every kid asks for a different thing, make each one their own sheet.' },
        { title: 'Weird requests', body: 'A taco riding a shark? Sure. The whole point is drawing what coloring books do not have.' },
      ]}
      testimonial={{
        quote: 'My daughter asked for a hippo astronaut at breakfast. She had it colored before lunch.',
        byline: 'Sarah L., mom of two',
      }}
    />
  );
}
