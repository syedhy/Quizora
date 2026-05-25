import * as React from 'react';
import { cn } from '@/lib/utils';

type CardContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function CardContainer({ className, children, ...props }: CardContainerProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const element = ref.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 7;
    const rotateX = (0.5 - y / rect.height) * 7;

    element.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function handleMouseLeave() {
    const element = ref.current;

    if (!element) {
      return;
    }

    element.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)';
  }

  return (
    <div
      className={cn('group/card [perspective:1100px]', className)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <div
        className="h-full w-full transition-transform duration-200 ease-out [transform-style:preserve-3d]"
        ref={ref}
      >
        {children}
      </div>
    </div>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('relative h-full w-full [transform-style:preserve-3d]', className)} {...props}>
      {children}
    </div>
  );
}

type CardItemProps = React.HTMLAttributes<HTMLDivElement> & {
  translateZ?: number;
};

export function CardItem({ className, children, translateZ = 0, style, ...props }: CardItemProps) {
  return (
    <div
      className={className}
      style={{ transform: `translateZ(${translateZ}px)`, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
