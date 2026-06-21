/**
 * Single source of truth for site-wide branding and metadata.
 * Used by layout.tsx, manifest.ts, and anywhere else that needs the app name,
 * description, or brand colors.
 */
export const siteConfig = {
  name: 'MyPaperPop',
  url: 'https://mypaperpop.com',
  description:
    'Describe anything, print it in seconds. Custom coloring pages for kids, parents, and teachers.',
  shortDescription:
    'Create custom coloring pages in seconds. Describe any character or scene and get a printable coloring page.',
  ogDescription:
    'Describe anything, print it in seconds. Free to start.',
  tagline: 'Coloring pages for any wish',
  themeColor: '#ed6a3e',
  backgroundColor: '#f5efe3',
} as const;
