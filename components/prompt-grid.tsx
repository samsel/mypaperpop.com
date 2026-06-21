import Link from 'next/link';

interface PromptGridProps {
  prompts: string[];
  /** When provided, each prompt becomes a clickable link to this href. */
  href?: string;
}

export function PromptGrid({ prompts, href }: PromptGridProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {prompts.map((prompt) =>
        href ? (
          <Link
            key={prompt}
            href={href}
            className="paper-hover block rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] px-4 py-3 font-hand text-sm text-[var(--ink)]"
          >
            &ldquo;{prompt}&rdquo;
          </Link>
        ) : (
          <div
            key={prompt}
            className="rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] px-4 py-3 font-hand text-sm text-[var(--ink)]"
          >
            &ldquo;{prompt}&rdquo;
          </div>
        ),
      )}
    </div>
  );
}
