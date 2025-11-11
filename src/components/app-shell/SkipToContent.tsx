import React from 'react';
import VisuallyHidden from './VisuallyHidden';

export const focusContentTarget = (targetId: string): boolean => {
  if (typeof document === 'undefined') return false;
  const element = document.getElementById(targetId);
  if (!element) return false;

  if (typeof (element as HTMLElement).focus === 'function') {
    (element as HTMLElement).focus({ preventScroll: true });
  }

  if (typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return true;
};

type SkipToContentProps = {
  targetId?: string;
};

export const SkipToContent: React.FC<SkipToContentProps> = ({ targetId = 'content' }) => {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      focusContentTarget(targetId);
    },
    [targetId]
  );

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-to-content fixed top-2 right-4 z-[100] inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-soft transition-transform duration-150 focus-visible:translate-y-0 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card -translate-y-16"
    >
      <VisuallyHidden as="span">تخطي إلى المحتوى الرئيسي</VisuallyHidden>
      <span aria-hidden className="text-xs font-semibold tracking-wide uppercase">
        تخطي للمحتوى
      </span>
    </a>
  );
};

SkipToContent.displayName = 'SkipToContent';

export default SkipToContent;
