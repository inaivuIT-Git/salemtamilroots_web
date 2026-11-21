import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSignIn } from "@/components/admin/AdminSignIn";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense>
      <AdminSignIn />
    </Suspense>
  );
}
