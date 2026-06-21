import { afterEach, describe, expect, it, vi } from 'vitest';
import { triggerDownload } from '@/lib/utils/download';

const originalDocument = globalThis.document;

afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: originalDocument,
    });
});

describe('triggerDownload', () => {
    it('creates, clicks, and removes a hidden download link with the provided filename', () => {
        const click = vi.fn();
        const link = {
            href: '',
            download: '',
            style: { display: '' },
            click,
        };
        const appendChild = vi.fn();
        const removeChild = vi.fn();

        Object.defineProperty(globalThis, 'document', {
            configurable: true,
            value: {
                createElement: vi.fn(() => link),
                body: { appendChild, removeChild },
            },
        });

        triggerDownload('blob:https://example.com/image', 'page.png');

        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(link.href).toBe('blob:https://example.com/image');
        expect(link.download).toBe('page.png');
        expect(link.style.display).toBe('none');
        expect(appendChild).toHaveBeenCalledWith(link);
        expect(click).toHaveBeenCalledTimes(1);
        expect(removeChild).toHaveBeenCalledWith(link);
    });

    it('uses a timestamped default filename when none is provided', () => {
        vi.spyOn(Date, 'now').mockReturnValue(12345);
        const link = {
            href: '',
            download: '',
            style: { display: '' },
            click: vi.fn(),
        };

        Object.defineProperty(globalThis, 'document', {
            configurable: true,
            value: {
                createElement: vi.fn(() => link),
                body: { appendChild: vi.fn(), removeChild: vi.fn() },
            },
        });

        triggerDownload('/colored.png');

        expect(link.download).toBe('mypaperpop-colored-12345.png');
    });
});
