import Image from 'next/image';
import { cn } from '@/lib/utils';

// Both sponsor marks are dark-on-light artwork, so they sit on a white plate
// rather than straight on the night ground, where they would disappear.
const SIZES = {
  sm: { plate: 'h-9 gap-3 px-3', logo: 'h-5', label: 'text-xs' },
  md: { plate: 'h-14 gap-5 px-5', logo: 'h-8', label: 'text-sm' },
  lg: { plate: 'h-[4.5rem] gap-6 px-6', logo: 'h-10', label: 'text-base' },
  stage: {
    plate: 'h-[clamp(2.75rem,6vh,4.5rem)] gap-[1.2vw] px-[1.2vw]',
    logo: 'h-[clamp(1.5rem,3.4vh,2.6rem)]',
    label: 'text-[clamp(0.85rem,1.1vw,1.3rem)]',
  },
} as const;

export function PoweredBy({
  size = 'md',
  showLabel = true,
  className,
}: {
  size?: keyof typeof SIZES;
  showLabel?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {showLabel && (
        <span
          className={cn(
            'whitespace-nowrap font-display font-bold uppercase tracking-[0.14em] text-ink-2',
            s.label,
          )}
        >
          Powered by
        </span>
      )}
      <span className={cn('inline-flex shrink-0 items-center rounded-md bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)]', s.plate)}>
        <Image
          src="/images/iotric.webp"
          alt="iotric"
          width={248}
          height={100}
          className={cn('w-auto', s.logo)}
        />
        <span aria-hidden className="h-[60%] w-px bg-[#d6d9e8]" />
        <Image
          src="/images/botric.svg"
          alt="Botric"
          width={1025}
          height={309}
          unoptimized
          className={cn('w-auto', s.logo)}
        />
      </span>
    </div>
  );
}
