import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { computeSnapshot } from "@/lib/engine";
import { delifoodInput } from "@/lib/engine/fixtures/delifood";
import { renderReport } from "../render";
import { buildViewModel } from "../view-model";

const generatedAt = new Date("2026-09-18T00:00:00Z");

describe("Rapport PDF", () => {
  it("le view-model reprend exactement les chiffres du snapshot", () => {
    const snapshot = computeSnapshot(delifoodInput);
    const vm = buildViewModel(snapshot, {
      companyName: "DELIFOOD",
      unit: "sachet",
      ratePerHour: 3000,
      marginPerUnit: 100,
      generatedAt,
    });
    expect(vm.costTable.total).toBe("131 845 805 FCFA");
    expect(vm.findings.bullets[0][0].text).toBe("131\u00a0M FCFA/an");
    expect(vm.roi.rows[2].payback).toMatch(/^3,0\d ans$/);
    expect(vm.recommendation.heading).toContain("proposition 2");
    expect(vm.scenarioTable.rows).toHaveLength(6);
  });

  it("produit 9 pages et un rendu déterministe", async () => {
    const snapshot = computeSnapshot(delifoodInput);
    const a = await renderReport(snapshot, delifoodInput, { generatedAt });
    const b = await renderReport(snapshot, delifoodInput, { generatedAt });
    expect(a.subarray(0, 5).toString()).toBe("%PDF-");
    expect((a.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(9);
    expect(createHash("sha256").update(a).digest("hex")).toBe(
      createHash("sha256").update(b).digest("hex"),
    );
  }, 30_000);
});
