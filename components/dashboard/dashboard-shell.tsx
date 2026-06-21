'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { PurchaseSuccessBanner } from '@/components/purchase-success-banner';
import { CheckoutErrorBanner } from '@/components/checkout-error-banner';
import useSWR from 'swr';

import { usePostHog } from 'posthog-js/react';
import { fetcher } from '@/lib/fetcher';
import { useDrag } from '@use-gesture/react';
import { haptics } from '@/lib/haptics';

const SIDEBAR_WIDTH = 300; // max-w-[300px]
const EDGE_ZONE = 30; // px from left edge to trigger swipe-to-open
const OPEN_THRESHOLD = 70; // px drag distance to open
const CLOSE_THRESHOLD_RATIO = 0.3; // 30% of sidebar width to close
const VELOCITY_THRESHOLD = 0.5;

interface DashboardUser {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  creditBalance: number;
  freeRemaining: number;
  totalRemaining: number;
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: user } = useSWR<DashboardUser>('/api/user', fetcher);

  // Drag state for follow-the-finger sidebar
  const [sidebarDragX, setSidebarDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && posthog) {
      posthog.identify(String(user.id), {
        email: user.email,
        name: user.name,
        creditBalance: user.creditBalance,
      });
    }
  }, [user, posthog]);

  const showSidebar = !!user;
  const activeConversationId = searchParams.get('c')
    ? parseInt(searchParams.get('c')!, 10)
    : undefined;

  const handleConversationSelect = (id: number) => {
    router.push(`/home?c=${id}`);
  };

  const handleNewConversation = () => {
    router.push(`/home?new=${Date.now()}`);
  };

  const openSidebar = useCallback(() => {
    setIsMobileMenuOpen(true);
    setSidebarDragX(0);
    haptics.light();
  }, []);

  const closeSidebar = useCallback(() => {
    setIsMobileMenuOpen(false);
    setSidebarDragX(0);
    haptics.light();
  }, []);

  // Swipe-to-open: detect right swipe from left edge on main content
  const bindEdgeSwipe = useDrag(
    ({ first, xy: [x], delta: [dx], velocity: [vx], direction: [dirX], cancel, memo }) => {
      if (!showSidebar || isMobileMenuOpen) return;
      // Only detect on mobile
      if (typeof window !== 'undefined' && window.innerWidth >= 768) return;

      if (first) {
        // Only start if touch began in the left edge zone
        if (x > EDGE_ZONE) {
          cancel();
          return;
        }
        return 'edge-swipe';
      }

      if (memo !== 'edge-swipe') return;

      if (dx > OPEN_THRESHOLD || (vx > VELOCITY_THRESHOLD && dirX > 0)) {
        openSidebar();
        cancel();
      }
    },
    { axis: 'x', filterTaps: true, pointer: { touch: true } }
  );

  // Swipe-to-close: drag the sidebar panel left
  const bindSidebarDrag = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dirX], cancel }) => {
      if (!isMobileMenuOpen) return;

      // Only allow dragging left (negative)
      const clampedX = Math.min(0, mx);

      if (active) {
        setIsDragging(true);
        setSidebarDragX(clampedX);
      } else {
        setIsDragging(false);
        const draggedPast = Math.abs(clampedX) > SIDEBAR_WIDTH * CLOSE_THRESHOLD_RATIO;
        const flicked = vx > VELOCITY_THRESHOLD && dirX < 0;

        if (draggedPast || flicked) {
          closeSidebar();
        } else {
          setSidebarDragX(0);
        }
      }
    },
    { axis: 'x', filterTaps: true, pointer: { touch: true } }
  );

  // Compute sidebar transform and backdrop opacity
  const sidebarTranslateX = isMobileMenuOpen ? sidebarDragX : -SIDEBAR_WIDTH;
  const backdropOpacity = isMobileMenuOpen
    ? Math.max(0, 1 - Math.abs(sidebarDragX) / SIDEBAR_WIDTH)
    : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]" style={{ height: '100dvh' }}>

      {/* Desktop Sidebar - Only if logged in */}
      {showSidebar && (
        <aside className="hidden md:flex flex-col w-[230px] flex-shrink-0 z-30">
          <AppSidebar
            activeConversationId={activeConversationId}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            onConversationDeleted={(id) => {
              if (activeConversationId === id) {
                handleNewConversation();
              }
            }}
          />
        </aside>
      )}

      {/* Main Content Area */}
      <div {...bindEdgeSwipe()} className="flex-1 flex flex-col min-w-0 h-full relative touch-pan-y">

        {/* Mobile Header - Only if logged in (to trigger menu) */}
        {showSidebar && (
          <header className="md:hidden flex items-center justify-between px-4 py-3 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper)] z-20">
            <button
              data-testid="mobile-menu-trigger"
              onClick={openSidebar}
              className="p-2 -ml-2 text-[var(--ink)]"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Logo className="w-5 h-5" />
              <span className="font-display text-xl text-[var(--ink)]">mypaperpop</span>
            </div>
            <div className="rounded-full border-[1.5px] border-[var(--ink)] bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--ink)]">
              {user?.totalRemaining ?? 0} left
            </div>
          </header>
        )}

        {/* Mobile Sidebar Overlay - always mounted for animation */}
        {showSidebar && (
          <div
            data-testid="mobile-sidebar-overlay"
            className="fixed inset-0 z-50 md:hidden"
            style={{
              pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
              visibility: isMobileMenuOpen || isDragging ? 'visible' : 'hidden',
            }}
          >
            {/* Backdrop */}
            <div
              data-testid="mobile-sidebar-backdrop"
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              style={{
                opacity: backdropOpacity,
                transition: isDragging ? 'none' : 'opacity 300ms ease',
              }}
              onClick={closeSidebar}
            />
            {/* Sidebar panel */}
            <div
              ref={sidebarRef}
              {...bindSidebarDrag()}
              className="relative w-[82%] max-w-[320px] bg-[var(--paper-card)] h-full flex flex-col touch-pan-y"
              style={{
                transform: `translateX(${sidebarTranslateX}px)`,
                transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div className="flex items-center justify-end px-3 pt-2">
                <button
                  data-testid="mobile-sidebar-close"
                  onClick={closeSidebar}
                  className="p-2 text-[var(--ink)]/60 hover:text-[var(--ink)]"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <AppSidebar
                className="flex-1 h-auto min-h-0"
                closeMobile={closeSidebar}
                activeConversationId={activeConversationId}
                onConversationSelect={handleConversationSelect}
                onNewConversation={handleNewConversation}
                onConversationDeleted={(id) => {
                  if (activeConversationId === id) {
                    handleNewConversation();
                  }
                }}
              />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-hidden relative bg-[var(--paper)] flex flex-col">
          <PurchaseSuccessBanner />
          <CheckoutErrorBanner />
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DashboardShellInner>{children}</DashboardShellInner>
    </Suspense>
  );
}
