'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, UserCircle, MoreVertical, Trash2, MessageSquare, Sparkles, Images } from 'lucide-react';
import { PaperpopWordmark } from '@/components/paper-studio';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { apiClient } from '@/lib/api-client';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { toast } from 'sonner';
import { CookieSettingsButton } from '@/components/cookie-consent-banner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface ConversationItem {
    id: number;
    title: string;
    thumbnailUrl: string | null;
    updatedAt: string;
    createdAt: string;
}

interface SidebarUser {
    email: string;
    name: string | null;
    image: string | null;
    creditBalance: number;
    freeRemaining: number;
    freeDailyLimit: number;
    totalRemaining: number;
}

interface AppSidebarProps {
    className?: string;
    closeMobile?: () => void;
    activeConversationId?: number;
    onConversationSelect?: (id: number) => void;
    onNewConversation?: () => void;
    onConversationDeleted?: (id: number) => void;
}

function SidebarThumbnail({ src }: { src: string | null }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-[var(--ink)] bg-white">
                <Images className="h-4 w-4 text-[var(--ink)]/45" aria-hidden="true" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt=""
            width={40}
            height={40}
            onError={() => setFailed(true)}
            className="h-8 w-8 flex-shrink-0 rounded border border-[var(--ink)] bg-white object-cover"
        />
    );
}

function AccountAvatar({ src }: { src: string | null | undefined }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return <UserCircle className="h-7 w-7 flex-shrink-0 text-[var(--ink)]/70" />;
    }

    return (
        <img
            src={src}
            alt=""
            onError={() => setFailed(true)}
            className="h-7 w-7 flex-shrink-0 rounded-full border-[1.5px] border-[var(--ink)] bg-white object-cover"
        />
    );
}

function groupByDate(items: ConversationItem[]): { label: string; conversations: ConversationItem[] }[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const last7 = new Date(today.getTime() - 7 * 86400000);

    const groups: Record<string, ConversationItem[]> = {
        Today: [],
        Yesterday: [],
        'Last 7 days': [],
        Older: [],
    };

    for (const item of items) {
        const d = new Date(item.updatedAt);
        if (d >= today) groups['Today'].push(item);
        else if (d >= yesterday) groups['Yesterday'].push(item);
        else if (d >= last7) groups['Last 7 days'].push(item);
        else groups['Older'].push(item);
    }

    return Object.entries(groups)
        .filter(([, items]) => items.length > 0)
        .map(([label, conversations]) => ({ label, conversations }));
}

function pluralize(value: number, singular: string, plural = `${singular}s`) {
    return `${value} ${value === 1 ? singular : plural}`;
}

function getQuotaCopy(user: SidebarUser | undefined) {
    const freeRemaining = user?.freeRemaining ?? 0;
    const paidRemaining = user?.creditBalance ?? 0;
    const totalRemaining = user?.totalRemaining ?? freeRemaining + paidRemaining;

    if (!user) {
        return {
            headline: 'Pages left',
            detail: 'Checking your daily pages',
        };
    }

    if (totalRemaining <= 0) {
        return {
            headline: '0 pages left',
            detail: 'free pages refresh daily',
        };
    }

    const parts = [
        freeRemaining > 0 ? `${freeRemaining} free today` : null,
        paidRemaining > 0 ? pluralize(paidRemaining, 'paid page') : null,
    ].filter(Boolean).join(' + ');

    return {
        headline: pluralize(totalRemaining, 'page') + ' left',
        detail: parts || 'free pages refresh daily',
    };
}

