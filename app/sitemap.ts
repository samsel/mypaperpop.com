import type { MetadataRoute } from 'next';

const THEME_SLUGS = [
  'dinosaur-world',
  'space-adventure',
  'under-the-sea',
  'enchanted-forest',
  'farm-animals',
  'birthday-party',
  'superhero-squad',
  'transportation',
  'unicorn',
  'princess',
  'animals',
  'teacher-worksheets',
  'preschool',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const themePages: MetadataRoute.Sitemap = THEME_SLUGS.map((theme) => ({
    url: `https://mypaperpop.com/coloring-pages/${theme}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    { url: 'https://mypaperpop.com', lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://mypaperpop.com/pricing', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://mypaperpop.com/faq', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://mypaperpop.com/for-parents', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://mypaperpop.com/for-teachers', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://mypaperpop.com/for-toddlers', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://mypaperpop.com/for-preschoolers', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...themePages,
    { url: 'https://mypaperpop.com/privacy', lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://mypaperpop.com/terms', lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
