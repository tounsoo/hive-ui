import React from 'react';
import styles from './Input.module.css';

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * If true, the input will be styled as invalid.
     * This sets only the style and `aria-invalid` attribute.
     */
    error?: boolean;
}

export type InputProps = BaseInputProps & (
    | { id: string; name?: string }
    | { name: string; id?: string }
);

/**
 * A purely styled input element.
 * Does not wrap the input in a container or provide built-in labels.
 *
 * @example
 * <label htmlFor="email">Email</label>
 * <Input id="email" placeholder="example@domain.com" />
 */
export const Input = ({ className, error, disabled, ...props }: InputProps) => {
    // We use aria-invalid for accessibility and styling hooks.
    // We do not pass `error` to the DOM element.
    // We use aria-disabled to keep the input focusable even when disabled.

    // Combine styles
    const combinedClassName = [styles.input, className].filter(Boolean).join(' ');

    return (
        <input
            className={combinedClassName}
            aria-invalid={error ? true : undefined}
            aria-disabled={disabled ? true : undefined}
            // If disabled, we treat it as readOnly to prevent editing while keeping focus
            readOnly={disabled}
            {...props}
        />
    );
};
