import { notFound } from "next/navigation";
import { AdminOrder } from "@/components/admin/AdminOrder";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();
  return <AdminOrder orderId={orderId} />;
}
