import NextAuth from 'next-auth'
import { db } from '@/lib/db/drizzle'
import { users, activityLogs, ActivityType } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      if (account?.provider !== 'google') return false

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email!))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(users)
          .set({
            googleId: account.providerAccountId,
            image: user.image,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing[0].id))

        user.id = String(existing[0].id)

        await db.insert(activityLogs).values({
          userId: existing[0].id,
          action: ActivityType.SIGN_IN,
        })
      } else {
        const [newUser] = await db
          .insert(users)
          .values({
            email: user.email!,
            name: user.name ?? '',
            googleId: account.providerAccountId,
            image: user.image,
          })
          .returning()

        user.id = String(newUser.id)

        await db.insert(activityLogs).values({
          userId: newUser.id,
          action: ActivityType.SIGN_UP,
        })
      }

      return true
    },
  },
})
