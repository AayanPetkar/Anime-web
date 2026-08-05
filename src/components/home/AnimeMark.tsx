interface AnimeMarkProps {
  anime: string;
  colorClass: string;
  className?: string;
}

/**
 * Renders the anime's name as an original stylized wordmark — condensed
 * display type with a thin tracked eyebrow underneath — rather than
 * reproducing any studio's actual logo artwork.
 */
export function AnimeMark({ anime, colorClass, className = '' }: AnimeMarkProps) {
  return (
    <div className={`leading-none ${className}`}>
      <span
        className={`font-display font-extrabold uppercase tracking-tight text-lg ${colorClass}`}
      >
        {anime}
      </span>
      <div className={`mt-1 h-[2px] w-8 rounded-full bg-current ${colorClass} opacity-70`} />
    </div>
  );
}
