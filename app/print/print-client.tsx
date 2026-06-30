'use client';

import { ArrowLeft, Printer } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type PrintPayload = {
    imageUrl: string;
    returnTo?: string;
};

const STORAGE_KEY = 'mypaperpop-print-image';
const LETTER_PORTRAIT = { width: 612, height: 792 };
const PRINT_DPI_SCALE = 4;

function readPayload(): PrintPayload | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const payload = JSON.parse(raw) as Partial<PrintPayload>;
        if (!payload.imageUrl) return null;
        return {
            imageUrl: payload.imageUrl,
            returnTo: payload.returnTo || '/home',
        };
    } catch {
        return null;
    }
}

function loadPrintableImage(imageUrl: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        if (!imageUrl.startsWith('data:')) {
            image.crossOrigin = 'anonymous';
        }
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Could not load print image'));
        image.src = imageUrl;
    });
}

function base64ToBytes(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
}

function textToBytes(value: string) {
    return new TextEncoder().encode(value);
}

function concatBytes(chunks: Uint8Array[]) {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const output = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        output.set(chunk, offset);
        offset += chunk.length;
    }
    return output;
}

function makePdfBlobFromJpeg(jpegBytes: Uint8Array, imageWidth: number, imageHeight: number) {
    const page = LETTER_PORTRAIT;
    const objects = [
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
        `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
        `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
        '\nendstream\nendobj\n',
    ];
    const content = `q\n${page.width} 0 0 ${page.height} 0 0 cm\n/Im0 Do\nQ\n`;
    const contentBytes = textToBytes(content);
    const contentObject = `5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream\nendobj\n`;

    const chunks: Uint8Array[] = [textToBytes('%PDF-1.4\n')];
    const offsets = [0];
    let byteOffset = chunks[0].length;

    for (let index = 0; index < objects.length; index += 1) {
        offsets.push(byteOffset);
        if (index === 3) {
            const header = textToBytes(objects[index]);
            const footer = textToBytes(objects[index + 1]);
            chunks.push(header, jpegBytes, footer);
            byteOffset += header.length + jpegBytes.length + footer.length;
            index += 1;
            continue;
        }
        const objectBytes = textToBytes(objects[index]);
        chunks.push(objectBytes);
        byteOffset += objectBytes.length;
    }

    offsets.push(byteOffset);
    chunks.push(textToBytes(contentObject));
    byteOffset += textToBytes(contentObject).length;

    const xrefOffset = byteOffset;
    const xrefRows = [
        'xref',
        '0 6',
        '0000000000 65535 f ',
        ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
        'trailer',
        '<< /Size 6 /Root 1 0 R >>',
        'startxref',
        String(xrefOffset),
        '%%EOF',
        '',
    ].join('\n');
    chunks.push(textToBytes(xrefRows));
    return new Blob([concatBytes(chunks) as BlobPart], { type: 'application/pdf' });
}

function findContentBounds(context: CanvasRenderingContext2D, width: number, height: number) {
    const { data } = context.getImageData(0, 0, width, height);
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const offset = (y * width + x) * 4;
            const alpha = data[offset + 3];
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];
            if (alpha > 16 && Math.min(r, g, b) < 238) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (minX > maxX || minY > maxY) {
        return { x: 0, y: 0, width, height };
    }

    const padding = Math.round(Math.min(width, height) * 0.025);
    return {
        x: Math.max(0, minX - padding),
        y: Math.max(0, minY - padding),
        width: Math.min(width, maxX + padding) - Math.max(0, minX - padding),
        height: Math.min(height, maxY + padding) - Math.max(0, minY - padding),
    };
}

async function createPrintableAsset(imageUrl: string) {
    const image = await loadPrintableImage(imageUrl);
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = image.naturalWidth;
    sourceCanvas.height = image.naturalHeight;
    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) throw new Error('Could not prepare print image');
    sourceContext.fillStyle = '#fff';
    sourceContext.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceContext.drawImage(image, 0, 0);

    const crop = findContentBounds(sourceContext, sourceCanvas.width, sourceCanvas.height);
    const page = LETTER_PORTRAIT;
    const outputWidth = page.width * PRINT_DPI_SCALE;
    const outputHeight = page.height * PRINT_DPI_SCALE;
    const margin = Math.round(Math.min(outputWidth, outputHeight) * 0.045);
    const printableWidth = outputWidth - margin * 2;
    const printableHeight = outputHeight - margin * 2;
    const scale = Math.min(printableWidth / crop.width, printableHeight / crop.height);
    const drawWidth = Math.round(crop.width * scale);
    const drawHeight = Math.round(crop.height * scale);
    const drawX = Math.round((outputWidth - drawWidth) / 2);
    const drawY = Math.round((outputHeight - drawHeight) / 2);

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;
    const outputContext = outputCanvas.getContext('2d');
    if (!outputContext) throw new Error('Could not compose print PDF');
    outputContext.fillStyle = '#fff';
    outputContext.fillRect(0, 0, outputWidth, outputHeight);
    outputContext.imageSmoothingEnabled = true;
    outputContext.imageSmoothingQuality = 'high';
    outputContext.drawImage(sourceCanvas, crop.x, crop.y, crop.width, crop.height, drawX, drawY, drawWidth, drawHeight);

    const previewUrl = outputCanvas.toDataURL('image/png');
    const jpegBase64 = outputCanvas.toDataURL('image/jpeg', 0.96).split(',')[1];
    const pdfBlob = makePdfBlobFromJpeg(base64ToBytes(jpegBase64), outputWidth, outputHeight);
    return {
        pdfUrl: URL.createObjectURL(pdfBlob),
        previewUrl,
    };
}

