import type { Metadata } from "next";
import { ThankYou } from "./ThankYou";

export const metadata: Metadata = { title: "Rapport généré" };

export default function MerciPage() {
  return <ThankYou />;
}
