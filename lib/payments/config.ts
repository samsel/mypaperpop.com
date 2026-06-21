export const FREE_DAILY_LIMIT = 3;

/** Max AI endpoint requests per user within the sliding window */
export const RATE_LIMIT_MAX_REQUESTS = 60;
/** Sliding window duration in milliseconds (60 seconds) */
export const RATE_LIMIT_WINDOW_MS = 60_000;

export type SupportedCurrency = 'usd' | 'inr' | 'eur';

export const CURRENCIES: Record<SupportedCurrency, { symbol: string; code: string }> = {
  usd: { symbol: '$', code: 'USD' },
  inr: { symbol: '₹', code: 'INR' },
  eur: { symbol: '€', code: 'EUR' },
};

export type CurrencyPricing = {
  priceSmallestUnit: number;
  priceId: string;
};

/**
 * Stripe price IDs for each environment.
 * Live IDs are used in production; test IDs are used with sandbox keys.
 *
 * Public self-hosters can replace these with their own Stripe price IDs.
 */
const STRIPE_PRICES = {
    live: {
        small: { usd: 'price_1T1gfVAXeQC5g8AWTR6h9Ozx', inr: 'price_1T1gfVAXeQC5g8AWkn2KfWcQ', eur: 'price_1TaooaAXeQC5g8AWsQBYpDAn' },
        large: { usd: 'price_1T1gfWAXeQC5g8AWHRKXS8DJ', inr: 'price_1T1gfWAXeQC5g8AW47QRVmUS', eur: 'price_1TaoobAXeQC5g8AWyy6TmRhu' },
    },
    test: {
        small: { usd: 'price_1T2eK9ALI8jgdcNAy2qHjKxn', inr: 'price_1T2eKAALI8jgdcNAFYYvSXEn', eur: 'price_1Taop3ALI8jgdcNAvFVfBOAH' },
        large: { usd: 'price_1T2eKAALI8jgdcNAq7ESm0Qv', inr: 'price_1T2eKBALI8jgdcNA2R4S7jda', eur: 'price_1Taop4ALI8jgdcNARL3vby7F' },
    },
};

function isStripeTestKey(key: string | undefined) {
    return key?.startsWith('sk_test_') || key?.startsWith('rk_test_') || false;
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

/** True when using a Stripe test key (local dev, preview, CI). */
export const isStripeTestMode = stripeSecretKey ? isStripeTestKey(stripeSecretKey) : process.env.NODE_ENV !== 'production';

const prices = STRIPE_PRICES[isStripeTestMode ? 'test' : 'live'];

export const CREDIT_PACKS = {
    small: {
        name: 'Starter Pack',
        credits: 25,
        features: [
            '25 coloring pages',
            'Use anytime, no expiry',
            'Print & download',
            'Buy additional packs anytime',
        ],
        description: 'Perfect for a weekend project.',
        pricing: {
            usd: { priceSmallestUnit: 299, priceId: prices.small.usd } as CurrencyPricing,
            inr: { priceSmallestUnit: 29900, priceId: prices.small.inr } as CurrencyPricing,
            eur: { priceSmallestUnit: 299, priceId: prices.small.eur } as CurrencyPricing,
        },
    },
    large: {
        name: 'Value Pack',
        credits: 75,
        features: [
            '75 coloring pages',
            'Use anytime, no expiry',
            'Print & download',
            'Buy additional packs anytime',
        ],
        description: 'For families and classrooms.',
        pricing: {
            usd: { priceSmallestUnit: 699, priceId: prices.large.usd } as CurrencyPricing,
            inr: { priceSmallestUnit: 69900, priceId: prices.large.inr } as CurrencyPricing,
            eur: { priceSmallestUnit: 699, priceId: prices.large.eur } as CurrencyPricing,
        },
    },
} as const;

export const FREE_TIER = {
    name: 'Free',
    features: [
        '3 coloring pages per day',
        'No credit card needed',
        'Print & download',
    ],
    description: 'Perfect for trying it out.',
} as const;

export const REFERRAL_CREDITS = 5;
export const REFERRAL_PACK_TYPE = 'referral';
export const MAX_REFERRALS = 50;

export type PackKey = keyof typeof CREDIT_PACKS;

/** Set of valid Stripe price IDs across all currencies. */
export const VALID_STRIPE_PRICE_IDS: Set<string> = new Set(
    Object.values(CREDIT_PACKS).flatMap(p =>
        Object.values(p.pricing).map(cp => cp.priceId)
    )
);

/**
 * Look up a coloring page pack by its Stripe price ID (across all currencies).
 */
export function getPackByPriceId(priceId: string): { key: PackKey; pack: typeof CREDIT_PACKS[PackKey]; currency: SupportedCurrency } | null {
    for (const [key, pack] of Object.entries(CREDIT_PACKS)) {
        for (const [currency, cp] of Object.entries(pack.pricing)) {
            if (cp.priceId === priceId) {
                return { key: key as PackKey, pack, currency: currency as SupportedCurrency };
            }
        }
    }
    return null;
}

/**
 * Map country code to currency. India → INR, everything else → USD.
 */
export function getCurrencyForCountry(countryCode: string): SupportedCurrency {
    const country = countryCode.toUpperCase();
    if (country === 'IN') return 'inr';
    if (EURO_COUNTRIES.has(country)) return 'eur';
    return 'usd';
}

const EURO_COUNTRIES = new Set([
    'AT', 'BE', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV',
    'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
]);

/**
 * Format a price in smallest-unit for display.
 * USD: $2.99, INR: ₹299, EUR: €2.99
 */
export function formatPrice(currency: SupportedCurrency, smallestUnit: number): string {
    const { symbol } = CURRENCIES[currency];
    if (currency === 'inr') {
        return `${symbol}${Math.round(smallestUnit / 100)}`;
    }
    return `${symbol}${(smallestUnit / 100).toFixed(2)}`;
}

/**
 * Format per-image price.
 */
export function formatPerImage(currency: SupportedCurrency, smallestUnit: number, credits: number): string {
    const perImage = smallestUnit / credits;
    const { symbol } = CURRENCIES[currency];
    if (currency === 'inr') {
        return `${symbol}${(perImage / 100).toFixed(0)}/page`;
    }
    return `${symbol}${(perImage / 100).toFixed(2)}/page`;
}

/**
 * Format price for purchase history display.
 */
export function formatPurchasePrice(currency: string | null, priceCents: number): string {
    if (priceCents === 0) return 'Free';
    const cur = (currency || 'usd') as SupportedCurrency;
    return formatPrice(cur, priceCents);
}
