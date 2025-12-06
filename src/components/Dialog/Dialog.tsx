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

        if (open) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            if (dialog.open) {
                // Start the exit animation
                const handleTransitionEnd = () => {
                    dialog.close();
                    // Reset content if resetOnClose is enabled
                    if (resetOnClose) {
                        setResetKey(k => k + 1);
                    }
                };

                dialog.addEventListener('transitionend', handleTransitionEnd, { once: true });

                // Use requestAnimationFrame to ensure the transition is triggered
                // This gives the browser time to compute initial styles
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        dialog.removeAttribute('open');
                    });
                });

                // Cleanup
                return () => {
                    dialog.removeEventListener('transitionend', handleTransitionEnd);
                };
            }
        }
    }, [open]); // resetOnClose is stable, only read here

    // Scroll clamp implementation (Overflow Hidden Strategy)
    useEffect(() => {
        if (!open) return;

        // Mount: Increment reference count
        const currentCount = parseInt(document.body.getAttribute('data-scroll-clamp') || '0', 10);
        document.body.setAttribute('data-scroll-clamp', (currentCount + 1).toString());

        // If this is the first lock, apply overflow: hidden
        if (currentCount === 0) {
            document.body.style.overflow = 'hidden';
        }

        // Cleanup: Decrement reference count
        return () => {
            const newCount = parseInt(document.body.getAttribute('data-scroll-clamp') || '0', 10) - 1;
            // Guard against negative count just in case
            const clampedCount = Math.max(0, newCount);

            if (clampedCount > 0) {
                document.body.setAttribute('data-scroll-clamp', clampedCount.toString());
            } else {
                document.body.removeAttribute('data-scroll-clamp');
                document.body.style.overflow = '';
            }
        };
    }, [open]);

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
