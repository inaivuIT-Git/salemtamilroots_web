import { notFound } from "next/navigation";
import { AdminProduct } from "@/components/admin/AdminProduct";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();
  return <AdminProduct productId={productId} />;
}
