'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteAccount, signOut } from '@/app/(login)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CREDIT_PACKS, FREE_DAILY_LIMIT, formatPurchasePrice } from '@/lib/payments/config';
import type { UsageInfo } from '@/lib/usage/limits';
import type { CreditPurchase, User } from '@/lib/db/schema';

function formatMemberSince(value: Date | string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  });
}

function formatPurchaseDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  });
}

function getPackLabel(purchase: CreditPurchase): string {
  if (purchase.packType === 'referral') return 'Referral bonus';
  if (purchase.packType === 'migration') return 'Migration';
  const pack = CREDIT_PACKS[purchase.packType as keyof typeof CREDIT_PACKS];
  return pack?.name ?? purchase.packType;
}

function purchasePrice(purchase: CreditPurchase) {
  if (purchase.priceCents === 0) return 'free';
  return formatPurchasePrice(purchase.currency, purchase.priceCents);
}

export function AccountSettingsNav({ items }: { items: { label: string; id: string }[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? 'profile');

  useEffect(() => {
    if (!window.location.hash) return;
    const hashId = window.location.hash.slice(1);
    if (items.some((item) => item.id === hashId)) {
      setActiveId(hashId);
      window.requestAnimationFrame(() => {
        document.getElementById(hashId)?.scrollIntoView({ block: 'start' });
      });
    }
  }, [items]);

  const handleClick = (id: string) => {
    setActiveId(id);
    window.history.replaceState(null, '', `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav aria-label="Account settings">
      <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const classes = isActive
            ? 'bg-[var(--ink)] text-[var(--paper)]'
            : 'bg-transparent text-[var(--ink)] hover:bg-white/60';

          return (
            <li key={item.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => handleClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`paper-hover block w-full rounded-md px-3 py-2 text-left text-sm font-semibold ${classes}`}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AccountProfileCard({ user }: { user: User }) {
  const displayName = user.name || 'Your studio';
  const initial = (displayName || user.email || 'M').slice(0, 1).toUpperCase();

  return (
    <section id="profile" className="scroll-mt-8 rounded-md border border-black/12 bg-white p-6 shadow-sm sm:p-[26px]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#172f49] font-display text-4xl leading-none text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[28px] leading-none text-[var(--ink)]">
            {displayName}
          </h2>
          <p className="mt-2 break-words text-sm text-[var(--ink)]/70">
            {user.email} · Member since {formatMemberSince(user.createdAt)}
          </p>
        </div>
      </div>
    </section>
  );
}

export function CreditsBillingCard({
  usage,
  purchases,
}: {
  usage: UsageInfo;
  purchases: CreditPurchase[];
}) {
  const dailyRemaining = Math.max(0, FREE_DAILY_LIMIT - usage.freeUsedToday);
  const visiblePurchases = purchases.slice(0, 5);

  return (
    <section id="credits" className="scroll-mt-8 rounded-md border border-black/12 bg-[#172f49] p-6 text-white shadow-sm sm:p-[26px]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
            Coloring pages
          </p>
          <p className="mt-1 font-display text-[64px] leading-none text-white">
            {usage.creditBalance}
          </p>
          <p className="mt-1 font-hand text-lg text-white/75">
            + {dailyRemaining} free {dailyRemaining === 1 ? 'page' : 'pages'} today
          </p>
        </div>
        <Link
          href="/pricing"
          className="paper-hover inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-[var(--orange)] px-6 text-sm font-semibold text-white"
        >
          Get more coloring pages →
        </Link>
      </div>

      <div id="purchases" className="mt-5 border-t border-dashed border-white/25 pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
          Purchase history
        </p>
        {visiblePurchases.length === 0 ? (
          <div className="mt-3 rounded-md border border-dashed border-white/25 bg-white/8 px-4 py-3 text-sm text-white/70">
            No purchases yet
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {visiblePurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="grid gap-2 border-b border-dashed border-white/20 py-2 text-sm last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)_120px_80px] sm:gap-4"
              >
                <span className="text-white/65">{formatPurchaseDate(purchase.createdAt)}</span>
                <span className="font-semibold text-white">{getPackLabel(purchase)}</span>
                <span className="font-semibold text-[var(--yellow)]">
                  +{purchase.creditsPurchased} coloring {purchase.creditsPurchased === 1 ? 'page' : 'pages'}
                </span>
                <span className="sm:text-right">{purchasePrice(purchase)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function AccountActionsCard({ user }: { user: User }) {
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteAccount, { error: '' });
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (hasSubmitted.current && deleteState?.error === '') {
      window.location.href = '/';
    }
  }, [deleteState]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <section id="security" className="scroll-mt-8 rounded-md border border-black/12 bg-white p-6 shadow-sm sm:p-[26px]">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)]/60">
            Sign out
          </p>
          <h2 className="mt-1 font-display text-2xl leading-none text-[var(--ink)]">
            Leave this session
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/65">
            Signed in as {user.email}. You can sign back in anytime.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            className="mt-4 rounded-full border-[1.5px] border-[var(--ink)] bg-transparent px-5 text-[var(--ink)]"
          >
            Sign out
          </Button>
        </div>

        <div className="border-t border-dashed border-[var(--ink)] pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)]/60">
            Delete account
          </p>
          <h2 className="mt-1 font-display text-2xl leading-none text-[var(--ink)]">
            Delete account
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/65">
            Account deletion is non-reversible. Please proceed with caution.
          </p>
          <form action={(formData) => { hasSubmitted.current = true; deleteAction(formData); }} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="delete-verify" className="mb-2 text-sm">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                id="delete-verify"
                name="verifyParams"
                type="text"
                required
                placeholder="DELETE"
                className="border-[1.5px] border-[var(--ink)] bg-white"
              />
            </div>
            {deleteState?.error && (
              <p className="text-sm text-[var(--danger)]">{deleteState.error}</p>
            )}
            <Button
              type="submit"
              variant="outline"
              className="rounded-full border-[1.5px] border-[var(--danger)] bg-transparent px-5 text-[var(--danger)]"
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
