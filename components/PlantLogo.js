/** Simple sprout / leaf mark — use with Tailwind `text-emerald-*` for color. */
export function PlantLogo({ className = "h-9 w-9" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M16 28V13"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M16 15.5C10 14 6 9 6 4c0 0 5.5 1 10 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M16 15.5C22 14 26 9 26 4c0 0-5.5 1-10 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M16 8c-2.5 2-4 5.5-4 9.5 0 3 1.5 5 4 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path
        d="M16 8c2.5 2 4 5.5 4 9.5 0 3-1.5 5-4 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
    </svg>
  );
}
