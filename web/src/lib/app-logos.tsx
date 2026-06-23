/**
 * Hand-drawn marks for brands not available in the icon library (their owners
 * restrict logo redistribution). They render in white on the tile's brand
 * color via currentColor; swap in official artwork if you have it.
 */

/** Prime Video — the brand's signature upturned "smile" swoosh. */
export function PrimeVideoLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 14c2.9 2 6.4 3.1 10 3.1 2.6 0 5.2-.5 7.6-1.6" />
      <path d="M18.3 15.2c1.9-.8 3.4-.3 2.6 2" />
    </svg>
  );
}

/** Disney+ — an italic serif "D+" lockup. */
export function DisneyPlusLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontStyle="italic"
        fontSize="14"
      >
        D+
      </text>
    </svg>
  );
}
