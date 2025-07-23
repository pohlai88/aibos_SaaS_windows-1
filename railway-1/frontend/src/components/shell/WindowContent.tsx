import React, { forwardRef, useState, useEffect, useRef } from 'react';

interface WindowContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  windowId?: string; // For ARIA landmark relationships
  showScrollIndicators?: boolean; // Toggle for scroll shadows
}

// Design tokens for consistent theming
const CONTENT_TOKENS = {
  height: 'var(--window-body-height, calc(100% - 40px))',
  scrollbar: {
    track: 'scrollbar-track-white/5',
    thumb: 'scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30',
    width: 'scrollbar-w-2'
  },
  focus: {
    ring: 'focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-1',
    outline: 'focus-visible:outline-none'
  },
  scroll: {
    shadow: {
      top: 'before:absolute before:top-0 before:left-0 before:right-0 before:h-4 before:bg-gradient-to-b before:from-black/10 before:to-transparent before:pointer-events-none before:z-10',
      bottom: 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-4 after:bg-gradient-to-t after:from-black/10 after:to-transparent after:pointer-events-none after:z-10'
    }
  }
};

const WindowContent = forwardRef<HTMLDivElement, WindowContentProps>(({
  children,
  className = '',
  style = {},
  onScroll,
  windowId,
  showScrollIndicators = true
}, ref) => {
  const [scrollState, setScrollState] = useState({
    isAtTop: true,
    isAtBottom: false,
    hasScrollableContent: false
  });

  const contentRef = useRef<HTMLDivElement>(null);

  // Use useImperativeHandle to properly handle ref forwarding
  React.useImperativeHandle(ref, () => contentRef.current!, []);

  // Enhanced scroll handling with state tracking
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;

    const newScrollState = {
      isAtTop: scrollTop === 0,
      isAtBottom: Math.abs(scrollTop + clientHeight - scrollHeight) < 1,
      hasScrollableContent: scrollHeight > clientHeight
    };

    setScrollState(newScrollState);
    onScroll?.(e);
  };

  // Check for scrollable content on mount and resize
  useEffect(() => {
    const checkScrollableContent = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current;
        setScrollState(prev => ({
          ...prev,
          hasScrollableContent: scrollHeight > clientHeight
        }));
      }
    };

    checkScrollableContent();

    // Use ResizeObserver for dynamic content changes
    const resizeObserver = new ResizeObserver(checkScrollableContent);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [children]);

  // Determine ARIA role and attributes based on context
  const getAriaAttributes = () => {
    if (windowId) {
      // Multi-window app: use region with labeled relationship
      return {
        role: 'region' as const,
        'aria-labelledby': `window-title-${windowId}`,
        'aria-label': `Content area for ${windowId} window`
      };
    } else {
      // Single window or standalone: use main
      return {
        role: 'main' as const,
        'aria-label': 'Window content area'
      };
    }
  };

  // Build dynamic className with scroll indicators
  const buildClassName = () => {
    const baseClasses = [
      'w-full h-full bg-transparent overflow-auto relative',
      CONTENT_TOKENS.focus.outline,
      CONTENT_TOKENS.focus.ring,
      CONTENT_TOKENS.scrollbar.track,
      CONTENT_TOKENS.scrollbar.thumb,
      CONTENT_TOKENS.scrollbar.width
    ];

    // Add scroll shadows when enabled and content is scrollable
    if (showScrollIndicators && scrollState.hasScrollableContent) {
      if (!scrollState.isAtTop) {
        baseClasses.push(CONTENT_TOKENS.scroll.shadow.top);
      }
      if (!scrollState.isAtBottom) {
        baseClasses.push(CONTENT_TOKENS.scroll.shadow.bottom);
      }
    }

    return `${baseClasses.join(' ')} ${className}`;
  };

  return (
    <div
      ref={contentRef}
      className={buildClassName()}
      style={{
        height: CONTENT_TOKENS.height,
        ...style
      }}
      tabIndex={-1}
      onScroll={handleScroll}
      {...getAriaAttributes()}
    >
      {/* Scroll position indicator for screen readers */}
      {scrollState.hasScrollableContent && (
        <div className="sr-only" aria-live="polite">
          {scrollState.isAtTop
            ? 'At the top of the content'
            : scrollState.isAtBottom
              ? 'At the bottom of the content'
              : 'Scrolling through content'
          }
        </div>
      )}

      {children}
    </div>
  );
});

WindowContent.displayName = 'WindowContent';

export default WindowContent;
