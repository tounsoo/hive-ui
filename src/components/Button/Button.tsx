import React from 'react';
import styles from './Button.module.css';

type BaseProps = {
  label: string;
  leading?: React.ReactNode;
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

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

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
