import type { CSSProperties, ReactNode } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export type ModalSize = "sm" | "md" | "lg";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const SIZE_MAP: Record<ModalSize, string> = {
  sm: "min(28rem, 100%)",
  md: "min(38rem, 100%)",
  lg: "min(52rem, 100%)",
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  footer?: ReactNode;
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  closeOnOverlay = true,
  showCloseButton = true,
  initialFocusRef,
  className,
  style,
  children,
  ...rest
}) => {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const node = document.createElement("div");
    node.setAttribute("data-kit-modal-root", "true");
    document.body.appendChild(node);
    portalRef.current = node;
    setIsMounted(true);

    return () => {
      document.body.removeChild(node);
      portalRef.current = null;
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    previousActiveElement.current = document.activeElement as HTMLElement | null;

    const focusInitial = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus({ preventScroll: true });
        return;
      }
      const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus({ preventScroll: true });
      } else {
        dialog.focus({ preventScroll: true });
      }
    };

    focusInitial();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !active) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    const { style: bodyStyle } = document.body;
    const previousOverflow = bodyStyle.overflow;
    bodyStyle.overflow = "hidden";

    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
      bodyStyle.overflow = previousOverflow;
      const previouslyFocused = previousActiveElement.current;
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [initialFocusRef, onClose, open]);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && closeOnOverlay) {
        onClose?.();
      }
    },
    [closeOnOverlay, onClose]
  );

  const idBase = useId();
  const modalIds = useMemo(
    () => ({
      titleId: title ? `${idBase}-title` : undefined,
      descriptionId: description ? `${idBase}-description` : undefined,
    }),
    [description, idBase, title]
  );

  const styleVars: CSSVars = {
    "--kit-modal-width": SIZE_MAP[size],
  };

  if (!open || !isMounted || !portalRef.current) {
    return null;
  }

  return createPortal(
    <div className="kit-modal__overlay" onMouseDown={handleOverlayClick}>
      <div
        {...rest}
        ref={dialogRef}
        className={clsx("kit-modal", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalIds.titleId}
        aria-describedby={modalIds.descriptionId}
        tabIndex={-1}
        style={{ ...(styleVars as CSSProperties), ...style }}
      >
        {showCloseButton ? (
          <button
            type="button"
            className="kit-modal__close"
            aria-label="إغلاق"
            onClick={onClose}
          >
            ×
          </button>
        ) : null}

        {(title || description) && (
          <header className="kit-modal__header">
            {title ? (
              <h2 id={modalIds.titleId} className="kit-modal__title">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={modalIds.descriptionId} className="kit-modal__description">
                {description}
              </p>
            ) : null}
          </header>
        )}

        <div className="kit-modal__body">{children}</div>

        {footer ? <footer className="kit-modal__footer">{footer}</footer> : null}
      </div>
    </div>,
    portalRef.current
  );
};

export default Modal;
