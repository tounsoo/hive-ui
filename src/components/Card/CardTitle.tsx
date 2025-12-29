import type { ElementType, HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    /**
     * The component or tag to render the title as.
     * @default 'h3'
     */
    as?: ElementType;
}

export const CardTitle = ({ as: Component = 'h3', className, children, ...rest }: CardTitleProps) => {
    return (
        <Component className={`${styles.title} ${className || ''}`.trim()} {...rest}>
            {children}
        </Component>
    );
};
