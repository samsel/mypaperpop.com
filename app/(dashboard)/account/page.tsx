import { redirect } from 'next/navigation';
import { getCreditPurchases, getUser } from '@/lib/db/queries';
import { getUsageInfo } from '@/lib/usage/limits';
import {
  AccountActionsCard,
  AccountSettingsNav,
  AccountProfileCard,
  CreditsBillingCard,
} from './settings';

const settingsItems = [
  { label: 'Profile', id: 'profile' },
  { label: 'Coloring pages & billing', id: 'credits' },
  { label: 'Delete account', id: 'security' },
];

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    redirect('/#sign-in');
  }

  const [usage, purchases] = await Promise.all([
    getUsageInfo(user.id),
    getCreditPurchases(user.id),
  ]);

  return (
    <main className="h-full flex-1 overflow-y-auto bg-[#f7f1e6] text-[var(--ink)]">
      <section className="px-4 py-8 sm:px-8 lg:px-[60px] lg:py-11">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <aside className="h-fit lg:sticky lg:top-8">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55">
              Settings
            </p>
            <AccountSettingsNav items={settingsItems} />
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <h1 aria-label="My Account" className="font-display text-5xl leading-none text-[var(--ink)] sm:text-[48px]">
              Your account
            </h1>

            <AccountProfileCard user={user} />
            <CreditsBillingCard usage={usage} purchases={purchases} />
            <AccountActionsCard user={user} />
          </div>
        </div>
      </section>
    </main>
  );
}
