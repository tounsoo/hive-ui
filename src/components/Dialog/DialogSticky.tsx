import type { HTMLAttributes } from 'react';
import styles from './Dialog.module.css';

export interface DialogStickyProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Alignment of the sticky element.
     * @default 'top'
     */
    align?: 'top' | 'bottom';
}

export const DialogSticky = ({ align = 'top', className, children, ...rest }: DialogStickyProps) => {
    const alignClass = align === 'bottom' ? styles.stickyBottom : styles.stickyTop;

    return (
        <div
            className={`${styles.sticky} ${alignClass} ${className || ''}`.trim()}
            {...rest}
        >
            {children}
        </div>
    );
};
