import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'primary' */
  variant?: ButtonVariant;
  /** Size. @default 'md' */
  size?: ButtonSize;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
}

/**
 * JaZeR Button — a typed wrapper over the `.btn` BEM classes from `@jazer/styles`.
 * Holds zero styles itself: props map to classes, the design system owns the look.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth = false, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        'btn',
        `btn--${variant}`,
        size !== 'md' && `btn--${size}`,
        fullWidth && 'btn--block',
        className,
      )}
      {...rest}
    />
  );
});
