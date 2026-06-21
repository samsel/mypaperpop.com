import type { Metadata } from 'next';
import { MarketingAudiencePage } from '@/components/marketing-audience-page';

export const metadata: Metadata = {
  title: 'Coloring Pages for Teachers — MyPaperPop',
  description: 'Printable coloring-page worksheets for any lesson plan, differentiated by age and ready for class.',
  alternates: { canonical: '/for-teachers' },
};

export default function ForTeachersPage() {
  return (
    <MarketingAudiencePage
      eyebrow="For teachers"
      accent="blue"
      headline={<>A worksheet<br />for <span className="text-[var(--orange)]">every</span><br />lesson plan.</>}
      body="Themed pages on demand. Tied to your unit. Differentiated by age. Ready before class starts."
      cta="Get classroom access"
      primaryImage="/paperpop/coloring-dino.png"
      primaryPrompt="Unit 4 · prehistoric life"
      secondaryImage="/paperpop/coloring-astronaut.png"
      secondaryPrompt="Unit 8 · solar system"
      cardsTitle="Built for the classroom, not the boardroom"
      cards={[
        { title: 'Class-wide access', body: 'Make page sets for the whole class without sending students into the app.' },
        { title: 'Theme packs', body: 'Animals, space, geography, holidays, history. Tap-and-print starting points.' },
        { title: 'Age modes', body: 'Same topic, four detail levels. Print a simpler and more detailed version side by side.' },
        { title: 'Batch-friendly', body: 'Use the print preview to prep home-printer pages quickly.' },
        { title: 'No student accounts', body: 'Teachers make and print. Kids color on paper.' },
        { title: 'Lesson captions', body: 'Keep a short caption with the page for folders, stations, and substitute plans.' },
      ]}
      galleryTitle="Theme packs ready to print"
      gallery={[
        { image: '/paperpop/coloring-dino.png', prompt: 'Dinosaurs' },
        { image: '/paperpop/coloring-astronaut.png', prompt: 'Solar system' },
        { image: '/paperpop/coloring-bunny.png', prompt: 'Farm animals' },
        { image: '/paperpop/coloring-mermaid.png', prompt: 'Under the sea' },
      ]}
      testimonial={{
        quote: 'I generated personalized pages for my 1st-grade class. Best 15 minutes of prep I have done.',
        byline: 'Ms. Hartman · 1st grade',
        blue: true,
      }}
    />
  );
}
