'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';

export function LandingBottomCta({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="bg-[var(--ink)] py-16 text-[var(--paper)] sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <Reveal className="reveal-fade-in">
          <h2 className="font-display text-4xl text-[var(--paper)] sm:text-5xl">
            Ready to create something amazing?
          </h2>
          <p className="mt-4 text-base text-[var(--paper)]/65">
            3 free coloring pages every day. No credit card needed.
          </p>
          <div className="mt-10">
            {isAuthenticated ? (
              <Button asChild size="lg" className="h-12 bg-[var(--paper)] px-8 text-base font-semibold text-[var(--ink)]">
                <Link href="/home">
                  Start creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-12 bg-[var(--paper)] px-8 text-base font-semibold text-[var(--ink)]"
                onClick={() => { window.location.hash = 'sign-up'; }}
              >
                Create your first coloring page free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
