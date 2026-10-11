import { Aurora } from "@/components/atoms/Aurora";
import { Footer } from "@/components/organisms/Footer";
import { Navbar } from "@/components/organisms/Navbar";
import { WalletModal } from "@/components/organisms/WalletModal";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <Aurora />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WalletModal />
    </div>
  );
}
