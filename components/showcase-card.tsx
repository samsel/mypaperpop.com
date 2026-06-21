'use client';

import { Camera, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePostHog } from 'posthog-js/react';
import { StarRating } from '@/components/star-rating';
import { triggerDownload } from '@/lib/utils/download';

interface ShowcaseCardProps {
    originalImageUrl: string;
    coloredPhotoUrl: string | null;
    compositeUrl?: string | null;
    compositeDownloadUrl: string | null;
    /** AI compliment text, displayed as caption inside the card */
    caption?: string;
    /** Current star rating value */
    rating?: number | null;
    /** Callback when user rates */
    onRate?: (value: number | null) => void;
}

export function ShowcaseCard({
    originalImageUrl,
    coloredPhotoUrl,
    compositeUrl,
    compositeDownloadUrl,
    caption,
    rating,
    onRate,
}: ShowcaseCardProps) {
    const posthog = usePostHog();

    if (!coloredPhotoUrl) return null;

    async function handleDownload() {
        const url = compositeDownloadUrl || coloredPhotoUrl;
        if (!url) return;
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            triggerDownload(blobUrl);
            URL.revokeObjectURL(blobUrl);
            toast.success('Image saved!');
        } catch {
            triggerDownload(url);
        }
    }

    async function handleShare() {
        const url = compositeDownloadUrl || coloredPhotoUrl;
        if (!url) return;

        posthog.capture('showcase_share_clicked');

        if (!navigator.share) {
            toast.message('Sharing is not available here. Saving the image instead.');
            await handleDownload();
            return;
        }

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], 'mypaperpop-color-show.png', { type: blob.type || 'image/png' });
            const navWithFiles = navigator as Navigator & {
                canShare?: (data: ShareData) => boolean;
            };

            if (!navWithFiles.canShare || navWithFiles.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'MyPaperPop Color & Show',
                    text: 'Before and after coloring page',
                });
                return;
            }

            await navigator.share({
                title: 'MyPaperPop Color & Show',
                text: 'Before and after coloring page',
                url,
            });
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            toast.message('Sharing failed. Saving the image instead.');
            await handleDownload();
        }
    }

    function handleInstagram() {
        posthog.capture('showcase_instagram_clicked');
        // Download the composite for easy Instagram sharing, then open IG
        handleDownload();
        window.open('https://www.instagram.com/my_paperpop/', '_blank', 'noopener,noreferrer');
    }

    return (
        <div className="paper-sheet w-full overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-2 sm:max-w-[480px]">
            {/* Zone 1: Branded share image */}
            <div className="p-3 sm:p-4 pb-2">
                {compositeUrl ? (
                    <div className="overflow-hidden rounded-md border-[1.5px] border-[var(--ink)] bg-white">
                        <img
                            src={compositeUrl}
                            alt="Made with MyPaperPop side-by-side coloring page"
                            className="h-auto w-full"
                        />
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <div className="overflow-hidden rounded-md border-[1.5px] border-[var(--ink)] bg-white">
                                <img
                                    src={originalImageUrl}
                                    alt="Original AI-generated coloring page sketch"
                                    className="w-full h-auto aspect-square object-contain"
                                />
                            </div>
                            <p className="mt-1.5 text-center font-hand text-[11px] text-[var(--ink)]/60">Original</p>
                        </div>
                        <div className="flex-1">
                            <div className="overflow-hidden rounded-md border-[1.5px] border-[var(--ink)] bg-white">
                                <img
                                    src={coloredPhotoUrl}
                                    alt="Colored version of the coloring page"
                                    className="w-full h-auto aspect-square object-contain"
                                />
                            </div>
                            <p className="mt-1.5 text-center font-hand text-[11px] text-[var(--ink)]/60">Colored</p>
                        </div>
                    </div>
                )}
                <p className="mt-2 text-center font-hand text-[11px] text-[var(--ink)]/45">Made with MyPaperPop - mypaperpop.com</p>
            </div>

            {/* Zone 2: Caption + Rating */}
            {(caption || onRate) && (
                <div className="px-4 pb-3">
                    {caption && (
                        <p className="mb-2 text-[14px] leading-relaxed text-[var(--ink)]">
                            {caption}
                        </p>
                    )}
                    {onRate && (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[var(--ink)]/55">How did we do?</span>
                            <StarRating
                                value={rating ?? null}
                                onChange={onRate}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Zone 3: Action tray */}
            <div className="paper-dashed grid grid-cols-3 px-2 py-2">
                <button
                    onClick={handleDownload}
                    className="flex flex-col items-center gap-1 rounded-md py-1.5 transition-all hover:bg-[var(--paper-card)] active:scale-95"
                >
                    <Download className="w-4 h-4 text-[var(--ink)]/65" />
                    <span className="text-[10px] font-semibold text-[var(--ink)]/70">Save</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1 rounded-md py-1.5 transition-all hover:bg-[var(--paper-card)] active:scale-95"
                >
                    <Share2 className="w-4 h-4 text-[var(--ink)]/65" />
                    <span className="text-[10px] font-semibold text-[var(--ink)]/70">Share</span>
                </button>
                <button
                    onClick={handleInstagram}
                    className="flex flex-col items-center gap-1 rounded-md py-1.5 transition-all hover:bg-[var(--paper-card)] active:scale-95"
                >
                    <Camera className="w-4 h-4 text-[var(--ink)]/65" />
                    <span className="text-[10px] font-semibold text-[var(--ink)]/70">Instagram</span>
                </button>
            </div>
        </div>
    );
}
