import type { Metadata } from "next";
import { DiagnosticForm } from "@/features/diagnostic-form";

export const metadata: Metadata = { title: "Diagnostic" };

export default function DiagnosticPage() {
  return <DiagnosticForm />;
}
