import React, { useEffect, useRef, type DialogHTMLAttributes } from 'react';
import styles from './Dialog.module.css';

export interface DialogProps extends DialogHTMLAttributes<HTMLDialogElement> {
    /**
     * Controls whether the dialog is open or closed.
     */
    open: boolean;
    /**
     * Callback fired when the dialog requests to close (backdrop click or ESC key).
     */
    onClose: () => void;
    /**
     * Content of the dialog.
     */
    children: React.ReactNode;
    /**
     * Optional custom class name.
     */
    className?: string;
    /**
     * Whether to reset dialog content state when closing.
     * When true (default), children will unmount/remount on each open.
     * When false, children state is preserved between opens.
     */
    resetOnClose?: boolean;
}

/**
 * A modal Dialog component that manages locking the scroll of the background and handling focus trap.
 * It uses the native HTML `<dialog>` element.
 * 
 * @example
 * <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
 *   <h1>Dialog Title</h1>
 *   <p>Dialog content goes here.</p>
 *   <button onClick={() => setIsOpen(false)}>Close</button>
 * </Dialog>
 */
export const Dialog = ({ open, onClose, children, className, resetOnClose = true, onCancel, onClick, ...rest }: DialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [resetKey, setResetKey] = React.useState(0);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        let handleTransitionEnd: (() => void) | undefined;

        if (open) {
            // --- OPEN STATE ---

            // 1. Dialog Visibility
            if (!dialog.open) {
                dialog.showModal();

                // 2. AutoFocus Management (React 19 / Modern Browsers check)
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        let autoFocusElement = dialog.querySelector<HTMLElement>('[data-autofocus]');

                        // Fallback: Check for native autofocus attribute
                        if (!autoFocusElement) {
                            autoFocusElement = dialog.querySelector<HTMLElement>('[autofocus]');
                        }

                        if (autoFocusElement) {
                            autoFocusElement.focus();
                        }
                    });
                });
            }

            // 3. Scroll Locking (Mount)
            // We increment a reference count to handle nested dialogs correctly
            const currentCount = parseInt(document.body.getAttribute('data-scroll-clamp') || '0', 10);
            document.body.setAttribute('data-scroll-clamp', (currentCount + 1).toString());

            // Apply overflow: hidden only on the first lock
            if (currentCount === 0) {
                document.body.style.overflow = 'hidden';
            }

        } else {
            // --- CLOSE STATE ---

            // 1. Dialog Visibility (Exit Animation)
            if (dialog.open) {
                handleTransitionEnd = () => {
                    dialog.close();
                    if (resetOnClose) {
                        setResetKey(k => k + 1);
                    }
                };

                dialog.addEventListener('transitionend', handleTransitionEnd, { once: true });

                // Trigger exit animation
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        dialog.removeAttribute('open');
                    });
                });
            }
        }

        // --- CLEANUP ---
        return () => {
            // 1. Scroll Locking Cleanup
            // Only decrement if we were open (and thus incremented)
            // However, the cleanup runs for the *previous* render. 
            // If previous 'open' was true, we must decrement.
            if (open) {
                const newCount = parseInt(document.body.getAttribute('data-scroll-clamp') || '0', 10) - 1;
                const clampedCount = Math.max(0, newCount);

                if (clampedCount > 0) {
                    document.body.setAttribute('data-scroll-clamp', clampedCount.toString());
                } else {
                    document.body.removeAttribute('data-scroll-clamp');
                    document.body.style.overflow = '';
                }
            }

            // 2. Dialog Listeners Cleanup
            if (handleTransitionEnd) {
                dialog.removeEventListener('transitionend', handleTransitionEnd);
            }
        };
    }, [open]); // resetOnClose is stable

    const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        // Check if the click was directly on the dialog element (backdrop)
        // path[0] is the deepest element in the event path (the actual click target)
        // If it's the dialog itself, it means we clicked on empty space (backdrop)
        // If it's a child element, it means we clicked on content
        const path = event.nativeEvent.composedPath();

        const isContent =
            dialog.offsetTop < event.clientY &&
            dialog.offsetLeft < event.clientX &&
            (dialog.offsetTop + dialog.offsetHeight) > event.clientY &&
            (dialog.offsetLeft + dialog.offsetWidth) > event.clientX;

        if (path[0] === dialog && !isContent) {
            onClose();
        }
        if (isContent) onClick?.(event);
    };

    const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
        event.preventDefault(); // Always prevent default browser behavior
        onClose();
        onCancel?.(event);
    };

    return (
        <dialog
            key={resetKey}
            ref={dialogRef}
            className={`${styles.dialog} ${className || ''}`.trim()}
            onClick={handleBackdropClick}
            onCancel={handleCancel}
            {...rest}
        >
            {children}
        </dialog>
    );
};
