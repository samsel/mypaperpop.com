'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getConsent,
  setConsent,
  hasRespondedToConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

export function CookieConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);

  useEffect(() => {
    if (!hasRespondedToConsent()) {
      setVisible(true);
    }
  }, []);

  function acceptAll() {
    const consent: CookieConsent = { essential: true, analytics: true };
    setConsent(consent);
    setVisible(false);
  }

  function rejectNonEssential() {
    const consent: CookieConsent = { essential: true, analytics: false };
    setConsent(consent);
    setVisible(false);
  }

  function savePreferences() {
    const consent: CookieConsent = { essential: true, analytics: analyticsChecked };
    setConsent(consent);
    setVisible(false);
    setShowSettings(false);
  }

  if (!visible || pathname === '/print') return null;

  return (
    <div data-testid="cookie-consent-banner" className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-6">
      <div className="paper-sheet mx-auto max-h-[38dvh] w-full max-w-lg overflow-y-auto bg-white p-3 sm:max-h-none sm:p-6">
        {!showSettings ? (
          <>
            <p className="mb-1 font-display text-xl text-[var(--ink)] sm:text-2xl">Privacy cookies</p>
            <p className="mb-3 text-xs leading-5 text-[var(--ink)]/65 sm:mb-4 sm:text-sm sm:leading-6">
              <span className="sm:hidden">Essential cookies keep MyPaperPop working. Analytics help us improve.</span>
              <span className="hidden sm:inline">
                We use essential cookies to make MyPaperPop work. With your consent, we also use analytics
                cookies to understand how you use our service so we can improve it.
              </span>{' '}
              <Link href="/privacy#cookies" className="font-semibold underline hover:text-[var(--ink)]">
                Learn more
              </Link>
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
              <button
                onClick={acceptAll}
                className="paper-hover min-h-11 flex-1 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-[var(--paper)]"
              >
                Accept all
              </button>
              <button
                onClick={rejectNonEssential}
                className="paper-hover min-h-11 flex-1 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)]"
              >
                Essential only
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="paper-hover col-span-2 min-h-10 flex-1 rounded-full px-4 py-1.5 text-sm font-semibold text-[var(--ink)]/70 hover:bg-[var(--paper-card)] sm:py-2.5"
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 font-display text-2xl text-[var(--ink)]">Cookie preferences</p>
            <div className="space-y-3 mb-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-[var(--ink)]">Essential</span>
                  <p className="text-xs text-[var(--ink)]/55">Authentication, security, preferences. Always active.</p>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="h-4 w-4 rounded border-[var(--ink)] accent-[var(--ink)]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-[var(--ink)]">Analytics</span>
                  <p className="text-xs text-[var(--ink)]/55">Help us understand how you use MyPaperPop (PostHog).</p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsChecked}
                  onChange={(e) => setAnalyticsChecked(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-[var(--ink)] accent-[var(--ink)]"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={savePreferences}
                className="paper-hover flex-1 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-[var(--paper)]"
              >
                Save preferences
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="paper-hover rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--ink)]/70 hover:bg-[var(--paper-card)]"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Button to re-open cookie settings. Use in footers.
 * Opens the consent banner with the settings panel.
 */
export function CookieSettingsButton({ className }: { className?: string }) {
  const [showBanner, setShowBanner] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (consent) {
      setAnalyticsChecked(consent.analytics);
    }
  }, [showBanner]);

  function savePreferences() {
    const consent: CookieConsent = { essential: true, analytics: analyticsChecked };
    setConsent(consent);
    setShowBanner(false);
  }

  return (
    <>
      <button
        onClick={() => setShowBanner(true)}
        className={className}
      >
        Cookie Settings
      </button>

      {showBanner && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setShowBanner(false)}
          />
          <div className="paper-sheet relative mb-3 max-h-[82dvh] w-full max-w-lg overflow-y-auto bg-white p-4 sm:mb-0 sm:p-6">
            <p className="mb-3 font-display text-xl text-[var(--ink)] sm:mb-4 sm:text-2xl">Cookie preferences</p>
            <div className="mb-4 space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-[var(--ink)]">Essential</span>
                  <p className="text-xs text-[var(--ink)]/55">Authentication, security, preferences. Always active.</p>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="h-4 w-4 rounded border-[var(--ink)] accent-[var(--ink)]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-[var(--ink)]">Analytics</span>
                  <p className="text-xs text-[var(--ink)]/55">Help us understand how you use MyPaperPop (PostHog).</p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsChecked}
                  onChange={(e) => setAnalyticsChecked(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-[var(--ink)] accent-[var(--ink)]"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={savePreferences}
                className="paper-hover flex-1 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-[var(--paper)]"
              >
                Save preferences
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="paper-hover rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--ink)]/70 hover:bg-[var(--paper-card)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
