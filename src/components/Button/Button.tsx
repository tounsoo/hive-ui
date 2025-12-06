import React from 'react';
import styles from './Button.module.css';

/**
 * Base properties shared by all Button variations.
 */
type BaseProps = {
  /** The text content to display inside the button */
  label: string;
  /** Optional element to display before the label (e.g., an icon) */
  leading?: React.ReactNode;
  /** Optional element to display after the label (e.g., an icon) */
  trailing?: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps | 'children'> & {
    href?: never;
  };

type ButtonAsAnchor = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | 'children'> & {
    href: string;
  };

/**
 * Props for the Button component.
 * It acts as either a standard HTML button or an anchor tag based on the presence of the `href` prop.
 */
export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

/**
 * A flexible Button component that can render as a `<button>` or `<a>` tag.
 * 
 * @example
 * // Standard button
 * <Button label="Click me" onClick={() => console.log('clicked')} />
 * 
 * @example
 * // Link button
 * <Button label="Go Home" href="/" />
 * 
 * @example
 * // With icons
 * <Button label="Save" leading={<span role="img" aria-label="save">💾</span>} />
 */
export const Button = (props: ButtonProps) => {
  const { label, leading, trailing, className, ...rest } = props;
  const combinedClassName = `${styles.button} ${className || ''}`.trim();

  if (props.href) {
    const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={combinedClassName} {...anchorProps}>
        {leading}
        {label}
        {trailing}
      </a>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" className={combinedClassName} {...buttonProps}>
      {leading}
      {label}
      {trailing}
    </button>
  );
};
