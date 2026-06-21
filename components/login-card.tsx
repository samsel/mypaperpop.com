'use client';

import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { signInWithGoogle } from '@/app/(login)/actions';
import { PaperpopWordmark, StickerBurst } from '@/components/paper-studio';

function GoogleSignInButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full"
        >
            {pending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
            )}
            {pending ? 'Signing in...' : 'Sign in with Google'}
        </Button>
    );
}

export function LoginCard({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="paper-sheet w-full max-w-md bg-white px-8 py-10">
            <div className="flex flex-col items-center justify-center gap-3 mb-10">
                <StickerBurst size={48} />
                <PaperpopWordmark className="text-4xl" markSize={32} />
                <p className="mt-1 text-center font-hand text-base text-[var(--ink)]/65">
                    Turn imagination into instant coloring pages
                </p>
            </div>

            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <p className="mx-auto max-w-xs text-sm leading-relaxed text-[var(--ink)]/65">
                        We do not store any passwords. Simply sign in with your Google account.
                    </p>
                </div>

                <form action={signInWithGoogle}>
                    {searchParams.get('redirect') && (
                        <input type="hidden" name="redirect" value={searchParams.get('redirect') || ''} />
                    )}
                    {searchParams.get('priceId') && (
                        <input type="hidden" name="priceId" value={searchParams.get('priceId') || ''} />
                    )}
                    <GoogleSignInButton />
                </form>

                <div className="paper-dashed grid grid-cols-2 gap-4 pt-6">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <ShieldCheck className="h-5 w-5 text-[var(--success)]" />
                        <span className="text-xs font-semibold text-[var(--ink)]/60">No Passwords</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Lock className="h-5 w-5 text-[var(--ink)]/65" />
                        <span className="text-xs font-semibold text-[var(--ink)]/60">Private & Secure</span>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md border-[1.5px] border-[var(--danger)] bg-[var(--paper-card)] p-3">
                        <p className="text-center text-sm font-semibold text-[var(--danger)]">
                            Authentication failed. Please try again.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
