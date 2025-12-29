import type { ElementType, HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardFlushProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The component or tag to render the container as.
     * @default 'div'
     */
    as?: ElementType;
}

/**
 * A container that sits flush against the edges of the Card, ignoring parent padding.
 * Useful for full-width images, maps, banners, etc.
 */
export const CardFlush = ({ as: Component = 'div', className, children, ...rest }: CardFlushProps) => {
    return (
        <Component className={`${styles.flush} ${className || ''}`.trim()} {...rest}>
            {children}
        </Component>
    );
};
