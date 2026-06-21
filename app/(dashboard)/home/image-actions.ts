import { toast } from 'sonner';
import type { DisplayMessage } from './message-bubble';

function isTouchDevice() {
    return typeof window !== 'undefined' && (
        'ontouchstart' in window || navigator.maxTouchPoints > 0
    );
}

function ensurePrintStyles() {
    if (document.getElementById('mypaperpop-print-styles')) return;

    const style = document.createElement('style');
    style.id = 'mypaperpop-print-styles';
    style.textContent = `
        @media print {
            body.mypaperpop-printing > :not(#mypaperpop-print-root) {
                display: none !important;
            }

            #mypaperpop-print-root {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100vw !important;
                min-height: 100vh !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
            }

            #mypaperpop-print-root img {
                display: block !important;
                width: auto !important;
                height: auto !important;
                max-width: 100% !important;
                max-height: 100vh !important;
                object-fit: contain !important;
            }
        }
    `;
    document.head.appendChild(style);
}

export async function printImage(msg: DisplayMessage) {
    const imageUrl = msg.downloadUrl || msg.imageUrl!;

    if (isTouchDevice()) {
        sessionStorage.setItem('mypaperpop-print-image', JSON.stringify({
            imageUrl,
            returnTo: `${window.location.pathname}${window.location.search}`,
        }));
        window.location.assign('/print');
        toast('Opening print preview...');
        return;
    }

    ensurePrintStyles();

    const existingPrintRoot = document.getElementById('mypaperpop-print-root');
    existingPrintRoot?.remove();

    const printRoot = document.createElement('div');
    printRoot.id = 'mypaperpop-print-root';
    printRoot.setAttribute('aria-hidden', 'true');
    printRoot.style.display = 'none';

    const image = document.createElement('img');
    image.alt = 'Generated coloring page';
    image.src = imageUrl;
    printRoot.appendChild(image);
    document.body.appendChild(printRoot);

    const cleanup = () => {
        window.removeEventListener('afterprint', cleanup);
        document.body.classList.remove('mypaperpop-printing');
        printRoot.remove();
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => {
        if (document.body.contains(printRoot)) cleanup();
    }, 60_000);

    await new Promise<void>((resolve) => {
        if (image.complete && image.naturalWidth > 0) {
            resolve();
            return;
        }
        image.onload = () => resolve();
        image.onerror = () => resolve();
    });

    document.body.classList.add('mypaperpop-printing');
    window.print();
    toast('Opening print dialog...');
}

export async function saveImage(msg: DisplayMessage) {
    const imageUrl = msg.downloadUrl || msg.imageUrl!;

    if (isTouchDevice()) {
        window.location.href = imageUrl;
        return;
    }

    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `mypaperpop-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        toast.success('Image saved!');
    } catch {
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
}
