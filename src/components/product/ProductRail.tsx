import type { ProductSummary } from "@/lib/types";
import { ProductCard } from "./ProductCard";

// Swipeable row on phones, grid on larger screens.
export function ProductRail({ products }: { products: ProductSummary[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {products.map((p, i) => (
        <div key={p.id} className="w-[72%] shrink-0 snap-start sm:w-auto">
          <ProductCard p={p} index={i} />
        </div>
      ))}
    </div>
  );
}
