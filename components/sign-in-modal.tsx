'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { LoginCard } from './login-card';

export function SignInModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const shouldOpen = hash === '#sign-in' || hash === '#sign-up';
            setIsOpen(shouldOpen);
            if (shouldOpen) {
                setMode(hash === '#sign-up' ? 'signup' : 'signin');
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            window.location.hash = '';
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogPortal>
                <DialogOverlay />
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]">
                    <VisuallyHidden>
                        <DialogTitle>{mode === 'signup' ? 'Sign Up' : 'Sign In'}</DialogTitle>
                    </VisuallyHidden>
                    <DialogClose className="paper-hover absolute -right-4 -top-4 z-10 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] p-2">
                        <X className="h-5 w-5 text-[var(--ink)]" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                    <LoginCard mode={mode} />
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
