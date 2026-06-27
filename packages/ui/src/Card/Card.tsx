import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

export type CardVariant = 'default' | 'elevated' | 'gradient';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style. @default 'default' */
  variant?: CardVariant;
  /** Adds hover lift + focus ring. Pair with `tabIndex={0}` / `role` when clickable. */
  interactive?: boolean;
  /** Tighter padding. */
  compact?: boolean;
}

/**
 * JaZeR Card — a typed wrapper over the `.card` BEM classes from `@jazer/styles`.
 * Compose with {@link CardTitle}, {@link CardBody}, {@link CardFooter}. Holds zero styles.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', interactive = false, compact = false, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        'card',
        variant !== 'default' && `card--${variant}`,
        interactive && 'card--interactive',
        compact && 'card--compact',
        className,
      )}
      {...rest}
    />
  );
});

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, ...rest },
  ref,
) {
  return <h3 ref={ref} className={clsx('card__title', className)} {...rest} />;
});

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={clsx('card__body', className)} {...rest} />;
});

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={clsx('card__footer', className)} {...rest} />;
});
