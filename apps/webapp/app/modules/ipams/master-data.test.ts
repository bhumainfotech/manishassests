import { describe, expect, it } from "vitest";
import {
  assetMasterClasses,
  filterAssetMasterClasses,
  workflowMasters,
} from "./master-data";

describe("IPAMS master data", () => {
  it("keeps class and workflow codes unique", () => {
    expect(new Set(assetMasterClasses.map(({ code }) => code)).size).toBe(
      assetMasterClasses.length
    );
    expect(new Set(workflowMasters.map(({ code }) => code)).size).toBe(
      workflowMasters.length
    );
  });

  it("finds a class by code, name, or subclass", () => {
    expect(filterAssetMasterClasses("A05").map(({ code }) => code)).toEqual([
      "A05",
    ]);
    expect(
      filterAssetMasterClasses("sanitation").map(({ code }) => code)
    ).toEqual(["A07", "A21"]);
    expect(
      filterAssetMasterClasses("anganwadi").map(({ code }) => code)
    ).toEqual(["A03"]);
  });

  it("returns all classes for an empty search", () => {
    expect(filterAssetMasterClasses("   ")).toHaveLength(22);
  });
});
