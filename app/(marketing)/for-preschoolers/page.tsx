import type { Metadata } from 'next';
import { MarketingAudiencePage } from '@/components/marketing-audience-page';

export const metadata: Metadata = {
  title: 'Preschool Coloring Pages — MyPaperPop',
  description: 'Preschool coloring pages for ages 4-6. Set your child’s age and MyPaperPop makes simple, age-appropriate pages.',
  alternates: { canonical: '/for-preschoolers' },
};

export default function ForPreschoolersPage() {
  return (
    <MarketingAudiencePage
      eyebrow="For preschoolers · ages 4-6"
      wash="rgba(168, 198, 159, 0.32)"
      headline={<>Set the age.<br />Get <span className="text-[var(--orange)]">preschool</span><br />pages.</>}
      body="Choose your child’s age, describe what they like, and MyPaperPop makes a coloring page with simple shapes, clear outlines, and just-right detail for little hands."
      cta="Make a preschool page"
      primaryImage="/paperpop/coloring-baby-dragon.png"
      primaryPrompt="baby dragon in a garden"
      cardsTitle="Made for preschool hands"
      cards={[
        { title: 'Simple outlines', body: 'Big shapes and clean lines that are easier for little hands to color.' },
        { title: 'Familiar ideas', body: 'Animals, vehicles, toys, seasons, and favorite themes they already know.' },
        { title: 'Age-aware detail', body: 'Less clutter for younger kids, with room for more detail as they grow.' },
        { title: 'Friendly faces', body: 'Clear expressions make it easy for kids to tell a story while they color.' },
        { title: 'Tiny captions', body: 'Short page labels are easy to sound out or say aloud.' },
        { title: 'Conversation starters', body: 'What is the dragon named? Where is the bunny going?' },
      ]}
      galleryTitle="Preschooler-friendly prompts"
      gallery={[
        { image: '/paperpop/coloring-baby-dragon.png', prompt: 'baby dragon' },
        { image: '/paperpop/coloring-mermaid.png', prompt: 'mermaid and dolphins' },
        { image: '/paperpop/coloring-teddy.png', prompt: 'teddy bear picnic' },
        { image: '/paperpop/coloring-treehouse.png', prompt: 'treehouse in space' },
      ]}
    />
  );
}
