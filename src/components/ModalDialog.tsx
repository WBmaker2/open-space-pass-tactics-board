import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

interface ModalDialogProps {
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** 접근 가능한 대화상자: Escape·닫기 버튼 지원, 열림 때 초점 이동, 닫힘 때 원래 초점 복원. */
export function ModalDialog({ title, onClose, children }: ModalDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const container = containerRef.current;
    if (!container) return;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="dialog-overlay" ref={containerRef} onKeyDown={handleKeyDown}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-dialog-title">
        <div className="dialog__header">
          <h2 id="modal-dialog-title">{title}</h2>
          <button ref={closeButtonRef} type="button" className="dialog__close" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="dialog__body">{children}</div>
      </div>
    </div>
  );
}
