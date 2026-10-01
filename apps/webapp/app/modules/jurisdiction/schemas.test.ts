import { describe, expect, it } from "vitest";
import {
  CreateJurisdictionSchema,
  JurisdictionSearchSchema,
  JurisdictionTransitionSchema,
  UpdateJurisdictionSchema,
} from "./schemas";

describe("jurisdiction schemas", () => {
  it("normalizes optional values when creating a unit", () => {
    expect(
      CreateJurisdictionSchema.parse({
        source: " LGD ",
        sourceCode: " 001 ",
        type: "STATE",
        name: " Chhattisgarh ",
        nameHi: "",
        parentId: "",
      })
    ).toEqual({
      source: "LGD",
      sourceCode: "001",
      type: "STATE",
      name: "Chhattisgarh",
      nameHi: null,
      parentId: null,
      validFrom: null,
      validTo: null,
    });
  });

  it("rejects an effective-date range that ends before it starts", () => {
    expect(() =>
      CreateJurisdictionSchema.parse({
        source: "LGD",
        sourceCode: "001",
        type: "STATE",
        name: "Chhattisgarh",
        validFrom: "2026-10-02",
        validTo: "2026-10-01",
      })
    ).toThrow("Valid to must be on or after valid from");
  });

  it("rejects unsupported jurisdiction types", () => {
    expect(() =>
      CreateJurisdictionSchema.parse({
        source: "LGD",
        sourceCode: "001",
        type: "UNAPPROVED_LEVEL",
        name: "Example",
      })
    ).toThrow();
  });

  it("ignores an invalid optional type filter", () => {
    expect(
      JurisdictionSearchSchema.parse({ search: " Kanker ", type: "UNKNOWN" })
    ).toEqual({ search: "Kanker", type: undefined, page: 1 });
  });

  it("normalizes invalid page numbers to the first page", () => {
    expect(JurisdictionSearchSchema.parse({ search: "", page: "0" }).page).toBe(
      1
    );
  });

  it("requires a reason for return and retirement commands", () => {
    expect(() =>
      JurisdictionTransitionSchema.parse({
        intent: "retire",
        id: "unit-1",
        version: 2,
      })
    ).toThrow("A reason is required");
  });

  it("normalizes an editable jurisdiction draft", () => {
    expect(
      UpdateJurisdictionSchema.parse({
        id: "unit-1",
        version: "3",
        name: " Kanker ",
        nameHi: "",
        parentId: "",
        validFrom: "2026-01-01",
        validTo: "",
      })
    ).toMatchObject({
      id: "unit-1",
      version: 3,
      name: "Kanker",
      nameHi: null,
      parentId: null,
      validTo: null,
    });
  });
});
