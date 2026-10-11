import type { Metadata } from "next";
import { Vault } from "@/components/organisms/Vault";

export const metadata: Metadata = { title: "Vault · Nyx" };

export default function VaultPage() {
  return <Vault />;
}
