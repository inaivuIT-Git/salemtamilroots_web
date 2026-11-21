import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UiSwitch } from "@/components/layout/UiSwitch";

/* The storefront frame: header, footer and the UAT old/new switch. The admin area has its own. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <UiSwitch />
    </>
  );
}
