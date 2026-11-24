import { notFound } from "next/navigation";
import { AdminProductText } from "@/components/admin/AdminProductText";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();
  return <AdminProductText productId={productId} />;
}
