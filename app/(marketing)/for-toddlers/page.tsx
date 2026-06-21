import type { Metadata } from 'next';
import { MarketingAudiencePage } from '@/components/marketing-audience-page';

export const metadata: Metadata = {
  title: 'Coloring Pages for Toddlers — MyPaperPop',
  description: 'Simple toddler coloring pages for ages 2-4 with big shapes, thick lines, and one clear subject.',
  alternates: { canonical: '/for-toddlers' },
};

export default function ForToddlersPage() {
  return (
    <MarketingAudiencePage
      eyebrow="For toddlers · ages 2-4"
      wash="rgba(244, 194, 194, 0.32)"
      headline={<>Big shapes.<br />Thick lines.<br /><span className="text-[var(--orange)]">One animal</span> per page.</>}
      body="Toddler mode is tuned for chubby fingers and short attention spans: simple subjects, fat outlines, and room to scribble."
      cta="Make a toddler page"
      primaryImage="/paperpop/coloring-bunny.png"
      primaryPrompt="bunny holding a carrot"
      cardsTitle="What we change for tiny humans"
      cards={[
        { title: 'One subject', body: 'Just the bunny, not a whole garden of tiny background details.' },
        { title: 'Thick outlines', body: 'Crayon-friendly lines that are easy to see and follow.' },
        { title: 'Round shapes', body: 'Friendly eyes, soft curves, no scary teeth or claws.' },
        { title: 'White space', body: 'The page leaves room for big scribbles and color experiments.' },
        { title: 'No text', body: 'Labels and word art wait until older modes.' },
        { title: 'Gentle prompts', body: 'Big requests become toddler-safe pages without losing the idea.' },
      ]}
      galleryTitle="Popular toddler prompts"
      gallery={[
        { image: '/paperpop/coloring-bunny.png', prompt: 'bunny' },
        { image: '/paperpop/coloring-puppy.png', prompt: 'puppy' },
        { image: '/paperpop/coloring-teddy.png', prompt: 'teddy bear' },
        { image: '/paperpop/coloring-dino.png', prompt: 'happy dino' },
      ]}
    />
  );
}
