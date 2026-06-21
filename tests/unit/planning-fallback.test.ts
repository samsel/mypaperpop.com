import { describe, expect, it } from 'vitest';
import { buildEvaluatePromptFailureFallback } from '@/lib/ai/planning-fallback';

describe('planning provider failure fallback', () => {
    it('generates for a clear new coloring page request', () => {
        const result = buildEvaluatePromptFailureFallback([
            { role: 'user', content: 'A baby elephant holding a daisy in its trunk for its mother' },
        ], null);

        expect(result).toMatchObject({
            verdict: 'GENERATE',
            paperOrientation: 'portrait',
        });
        expect(result.enhancedPrompt).toContain('A baby elephant holding a daisy');
        expect(result.enhancedPrompt).toContain('Black and white clean outline coloring page');
    });

    it('generates for concrete edits to an existing image', () => {
        const result = buildEvaluatePromptFailureFallback([
            { role: 'assistant', content: '[Generated image: A friendly robot]' },
            { role: 'user', content: 'add a chef hat' },
        ], 'A friendly robot');

        expect(result).toMatchObject({
            verdict: 'GENERATE',
            paperOrientation: 'portrait',
        });
        expect(result.enhancedPrompt).toContain('A friendly robot');
        expect(result.enhancedPrompt).toContain('add a chef hat');
    });

    it('does not generate for questions or brainstorming turns', () => {
        expect(buildEvaluatePromptFailureFallback([
            { role: 'user', content: 'what else can we add?' },
        ], 'A friendly robot')).toEqual({ verdict: 'CLARIFY' });

        expect(buildEvaluatePromptFailureFallback([
            { role: 'user', content: 'what can you do?' },
        ], null)).toEqual({ verdict: 'CLARIFY' });
    });
});
