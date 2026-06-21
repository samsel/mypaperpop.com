import './globals.css';
import './animation.css';
import type { Metadata, Viewport } from 'next';
import { Inter_Tight, JetBrains_Mono, Kalam, Lilita_One } from 'next/font/google';
import { SignInModal } from '@/components/sign-in-modal';
import { SWRProvider } from '@/components/swr-provider';
import { PostHogProvider } from '@/components/posthog-provider';
import { Toaster } from 'sonner';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { siteConfig } from '@/lib/site-config';
import { JsonLd } from '@/components/seo/json-ld';
import { FREE_DAILY_LIMIT } from '@/lib/payments/config';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — AI Coloring Page Generator for Kids`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-167x167.png', sizes: '167x167' },
    ],
  },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.ogDescription,
    url: siteConfig.url,
    type: 'website',
    siteName: siteConfig.name,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.ogDescription,
    images: ['/twitter-card.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: siteConfig.themeColor,
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon-512.png`,
  description: siteConfig.description,
  sameAs: ['https://www.instagram.com/my_paperpop/'],
};

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.tagline,
};

const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteConfig.name,
  url: siteConfig.url,
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Any',
  description: siteConfig.description,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: `${FREE_DAILY_LIMIT} free AI coloring pages per day. No credit card required.`,
  },
};

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  weight: ['400', '500', '600', '700'],
});
const lilita = Lilita_One({
  subsets: ['latin'],
  variable: '--font-lilita',
  weight: '400',
});
const kalam = Kalam({
  subsets: ['latin'],
  variable: '--font-kalam',
  weight: ['400', '700'],
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-[var(--paper)] text-[var(--ink)] ${interTight.variable} ${lilita.variable} ${kalam.variable} ${mono.variable}`}
    >
      <body className="min-h-[100dvh] bg-[var(--paper)] font-[family-name:var(--font-inter-tight)]">
        <JsonLd data={organizationSchema} />
        <JsonLd data={webSiteSchema} />
        <JsonLd data={webApplicationSchema} />
        <PostHogProvider>
          <SWRProvider>
            {children}
            <SignInModal />
            <Toaster position="top-center" richColors toastOptions={{ className: 'font-[family-name:var(--font-inter-tight)]' }} />
            <CookieConsentBanner />
          </SWRProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
