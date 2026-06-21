'use server';

import { createCheckoutSession } from './stripe';
import { withUser } from '@/lib/auth/middleware';

export const checkoutAction = withUser(async (formData, user) => {
  const priceId = formData.get('priceId') as string;
  const returnTo = formData.get('returnTo') as string | null;
  await createCheckoutSession({ user, priceId, returnTo: returnTo || undefined });
});
