import Google from 'next-auth/providers/google'
import type { NextAuthConfig } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { env } from '@/lib/env'

/**
 * Edge-compatible Auth.js config (no DB imports).
 * Used by middleware.ts (Edge Runtime) and extended by auth.ts (Node.js Runtime).
 */
export const authConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: 'select_account' } },
    }),
  ],
  session: { strategy: 'jwt' as const },
  pages: {
    signIn: '/#sign-in',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id?: string } }) {
      if (user) {
        token.userId = parseInt(user.id!, 10)
      }
      return token
    },

    async session({ session, token }: { session: { user?: { id?: string }; expires: string }; token: JWT & { userId?: number } }) {
      if (session.user) {
        session.user.id = String(token.userId)
      }
      return session
    },
  },
} satisfies NextAuthConfig