export function AppSidebar({ className, closeMobile, activeConversationId, onConversationSelect, onNewConversation, onConversationDeleted }: AppSidebarProps) {
    const pathname = usePathname();
    const { data: conversationList, isLoading } = useSWR<ConversationItem[]>('/api/conversations', fetcher);
    const { data: user } = useSWR<SidebarUser>('/api/user', fetcher);

    const isActive = (path: string) => pathname === path;
    const groups = useMemo(() => conversationList ? groupByDate(conversationList) : [], [conversationList]);

    const [deleteTarget, setDeleteTarget] = useState<ConversationItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const quotaCopy = getQuotaCopy(user);

    const handleNewConversation = () => {
        onNewConversation?.();
        closeMobile?.();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        setIsDeleting(true);
        try {
            await apiClient.delete(`/api/conversations/${id}`);
            // Optimistically remove from cache immediately, then revalidate in the background.
            await mutate('/api/conversations', (data: ConversationItem[] | undefined) =>
                data?.filter(c => c.id !== id), { revalidate: false }
            );
            void mutate('/api/conversations');
            onConversationDeleted?.(id);
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            toast.error('Failed to delete sketch');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className={cn("flex h-full flex-col border-r-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] text-[var(--ink)]", className)}>
            {/* Brand */}
            <div className="px-4 pt-4 pb-3">
                <PaperpopWordmark className="text-2xl text-[var(--ink)]" markSize={24} />
            </div>

            {/* Top: New Sketch */}
            <div className="px-3 pb-3 pt-1">
                <button
                    data-testid="sidebar-new-conversation"
                    onClick={handleNewConversation}
                    className="paper-hover flex w-full items-center gap-3 rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--orange)] px-3 py-2.5 text-left font-display text-base leading-none text-white"
                >
                    <Plus className="w-4 h-4" />
                    <span>New page</span>
                </button>
            </div>

            {/* Middle: Conversation History */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
                {isLoading ? (
                    <div className="space-y-3 px-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-2 py-2">
                                <div className="w-9 h-9 border border-[var(--ink)]/25 bg-white rounded-sm animate-pulse flex-shrink-0" />
                                <div className="flex-1 h-4 bg-[var(--ink)]/10 rounded-sm animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div data-testid="sidebar-empty-state" className="mx-1 flex flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-[var(--ink)] bg-white/45 px-4 py-8 text-center">
                        <div className="w-12 h-12 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--yellow)] flex items-center justify-center mb-3">
                            <Sparkles className="h-6 w-6 text-[var(--ink)]" />
                        </div>
                        <p className="text-sm leading-relaxed text-[var(--ink)]/65">Your sketchpads will live here. Describe your first idea to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groups.map((group) => (
                            <div key={group.label}>
                                <div className="px-2 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/55">
                                    {group.label}
                                </div>
                                <div className="space-y-0.5">
                                    {group.conversations.map((conv) => (
                                        <div key={conv.id} className="group relative" data-testid="sidebar-history-item">
                                            <button
                                                onClick={() => {
                                                    onConversationSelect?.(conv.id);
                                                    closeMobile?.();
                                                }}
                                                className={cn(
                                                    "w-full text-left px-1.5 py-1.5 rounded-md border-[1.5px] transition-colors flex items-center gap-2.5",
                                                    activeConversationId === conv.id
                                                        ? "border-[var(--ink)] bg-white text-[var(--ink)]"
                                                        : "border-transparent text-[var(--ink)]/75 hover:border-[var(--ink)] hover:bg-white/55 hover:text-[var(--ink)]"
                                                )}
                                            >
                                                <SidebarThumbnail src={conv.thumbnailUrl} />
                                                <span className={cn("text-[13px] truncate flex-1 min-w-0", activeConversationId === conv.id && "font-semibold")}>{conv.title}</span>
                                            </button>
                                            <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            data-testid="sidebar-delete-trigger"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="rounded-sm p-1 text-[var(--ink)]/45 opacity-0 transition-opacity hover:bg-[var(--paper-alt)] hover:text-[var(--ink)] group-hover:opacity-100 data-[state=open]:opacity-100"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteTarget(conv);
                                                            }}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom: Account + Footer */}
            <div className="space-y-2 border-t-[1.5px] border-[var(--ink)] p-3">
                <div className="rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--orange)] p-3 text-white">
                    <div className="font-display text-xl leading-none">
                        {quotaCopy.headline}
                    </div>
                    <div className="mt-0.5 font-hand text-sm">{quotaCopy.detail}</div>
                    <Link
                        href="/pricing"
                        onClick={closeMobile}
                        className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--ink)]"
                    >
                        Get more
                    </Link>
                </div>
                <button
                    onClick={() => setFeedbackOpen(true)}
                    className="flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors w-full text-[var(--ink)]/70 hover:bg-white/55 hover:text-[var(--ink)]"
                >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">Send Feedback</span>
                </button>
                <Link
                    href="/account"
                    onClick={closeMobile}
                    className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors w-full",
                        isActive('/account')
                            ? "bg-white text-[var(--ink)] border-[1.5px] border-[var(--ink)]"
                            : "border-[1.5px] border-transparent text-[var(--ink)]/70 hover:bg-white/55 hover:text-[var(--ink)]"
                    )}
                >
                    <AccountAvatar src={user?.image} />
                    <div className="min-w-0 flex-1 text-left">
                        <p className="font-medium">My Account</p>
                        {user?.email && <p className="truncate text-xs text-[var(--ink)]/55">{user.email}</p>}
                    </div>
                </Link>
                <p className="pt-1 text-center text-[10px] text-[var(--ink)]/45">&copy; 2026 Good Creator LLC</p>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5">
                    <Link href="/privacy" className="text-[10px] text-[var(--ink)]/45 transition-colors hover:text-[var(--ink)]">Privacy</Link>
                    <Link href="/terms" className="text-[10px] text-[var(--ink)]/45 transition-colors hover:text-[var(--ink)]">Terms</Link>
                    <CookieSettingsButton className="cursor-pointer text-[10px] text-[var(--ink)]/45 transition-colors hover:text-[var(--ink)]" />
                </div>
            </div>

            <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete coloring page?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this coloring page. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setDeleteTarget(null)}
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            variant="outline"
                            className="border-[var(--danger)] text-[var(--danger)]"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
