export type CookieConsent = {
  essential: true; // always true, can't be disabled
  analytics: boolean;
};

const CONSENT_KEY = 'cookie_consent';

export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function setConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: consent }));
}

export function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return consent?.analytics === true;
}

export function hasRespondedToConsent(): boolean {
  return getConsent() !== null;
}
