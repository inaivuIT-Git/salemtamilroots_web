// UAT only (NEXT_PUBLIC_UI_SWITCH=1 at build time): lets testers go back to the current site.
// nginx handles /switch-ui/legacy by setting a cookie and sending them to the legacy home page.
export function UiSwitch() {
  if (process.env.NEXT_PUBLIC_UI_SWITCH !== "1") return null;
  return (
    <a
      href="/switch-ui/legacy"
      className="fixed z-50 flex items-center gap-2 rounded-full bg-ink/90 px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-lift)] backdrop-blur hover:bg-ink"
      style={{
        left: "max(16px, env(safe-area-inset-left, 0px))",
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <span className="rounded-full bg-turmeric-500 px-2 py-0.5 text-[11px] font-bold text-forest-950">UAT</span>
      New site · switch to legacy
    </a>
  );
}
