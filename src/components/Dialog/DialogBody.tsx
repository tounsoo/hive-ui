import type { ElementType, HTMLAttributes } from 'react';
import styles from './Dialog.module.css';

export interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The component or tag to render the body as.
     * @default 'div'
     */
    as?: ElementType;
}

/**
 * The main content area of the Dialog.
 * Applies standard padding and scroll behavior.
 */
export const DialogBody = ({ as: Component = 'div', className, children, ...rest }: DialogBodyProps) => {
    return (
        <Component className={`${styles.body} ${className || ''}`.trim()} {...rest}>
            {children}
        </Component>
    );
};
