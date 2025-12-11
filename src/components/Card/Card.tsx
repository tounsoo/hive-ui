import React, { forwardRef } from 'react';
import styles from './Card.module.css';

export type CardProps =
    | (Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> & {
        href?: never;
        onClick?: never;
        'aria-label'?: string;
        'aria-labelledby'?: string;
    })
    | (Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> & {
        /**
         * URL to navigate to when the card is clicked.
         * Renders an accessible <a> overlay.
         */
        href?: string;
        /**
         * Callback when the card is clicked.
         * Renders an accessible <button> overlay if href is not provided.
         */
        onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
    } & (
            | { href: string }
            | { onClick: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void }
        ) & (
            | { 'aria-label': string; 'aria-labelledby'?: string }
            | { 'aria-labelledby': string; 'aria-label'?: string }
        ));

/**
 * A flexible Card component that can be interactive.
 * 
 * ACCESSIBILITY NOTE:
 * This component uses the "Overlay" or "Stretched Link" pattern for interactivity.
 * The card itself contains an invisible overlay link/button that covers the entire content.
 * 
 * NESTED INTERACTIVE ELEMENTS:
 * If you place buttons, links, or inputs inside the Card, they must have:
 * `position: relative` (or absolute) AND `z-index: 2` (or higher) to sit above the overlay.
 * Otherwise, clicking them will trigger the Card's action instead.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
    // Destructure common props. 
    // We cast to access potential interactive props safely, 
    // relying on the conditional rendering logic to respect the types.
    const {
        children,
        className,
        href,
        onClick,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledBy,
        ...rest
    } = props;

    const isInteractive = Boolean(href || onClick);

    return (
        <div
            ref={ref}
            className={`${styles.card} ${isInteractive ? styles.interactive : ''} ${className || ''}`.trim()}
            {...rest}
        >
            {isInteractive && href ? (
                <a
                    href={href}
                    className={styles.overlay}
                    onClick={onClick}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                />
            ) : isInteractive && onClick ? (
                <button
                    type="button"
                    className={styles.overlay}
                    onClick={onClick}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                />
            ) : null}

            {/* 
              Content is rendered after the overlay in DOM order, but Stacking Context 
              dictates that z-index: 1 on the overlay (absolute) will cover static content.
              Interactive children need z-index > 1.
            */}
            {children}
        </div>
    );
});

Card.displayName = 'Card';
