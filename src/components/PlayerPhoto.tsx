import Image from 'next/image';
import { cn } from '@/lib/utils';

function initials(name: string) {
  const parts = name.replace(/^DR\.?\s+/i, '').split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

/** Player photo with an initials fallback; the parent sets the size. */
export function PlayerPhoto({
  name,
  imageUrl,
  sizes,
  priority,
  className,
}: {
  name: string;
  imageUrl?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-night-3',
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      ) : (
        <div
          aria-label={name}
          role="img"
          className="flex h-full w-full items-center justify-center font-display font-black leading-none text-ink-3 [container-type:size]"
        >
          <span className="text-[38cqmin]">{initials(name)}</span>
        </div>
      )}
    </div>
  );
}
