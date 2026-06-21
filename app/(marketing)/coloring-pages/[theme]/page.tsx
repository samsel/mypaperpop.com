import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { PROMPT_PACKS } from '@/lib/prompt-packs';
import { FREE_DAILY_LIMIT } from '@/lib/payments/config';
import { MarketingCta } from '@/components/marketing-cta';
import { PromptGrid } from '@/components/prompt-grid';

interface ThemeData {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  prompts: string[];
  sampleImages?: string[];
  relatedThemes: string[];
  faq: Array<{ question: string; answer: string }>;
}

function getPromptsForPack(packId: string): string[] {
  const pack = PROMPT_PACKS.find((p) => p.id === packId);
  return pack?.prompts ?? [];
}

const THEMES: Record<string, ThemeData> = {
  'dinosaur-world': {
    h1: 'Dinosaur Coloring Pages for Kids',
    metaTitle: 'Dinosaur Coloring Pages for Kids — Free AI Generator',
    metaDescription:
      'Generate free custom dinosaur coloring pages for kids in seconds. Describe any dino scene and print it instantly. Perfect for ages 4\u201312.',
    intro:
      'Bring prehistoric creatures to life with custom dinosaur coloring pages. Describe any dino scene you can imagine and our AI will draw it as a clean, printable coloring page in seconds.',
    prompts: getPromptsForPack('dinosaur-world'),
    sampleImages: [
      '/landing/dinosaur-reading-book.png',
      '/landing/baby-dragon-in-garden.png',
    ],
    relatedThemes: ['enchanted-forest', 'space-adventure', 'under-the-sea'],
    faq: [
      {
        question: 'Can I make custom dinosaur coloring pages?',
        answer:
          'Yes. Describe any dinosaur, habitat, or scene and MyPaperPop turns it into a printable black-and-white coloring page.',
      },
      {
        question: 'Are these dinosaur coloring pages free to try?',
        answer:
          'Yes. You can start with free daily coloring pages before buying any extra packs.',
      },
    ],
  },
  'space-adventure': {
    h1: 'Space Coloring Pages for Kids',
    metaTitle: 'Space Coloring Pages for Kids — Free Printable AI Generator',
    metaDescription:
      'Create custom space-themed coloring pages for kids. Rockets, planets, astronauts — describe any scene and print in seconds.',
    intro:
      'Blast off into creativity with custom space coloring pages. Describe any cosmic scene — astronauts, rockets, alien worlds — and get a printable coloring page in seconds.',
    prompts: getPromptsForPack('space-adventure'),
    sampleImages: [
      '/landing/space-rocket.jpg',
      '/landing/space-planets.jpg',
    ],
    relatedThemes: ['dinosaur-world', 'superhero-squad', 'transportation'],
    faq: [
      {
        question: 'Can kids make printable space coloring pages?',
        answer:
          'Yes. Kids, parents, and teachers can describe rockets, planets, astronauts, aliens, or moon scenes and print the result.',
      },
      {
        question: 'Can I simplify a space coloring page for younger kids?',
        answer:
          'Yes. After the first page is generated, ask for bigger shapes, fewer details, or thicker lines.',
      },
    ],
  },
  'under-the-sea': {
    h1: 'Ocean & Sea Coloring Pages for Kids',
    metaTitle: 'Ocean Coloring Pages for Kids — Free Printable Sea Animals',
    metaDescription:
      'Generate custom ocean and sea animal coloring pages for kids. Dolphins, turtles, whales — describe any underwater scene.',
    intro:
      'Dive into an underwater world of custom coloring pages. Describe any ocean creature or underwater scene and our AI will create a beautiful printable coloring page.',
    prompts: getPromptsForPack('under-the-sea'),
    sampleImages: [
      '/landing/sea-dolphin.jpg',
      '/landing/sea-animals.jpg',
    ],
    relatedThemes: ['dinosaur-world', 'farm-animals', 'enchanted-forest'],
    faq: [
      {
        question: 'What ocean animals can I turn into coloring pages?',
        answer:
          'You can ask for dolphins, whales, sharks, turtles, seahorses, mermaids, coral reefs, or any underwater scene.',
      },
      {
        question: 'Are ocean coloring pages printable?',
        answer:
          'Yes. MyPaperPop creates clean line-art pages designed to download and print at home or in class.',
      },
    ],
  },
  'enchanted-forest': {
    h1: 'Fairy Tale & Fantasy Coloring Pages',
    metaTitle:
      'Fairy Tale Coloring Pages for Kids — Unicorns, Fairies & Dragons',
    metaDescription:
      'Create magical fairy tale coloring pages for kids. Unicorns, fairies, dragons, treehouses — describe any fantasy scene.',
    intro:
      'Step into a world of magic with custom fairy tale coloring pages. Describe unicorns, fairies, enchanted castles, or any fantasy scene and watch it come to life.',
    prompts: getPromptsForPack('enchanted-forest'),
    sampleImages: [
      '/landing/forest-exploration.jpg',
      '/landing/forest-deep-woods.jpg',
    ],
    relatedThemes: ['dinosaur-world', 'under-the-sea', 'superhero-squad'],
    faq: [
      {
        question: 'Can I make unicorn and fairy tale coloring pages?',
        answer:
          'Yes. Describe unicorns, fairies, castles, dragons, enchanted forests, or any magical scene.',
      },
      {
        question: 'Can I adjust the fantasy page after it is drawn?',
        answer:
          'Yes. Keep chatting to add details, simplify the page, change a character, or create a new version.',
      },
    ],
  },
  'farm-animals': {
    h1: 'Farm Animal Coloring Pages for Kids',
    metaTitle: 'Farm Animal Coloring Pages — Free Printable for Kids',
    metaDescription:
      'Generate custom farm animal coloring pages for kids. Cows, horses, chickens, pigs — describe any barnyard scene and print instantly.',
    intro:
      'Bring the barnyard to life with custom farm animal coloring pages. Describe any farm scene — from friendly cows to playful piglets — and get a printable coloring page.',
    prompts: getPromptsForPack('farm-animals'),
    sampleImages: [
      '/landing/farm-horse.jpg',
      '/landing/farm-rooster.jpg',
    ],
    relatedThemes: ['dinosaur-world', 'enchanted-forest', 'birthday-party'],
    faq: [
      {
        question: 'Can I make animal coloring pages for preschoolers?',
        answer:
          'Yes. Ask for one clear animal, big shapes, and thick lines for younger kids.',
      },
      {
        question: 'Can teachers use farm animal coloring pages in class?',
        answer:
          'Yes. Teachers can create farm, food, seasons, and animal-life-cycle coloring pages for classroom activities.',
      },
    ],
  },
  'birthday-party': {
    h1: 'Birthday Coloring Pages for Kids',
    metaTitle: 'Birthday Coloring Pages — Free Printable Party Activities',
    metaDescription:
      'Create custom birthday coloring pages for kids\u2019 parties. Cakes, balloons, party animals — print personalized party activities in seconds.',
    intro:
      'Make every birthday extra special with custom coloring pages. Describe any party scene — giant cakes, balloon animals, party games — and create printable activities for the big day.',
    prompts: getPromptsForPack('birthday-party'),
    relatedThemes: ['superhero-squad', 'enchanted-forest', 'farm-animals'],
    faq: [
      {
        question: 'Can I make personalized birthday coloring pages?',
        answer:
          'Yes. Describe the theme, age, favorite animal, character type, or party scene and print a custom birthday activity.',
      },
      {
        question: 'Are birthday coloring pages good for party tables?',
        answer:
          'Yes. They work well as quick printable party activities, quiet table sheets, or take-home pages.',
      },
    ],
  },
  'superhero-squad': {
    h1: 'Superhero Coloring Pages for Kids',
    metaTitle: 'Superhero Coloring Pages for Kids — Free Printable Heroes',
    metaDescription:
      'Generate custom superhero coloring pages for kids. Describe any hero, power, or adventure and get a printable page in seconds.',
    intro:
      'Unleash your child\u2019s inner hero with custom superhero coloring pages. Describe any hero, superpower, or action scene and our AI will create a printable coloring page.',
    prompts: getPromptsForPack('superhero-squad'),
    sampleImages: [
      '/landing/superhero-1.jpg',
      '/landing/superhero-2.jpg',
    ],
    relatedThemes: ['space-adventure', 'enchanted-forest', 'transportation'],
    faq: [
      {
        question: 'Can I create a custom superhero coloring page?',
        answer:
          'Yes. Describe the hero, costume, power, sidekick, city, or rescue scene and MyPaperPop creates a printable page.',
      },
      {
        question: 'Can I make superhero pages without copyrighted characters?',
        answer:
          'Yes. The best prompts describe original heroes, powers, and scenes instead of asking for copyrighted characters.',
      },
    ],
  },
  transportation: {
    h1: 'Vehicle & Transportation Coloring Pages',
    metaTitle:
      'Vehicle Coloring Pages for Kids — Cars, Trains, Planes & Boats',
    metaDescription:
      'Create custom vehicle coloring pages for kids. Cars, trains, planes, boats — describe any vehicle and print a coloring page instantly.',
    intro:
      'Rev up creativity with custom vehicle and transportation coloring pages. Describe any vehicle — from steam trains to rocket ships — and get a printable coloring page in seconds.',
    prompts: getPromptsForPack('transportation'),
    relatedThemes: ['space-adventure', 'superhero-squad', 'dinosaur-world'],
    faq: [
      {
        question: 'What vehicle coloring pages can I make?',
        answer:
          'You can make cars, trains, airplanes, fire trucks, boats, construction vehicles, rockets, and more.',
      },
      {
        question: 'Can vehicle coloring pages be made easier for toddlers?',
        answer:
          'Yes. Ask for one large vehicle, simple wheels, thick outlines, and a plain background.',
      },
    ],
  },
  unicorn: {
    h1: 'Unicorn Coloring Pages for Kids',
    metaTitle: 'Unicorn Coloring Pages — Free Printable AI Generator',
    metaDescription:
      'Create custom unicorn coloring pages for kids. Describe magical unicorns, rainbows, castles, and printable fantasy scenes in seconds.',
    intro:
      'Make a unicorn coloring page that matches the exact wish. Ask for rainbow manes, castles, stars, flowers, baby unicorns, or simple preschool-friendly outlines.',
    prompts: [
      'A baby unicorn sleeping on a cloud',
      'A unicorn with a rainbow mane in a flower field',
      'A princess riding a unicorn through a castle garden',
      'A unicorn family under a sky full of stars',
      'A simple unicorn head with big shapes for toddlers',
      'A unicorn and a dragon sharing cupcakes',
    ],
    sampleImages: [
      '/landing/forest-exploration.jpg',
      '/landing/baby-dragon-in-garden.png',
    ],
    relatedThemes: ['enchanted-forest', 'princess', 'preschool'],
    faq: [
      {
        question: 'Can I make a printable unicorn coloring page?',
        answer:
          'Yes. Describe the unicorn scene you want and MyPaperPop creates a printable black-and-white coloring page.',
      },
      {
        question: 'Can I make unicorn coloring pages for toddlers?',
        answer:
          'Yes. Ask for bigger shapes, one unicorn, thick lines, and very few background details.',
      },
    ],
  },
  princess: {
    h1: 'Princess Coloring Pages for Kids',
    metaTitle: 'Princess Coloring Pages — Free Printable AI Generator',
    metaDescription:
      'Generate custom princess coloring pages for kids. Describe castles, gowns, crowns, fairies, dragons, and printable storybook scenes.',
    intro:
      'Create princess coloring pages around any story your kid invents. Build castle scenes, garden tea parties, brave princess adventures, or simple crown-and-gown pages.',
    prompts: [
      'A princess planting flowers in a castle garden',
      'A brave princess and a friendly dragon reading a map',
      'A princess having tea with forest animals',
      'A simple princess crown with hearts and stars',
      'A princess riding in a pumpkin carriage',
      'A princess and a unicorn beside a waterfall',
    ],
    sampleImages: [
      '/landing/forest-deep-woods.jpg',
      '/landing/scroll-dragon.png',
    ],
    relatedThemes: ['unicorn', 'enchanted-forest', 'birthday-party'],
    faq: [
      {
        question: 'Can I create custom princess coloring pages?',
        answer:
          'Yes. Describe the princess, setting, outfit, friends, and storybook moment and print the result.',
      },
      {
        question: 'Can I avoid tiny details for younger kids?',
        answer:
          'Yes. Ask for simple shapes, a plain background, and thick outlines before or after generating.',
      },
    ],
  },
  animals: {
    h1: 'Animal Coloring Pages for Kids',
    metaTitle: 'Animal Coloring Pages — Free Printable AI Generator',
    metaDescription:
      'Make printable animal coloring pages for kids. Create pets, zoo animals, farm animals, forest animals, and simple toddler pages.',
    intro:
      'Turn any animal idea into a printable coloring page. Make pets, zoo animals, forest friends, farm scenes, or one big simple animal for younger kids.',
    prompts: [
      'A puppy wearing rain boots in a puddle',
      'A kitten sleeping in a basket of yarn',
      'A giraffe eating leaves beside a tiny bird',
      'A fox family outside a cozy den',
      'A panda holding a bamboo umbrella',
      'A simple smiling elephant with big ears',
    ],
    sampleImages: [
      '/landing/puppy-in-garden.png',
      '/landing/farm-horse.jpg',
    ],
    relatedThemes: ['farm-animals', 'under-the-sea', 'preschool'],
    faq: [
      {
        question: 'What animal coloring pages can I make?',
        answer:
          'You can make pets, zoo animals, ocean animals, farm animals, forest animals, fantasy animals, or made-up animal scenes.',
      },
      {
        question: 'Are animal coloring pages printable?',
        answer:
          'Yes. Pages are generated as black-and-white line art that can be downloaded and printed.',
      },
    ],
  },
  'teacher-worksheets': {
    h1: 'Teacher Coloring Worksheets',
    metaTitle: 'Teacher Coloring Worksheets — Printable AI Generator',
    metaDescription:
      'Create printable coloring worksheets for teachers. Make lesson-themed classroom coloring pages for animals, seasons, holidays, science, and reading.',
    intro:
      'Make classroom coloring worksheets that fit the lesson instead of hunting through generic printables. Describe the topic, grade level, and scene, then print a clean page.',
    prompts: [
      'A kindergarten worksheet about the life cycle of a butterfly',
      'A first grade space worksheet with planets and labels',
      'A classroom kindness poster with kids helping each other',
      'A farm animals worksheet with simple labels',
      'A weather worksheet showing sun, rain, wind, and snow',
      'A reading corner coloring page with books and cozy chairs',
    ],
    sampleImages: [
      '/landing/space-planets.jpg',
      '/landing/sea-animals.jpg',
    ],
    relatedThemes: ['for-teachers', 'preschool', 'animals'],
    faq: [
      {
        question: 'Can teachers make lesson-themed coloring worksheets?',
        answer:
          'Yes. Teachers can describe the lesson topic, age group, and visual style to create printable classroom pages.',
      },
      {
        question: 'Can I make worksheets easier or harder?',
        answer:
          'Yes. Ask MyPaperPop to simplify the lines, add more objects, remove labels, or make the page age-appropriate.',
      },
    ],
  },
  preschool: {
    h1: 'Preschool Coloring Pages',
    metaTitle: 'Preschool Coloring Pages — Simple Printable AI Generator',
    metaDescription:
      'Create simple preschool coloring pages with big shapes, thick lines, and age-appropriate printable scenes for ages 4–6.',
    intro:
      'Make preschool coloring pages with the right level of detail. Ask for one clear subject, big shapes, thick outlines, and friendly scenes for ages 4 to 6.',
    prompts: [
      'A simple butterfly with big wings and flowers',
      'A smiling school bus with large windows',
      'A puppy beside one big ball',
      'A rainbow over a small house',
      'A friendly dinosaur with big simple spots',
      'A teddy bear holding a heart',
    ],
    sampleImages: [
      '/landing/bunny-with-carrot.png',
      '/landing/teddy-bear-picnic.png',
    ],
    relatedThemes: ['animals', 'unicorn', 'farm-animals'],
    faq: [
      {
        question: 'What makes a coloring page good for preschoolers?',
        answer:
          'Preschool pages usually work best with one clear subject, big shapes, thick outlines, and limited background detail.',
      },
      {
        question: 'Can I set the age for a preschool coloring page?',
        answer:
          'Yes. Include the child’s age in the prompt or ask MyPaperPop to adjust the page for ages 4 to 6.',
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(THEMES).map((theme) => ({ theme }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ theme: string }>;
}): Promise<Metadata> {
  const { theme } = await params;
  const data = THEMES[theme];
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: `/coloring-pages/${theme}` },
    openGraph: { title: data.metaTitle, description: data.metaDescription },
  };
}

export default async function ThemeColoringPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme } = await params;
  const data = THEMES[theme];
  if (!data) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: data.h1,
        description: data.metaDescription,
        url: `https://mypaperpop.com/coloring-pages/${theme}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://mypaperpop.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Coloring Pages',
            item: 'https://mypaperpop.com/coloring-pages/dinosaur-world',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: data.h1,
            item: `https://mypaperpop.com/coloring-pages/${theme}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: data.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            {data.h1}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            {data.intro}
          </p>
          <MarketingCta>Create yours free &rarr;</MarketingCta>
        </section>

        {/* Sample Images */}
        {data.sampleImages && data.sampleImages.length > 0 && (
          <section className="py-12 border-t border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Sample {data.h1}
            </h2>
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              {data.sampleImages.map((src, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
                >
                  <Image
                    src={src}
                    alt={`${data.h1} example ${i + 1}`}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Try These Prompts */}
        <section className="py-12 border-t border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
            Try These Prompts
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Click any prompt to start creating — or type your own idea.
          </p>
          <div className="max-w-2xl mx-auto">
            <PromptGrid prompts={data.prompts} href="/#sign-in" />
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 border-t border-gray-100 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-[var(--orange)] mb-2">01</div>
              <h3 className="font-semibold text-gray-900 mb-1">Describe it</h3>
              <p className="text-sm text-gray-500">
                Type any scene or character you can imagine.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--orange)] mb-2">02</div>
              <h3 className="font-semibold text-gray-900 mb-1">AI draws it</h3>
              <p className="text-sm text-gray-500">
                Get a clean line drawing in seconds. Keep chatting to refine.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--orange)] mb-2">03</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Print & color
              </h3>
              <p className="text-sm text-gray-500">
                Download the PNG and print at home on any paper.
              </p>
            </div>
          </div>
        </section>

        {/* Related Themes */}
        <section className="py-12 border-t border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Explore More Themes
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {data.relatedThemes.map((slug) => {
              const related = THEMES[slug];
              if (!related) return null;
              return (
                <Link
                  key={slug}
                  href={`/coloring-pages/${slug}`}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  {related.h1
                    .replace(' for Kids', '')
                    .replace(' Coloring Pages', '')}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="py-12 border-t border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Questions About {data.h1}
          </h2>
          <div className="mx-auto max-w-2xl divide-y divide-[var(--ink)]/20">
            {data.faq.map((item) => (
              <details key={item.question} className="py-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Ready to create your own?
          </h2>
          <p className="text-gray-500 mb-6">
            {FREE_DAILY_LIMIT} free coloring pages per day. No credit card required.
          </p>
          <MarketingCta />
        </section>
      </div>
    </>
  );
}
