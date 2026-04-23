import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';
import type { VariantProps } from 'class-variance-authority';

interface LinkButtonProps extends VariantProps<typeof buttonVariants> {
  href: string;
  className?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
}

export function LinkButton({ href, className, variant, size, children, target, rel }: LinkButtonProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(buttonVariants({ variant, size, className }))}
    >
      {children}
    </Link>
  );
}
