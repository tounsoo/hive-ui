import React, { useEffect, useRef } from 'react';
import styles from './Dialog.module.css';

export interface DialogProps {
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

export const Dialog = ({ open, onClose, children, className, resetOnClose = true }: DialogProps) => {
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
    };

    const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
        event.preventDefault(); // Always prevent default browser behavior
        onClose();
    };

    return (
        <dialog
            key={resetKey}
            ref={dialogRef}
            className={`${styles.dialog} ${className || ''}`.trim()}
            onClick={handleBackdropClick}
            onCancel={handleCancel}
        >
            {children}
        </dialog>
    );
};
