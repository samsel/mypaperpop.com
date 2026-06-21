import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

describe('window.open hardening', () => {
    it('uses noopener,noreferrer for every remaining window.open call', () => {
        const files = [
            'app/(dashboard)/home/image-actions.ts',
            'components/showcase-card.tsx',
        ];

        for (const file of files) {
            const source = readFileSync(join(root, file), 'utf8');
            const calls = source.match(/window\.open\([^;\n]+/g) ?? [];

            for (const call of calls) {
                expect(call, `${file}: ${call}`).toContain('noopener,noreferrer');
            }
        }
    });
});
