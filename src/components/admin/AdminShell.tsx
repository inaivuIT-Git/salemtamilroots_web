"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/session";

/*
  Frame for the admin area: navigation, who is signed in, sign out.
  Only Admin / SuperAdmin sessions get in; everyone else goes to /admin/signin.
  The API checks the role on every call as well, so this is about the page, not security.
*/
export const isAdminRole = (role?: string | null) => role === "Admin" || role === "SuperAdmin";

const SECTIONS = [
  { href: "/admin/orders", label: "Orders", ready: true },
  { href: "/admin/products", label: "Products", ready: true },
  { href: "/admin/coupons", label: "Coupons", ready: false },
  { href: "/admin/settings", label: "Settings", ready: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, me, signOut } = useAuth();
  const allowed = ready && isAdminRole(me?.role);

  useEffect(() => {
    if (ready && !isAdminRole(me?.role)) router.replace(`/admin/signin?next=${encodeURIComponent(pathname)}`);
  }, [ready, me, pathname, router]);

  return (
    <div className="min-h-dvh bg-[#f3f5f2] text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-forest-900 text-white" style={{ top: "env(safe-area-inset-top, 0px)" }}>
        <div className="flex min-h-14 flex-wrap items-center gap-x-4 px-4 sm:flex-nowrap sm:px-6" style={{ paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}>
          <Link href="/admin/orders" className="flex items-center gap-2 font-semibold">
            <Image src="/brand/logo.png" alt="" width={30} height={29} className="rounded-full bg-white" />
            <span>Salem Tamil Roots</span>
            <span className="rounded bg-turmeric-500 px-1.5 py-0.5 text-[11px] font-bold text-forest-950 uppercase">Admin</span>
          </Link>
          <nav className="no-scrollbar order-last -mx-1 flex w-full gap-1 overflow-x-auto pb-2 sm:order-none sm:mx-0 sm:ml-2 sm:w-auto sm:flex-1 sm:pb-0" aria-label="Admin sections">
            {SECTIONS.map((s) =>
              s.ready ? (
                <Link
                  key={s.href}
                  href={s.href}
                  aria-current={pathname.startsWith(s.href) ? "page" : undefined}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${pathname.startsWith(s.href) ? "bg-white/15" : "text-leaf-200 hover:bg-white/10"}`}
                >
                  {s.label}
                </Link>
              ) : (
                <span key={s.href} className="shrink-0 cursor-default rounded-md px-3 py-1.5 text-sm text-leaf-200/50" title="Coming next">
                  {s.label}
                </span>
              ),
            )}
          </nav>
          {allowed && (
            <div className="ml-auto flex items-center gap-3 py-2 text-sm sm:ml-0">
              <span className="hidden text-leaf-200 sm:inline">{me?.firstName || me?.email || "Admin"}</span>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-leaf-200 hover:bg-white/10 hover:text-white"
                onClick={async () => {
                  await signOut();
                  router.replace("/admin/signin");
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1400px] py-6" style={{ paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}>
        {allowed ? children : <p className="text-muted">Checking your sign-in…</p>}
      </div>
    </div>
  );
}
