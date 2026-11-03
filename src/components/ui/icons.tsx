// Small inline icon set (stroke icons, 24px grid) so no icon library is needed.
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const CartIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6.2" />
    <circle cx="10" cy="20" r="1.3" />
    <circle cx="17" cy="20" r="1.3" />
  </svg>
);
export const SearchIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);
export const UserIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
);
export const MenuIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const ArrowIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const LeafIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" />
    <path d="M5 19c3-4 6-6 9-8" />
  </svg>
);
export const StarIcon = ({ className, filled = true }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
  </svg>
);
export const PhoneIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);
export const MailIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);
