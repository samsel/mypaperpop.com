import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/privacy',
          '/terms',
          '/pricing',
          '/faq',
          '/for-parents',
          '/for-teachers',
          '/for-toddlers',
          '/for-preschoolers',
          '/coloring-pages/',
          '/llms.txt',
        ],
        disallow: ['/home', '/account', '/api/'],
      },
    ],
    sitemap: 'https://mypaperpop.com/sitemap.xml',
  };
}
