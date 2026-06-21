import type React from 'react';

export function ConversationLoadingSkeleton() {
    return (
        <main className="absolute inset-0 flex flex-col bg-[#f7f1e6] text-[var(--ink)]">
            <div className="chat-scroll flex-1 overflow-x-hidden overflow-y-auto bg-white">
                <section className="mx-auto flex min-h-full w-full max-w-[860px] flex-col gap-5 overflow-x-hidden p-4 pb-6 sm:p-6 lg:px-8">
                    <div className="self-start">
                        <Shimmer className="mb-2 h-3 w-20 rounded" />
                        <div className="space-y-2">
                            <Shimmer className="h-4 w-56 max-w-[70vw] rounded" />
                            <Shimmer className="h-4 w-72 max-w-[78vw] rounded" />
                        </div>
                    </div>

                    <div className="self-end">
                        <Shimmer className="mb-2 ml-auto h-3 w-10 rounded" />
                        <div className="rounded-lg border-[1.5px] border-[var(--ink)] bg-white px-3 py-2">
                            <Shimmer className="h-4 w-44 max-w-[60vw] rounded" />
                        </div>
                    </div>

                    <div className="self-start">
                        <Shimmer className="mb-2 h-3 w-20 rounded" />
                        <div className="w-full max-w-[min(100%,34rem)] overflow-hidden rounded-md border border-black/15 bg-white p-2 shadow-[0_10px_24px_rgba(31,26,23,0.12)] sm:p-3">
                            <Shimmer className="mx-auto aspect-[3/4] max-h-[52dvh] max-w-[360px] rounded-sm bg-[var(--paper-alt)]" />
                            <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-black/10 pt-2">
                                <Shimmer className="h-9 rounded-md" />
                                <Shimmer className="h-9 rounded-md" />
                                <Shimmer className="h-9 rounded-md" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="safe-area-bottom relative z-10 w-full border-t border-black/10 bg-white/88 px-4 py-3 shadow-[0_-10px_30px_rgba(31,26,23,0.08)] backdrop-blur-md sm:py-5">
                <div className="relative mx-auto max-w-[860px]">
                    <div className="rounded-md border border-black/12 bg-white shadow-sm">
                        <div className="border-b border-black/10 bg-[#fbf6ec] px-4 pb-2 pt-3">
                            <div className="grid grid-cols-4 gap-1.5 sm:flex">
                                {[64, 52, 48, 44].map((width) => (
                                    <Shimmer key={width} className="h-7 rounded-full" style={{ width }} />
                                ))}
                            </div>
                            <Shimmer className="mt-2 h-3 w-56 max-w-[70vw] rounded" />
                        </div>
                        <div className="relative px-5 py-4">
                            <Shimmer className="h-5 w-52 max-w-[65vw] rounded" />
                            <Shimmer className="absolute bottom-2.5 right-2.5 h-10 w-10 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={`animate-pulse bg-[var(--paper-alt)] ${className ?? ''}`}
            style={style}
        />
    );
}