type PrintAsset = Awaited<ReturnType<typeof createPrintableAsset>>;

export function PrintClient() {
    const [payload, setPayload] = useState<PrintPayload | null>(null);
    const [printAsset, setPrintAsset] = useState<PrintAsset | null>(null);
    const [printError, setPrintError] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const didPrintRef = useRef(false);

    useEffect(() => {
        setPayload(readPayload());
    }, []);

    useEffect(() => {
        if (!payload) return;
        let disposed = false;
        setReady(false);
        setPrintError(null);
        createPrintableAsset(payload.imageUrl)
            .then((asset) => {
                if (disposed) {
                    URL.revokeObjectURL(asset.pdfUrl);
                    return;
                }
                setPrintAsset(asset);
                setReady(true);
            })
            .catch(() => {
                if (!disposed) {
                    setPrintError('The print page could not be prepared. Try Save, then print the saved image.');
                    setReady(true);
                }
            });

        return () => {
            disposed = true;
        };
    }, [payload]);

    const printPage = useCallback(() => {
        if (!printAsset) return;
        Object.assign(window, { __mypaperpopPrintCalled: true });
        window.print();
    }, [printAsset]);

    useEffect(() => {
        if (!ready || !printAsset || didPrintRef.current) return;
        didPrintRef.current = true;
        const isTestDisabled = Boolean((window as typeof window & { __mypaperpopDisableAutoPdfOpen?: boolean }).__mypaperpopDisableAutoPdfOpen);
        if (isTestDisabled) return;
        const timeout = window.setTimeout(printPage, 500);
        return () => window.clearTimeout(timeout);
    }, [printAsset, printPage, ready]);

    const goBack = () => {
        window.location.assign(payload?.returnTo || '/home');
    };

    if (!payload) {
        return (
            <main className="min-h-dvh bg-[#f8f1e3] px-5 py-8 text-[#2f261c]">
                <div className="mx-auto flex max-w-md flex-col gap-4 rounded-[18px] border-2 border-[#2f261c] bg-white p-5 shadow-[4px_4px_0_#2f261c]">
                    <h1 className="font-display text-2xl font-bold">Print preview expired</h1>
                    <p className="text-sm text-[#6f6255]">
                        Go back to your coloring page and tap Print again.
                    </p>
                    <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#2f261c] bg-[#ff7a1a] px-4 text-sm font-bold text-white shadow-[2px_2px_0_#2f261c]"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to sketchpad
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="print-document">
            <style jsx global>{`
                @page {
                    size: letter;
                    margin: 0;
                }

                @media print {
                    html,
                    body {
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        background: #fff !important;
                    }

                    .print-toolbar {
                        display: none !important;
                    }

                    .print-document {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        overflow: hidden !important;
                    }

                    .print-preview-shell {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        min-height: 100vh !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        overflow: hidden !important;
                    }

                    .print-preview-image {
                        display: block !important;
                        width: auto !important;
                        height: auto !important;
                        max-width: 100vw !important;
                        max-height: 100vh !important;
                        object-fit: contain !important;
                    }
                }
            `}</style>
            <div className="print-toolbar fixed inset-x-0 top-0 z-10 flex items-center justify-between border-b-2 border-[#2f261c] bg-[#f8f1e3] px-4 py-3 text-[#2f261c]">
                <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2f261c] bg-white shadow-[2px_2px_0_#2f261c]"
                    aria-label="Back to sketchpad"
                >
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="font-display text-lg font-bold">Print preview</div>
                <button
                    type="button"
                    onClick={printPage}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2f261c] bg-[#ff7a1a] text-white shadow-[2px_2px_0_#2f261c]"
                    aria-label="Print coloring page"
                    disabled={!printAsset}
                >
                    <Printer className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>
            <section className="print-preview-shell flex min-h-dvh items-center justify-center bg-[#d8d8d8] px-3 pb-4 pt-20">
                {printError ? (
                    <div className="max-w-sm rounded-[18px] border-2 border-[#2f261c] bg-white p-5 text-sm text-[#2f261c] shadow-[4px_4px_0_#2f261c]">
                        {printError}
                    </div>
                ) : printAsset ? (
                    <>
                        <img
                            className="print-preview-image block h-[calc(100dvh-6rem)] w-full max-w-4xl rounded-sm bg-white object-contain"
                            src={printAsset.previewUrl}
                            alt="Printable coloring page preview"
                            data-testid="print-preview-image"
                        />
                        <a
                            className="sr-only"
                            href={printAsset.pdfUrl}
                            data-testid="print-pdf-link"
                        >
                            Open print-ready PDF
                        </a>
                    </>
                ) : (
                    <div className="rounded-[18px] border-2 border-[#2f261c] bg-white p-5 text-sm font-bold text-[#2f261c] shadow-[4px_4px_0_#2f261c]">
                        Preparing print page...
                    </div>
                )}
            </section>
        </main>
    );
}
