'use client';

import { useState, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DEMO_SUGGESTIONS } from '@/lib/demo-data';
import { usePostHog } from 'posthog-js/react';

export function LandingDemo({ isAuthenticated }: { isAuthenticated: boolean }) {
  const posthog = usePostHog();
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(text?: string) {
    const inputText = (text || prompt).trim();
    if (!inputText) return;

    posthog.capture('demo_prompt_submitted', {
      prompt: inputText,
    });

    try {
      localStorage.setItem('mpp_demo_prompt', inputText);
    } catch {}

    if (isAuthenticated) {
      router.push('/home');
    } else {
      window.location.hash = 'sign-in';
    }
  }

  function handleChipClick(suggestion: string) {
    setPrompt(suggestion);
    handleSubmit(suggestion);
  }

  return (
    <div className="mx-auto w-full max-w-2xl min-w-0" data-testid="landing-demo">
      <div className="paper-card bg-white px-3 py-3 sm:px-5 sm:py-5">
        <label className="sr-only" htmlFor="demo-prompt">Coloring page idea</label>
        <div className="relative mx-auto w-full max-w-xl rounded-xl border-[1.5px] border-[var(--ink)] bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--orange)]/25">
          <textarea
            id="demo-prompt"
            ref={textAreaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="a corgi knight defending a sandwich..."
            rows={2}
            className="min-h-[76px] max-h-32 w-full resize-none rounded-xl border-0 bg-transparent py-3.5 pl-4 pr-16 text-base leading-6 text-[var(--ink)] placeholder:font-hand placeholder:text-[var(--ink)]/62 focus:outline-none focus:ring-0 sm:min-h-[56px] sm:py-4 sm:pl-5"
          />
          <Button
            onClick={() => handleSubmit()}
            disabled={!prompt.trim()}
            size="icon"
            aria-label={prompt.trim() ? 'Create coloring page' : 'Enter an idea to create'}
            className={`absolute bottom-2 right-2 h-11 w-11 rounded-full border-[1.5px] border-[var(--ink)] transition-all duration-200 sm:right-2.5 sm:h-10 sm:w-10 ${
              !prompt.trim()
                ? 'bg-[var(--paper-card)] text-[var(--ink)]/40'
                : 'bg-[var(--orange)] text-white'
            }`}
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>

        <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 sm:mt-4 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
          {DEMO_SUGGESTIONS.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleChipClick(suggestion)}
              className="paper-hover min-h-11 max-w-[78vw] shrink-0 cursor-pointer rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] px-4 py-2 text-sm font-medium leading-5 text-[var(--ink)] sm:min-h-0 sm:max-w-none"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
