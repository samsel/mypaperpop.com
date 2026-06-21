import { cache } from 'react'
import { auth } from '@/auth'

export type SessionData = {
  user: {
    id: number
    email?: string | null
  }
  expires: string
}

export const getSession = cache(async function getSession(): Promise<SessionData | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const userId = Number(session.user.id)
  if (!userId || isNaN(userId)) return null

  return {
    user: {
      id: userId,
      email: session.user.email,
    },
    expires: session.expires ?? new Date(Date.now() + 86400000).toISOString(),
  }
})
