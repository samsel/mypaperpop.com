import { describe, expect, it } from 'vitest';
import { buildRedrawSubject, chooseImageGenerationMode } from '@/lib/ai/image-generation-mode';

describe('image generation mode', () => {
    it('uses fresh generation when there is no previous image', () => {
        expect(chooseImageGenerationMode({
            latestUserMessage: 'redraw',
            hasPreviousImage: false,
        })).toBe('fresh');
    });

    it('routes redraw and cleanup requests away from bitmap edits', () => {
        for (const latestUserMessage of [
            'redraw',
            'redaw',
            'redo this',
            'one more version',
            'give me another version',
            'start over',
            'make it less black',
            'I want it to be more colorable',
            'this is uncolorable',
            'same thing but cleaner',
            'perfect sketch please',
            'just an outline sketch',
            'redraw the same with nice fine details but keep it colorable',
        ]) {
            expect(chooseImageGenerationMode({
                latestUserMessage,
                hasPreviousImage: true,
            }), latestUserMessage).toBe('redraw-from-prompt');
        }
    });

    it('keeps surgical edits on the previous bitmap', () => {
        for (const latestUserMessage of [
            'add a tree',
            'remove the sun',
            'take out the car',
            'replace the sun with a moon',
            'make the car bigger',
            'move the sun to the left',
            'put a dog next to it',
            'give it a hat',
            'change the background',
        ]) {
            expect(chooseImageGenerationMode({
                latestUserMessage,
                hasPreviousImage: true,
            }), latestUserMessage).toBe('edit-previous');
        }
    });

    it('treats full new drawing prompts as fresh even inside an existing conversation', () => {
        expect(chooseImageGenerationMode({
            latestUserMessage: 'KIA EV9 next a big city and a chevy Tahoe next to it',
            hasPreviousImage: true,
        })).toBe('fresh');

        for (const latestUserMessage of [
            'a castle near a lake with boats',
            'a cat sitting next to a dog',
            'a knight standing in front of a castle',
            'a happy robot with big eyes',
        ]) {
            expect(chooseImageGenerationMode({
                latestUserMessage,
                hasPreviousImage: true,
            }), latestUserMessage).toBe('fresh');
        }
    });

    it('builds redraw subjects that preserve semantic context without tracing the bitmap', () => {
        const subject = buildRedrawSubject({
            previousSubject: 'KIA EV9 next to Chevy Tahoe in front of a big city',
            userInstruction: 'redraw with less black',
            enhancedPrompt: 'KIA EV9 and Chevy Tahoe in a city, clean sketch',
        });

        expect(subject).toContain('Same subject and setting');
        expect(subject).toContain('KIA EV9 next to Chevy Tahoe');
        expect(subject).toContain('redraw with less black');
        expect(subject).toContain('Create a new drawing from scratch');
        expect(subject).toContain('do not trace');
    });
});
