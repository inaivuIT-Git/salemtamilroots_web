import { Suspense } from "react";
import { AdminProducts } from "@/components/admin/AdminProducts";

export default function Page() {
  return (
    <Suspense>
      <AdminProducts />
    </Suspense>
  );
}
