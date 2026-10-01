import { describe, expect, it } from "vitest";
import { isAllowedJurisdictionParent } from "./hierarchy";

describe("jurisdiction hierarchy", () => {
  it("supports direct and intermediate Panchayat hierarchy variants", () => {
    expect(isAllowedJurisdictionParent("GRAM_PANCHAYAT", "BLOCK")).toBe(true);
    expect(
      isAllowedJurisdictionParent("GRAM_PANCHAYAT", "PANCHAYAT_SAMITI")
    ).toBe(true);
  });

  it("rejects inverted and same-level relationships", () => {
    expect(isAllowedJurisdictionParent("STATE", "DISTRICT")).toBe(false);
    expect(isAllowedJurisdictionParent("VILLAGE", "VILLAGE")).toBe(false);
  });
});
