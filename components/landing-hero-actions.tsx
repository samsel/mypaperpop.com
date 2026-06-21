'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function LandingHeroActions({ className, isAuthenticated }: { className?: string; isAuthenticated: boolean }) {
    return (
        <div className={className ?? "mt-8 flex flex-wrap gap-4"}>
            {isAuthenticated ? (
                <Button asChild size="lg" className="h-12 px-6 text-base">
                    <Link href="/home">
                        Create a sketch
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            ) : (
                <Button asChild size="lg" className="h-12 px-6 text-base">
                    <a href="#sign-up">
                        Create your first sketch free
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            )}

            <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
                <a href="#pricing">
                    See plans
                </a>
            </Button>
        </div>
    );
}
