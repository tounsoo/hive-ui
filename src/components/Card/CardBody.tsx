import type { ElementType, HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The component or tag to render the body as.
     * @default 'div'
     */
    as?: ElementType;
}

/**
 * The main content area of the Card.
 * Applies standard padding. Sibling elements (like images using Card.Flush) 
 * will naturally sit flush against the Card edges.
 */
export const CardBody = ({ as: Component = 'div', className, children, ...rest }: CardBodyProps) => {
    return (
        <Component className={`${styles.body} ${className || ''}`.trim()} {...rest}>
            {children}
        </Component>
    );
};
