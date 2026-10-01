import { describe, expect, it } from "vitest";
import { canReviewJurisdiction, getJurisdictionTransition } from "./workflow";

describe("jurisdiction workflow", () => {
  it("moves a reviewed draft through submission and activation", () => {
    expect(getJurisdictionTransition("submit", "DRAFT")).toBe("IN_REVIEW");
    expect(getJurisdictionTransition("activate", "IN_REVIEW")).toBe("ACTIVE");
  });

  it("supports returning a submitted record and retiring an active record", () => {
    expect(getJurisdictionTransition("return", "IN_REVIEW")).toBe("DRAFT");
    expect(getJurisdictionTransition("retire", "ACTIVE")).toBe("RETIRED");
  });

  it("rejects invalid state transitions", () => {
    expect(getJurisdictionTransition("activate", "DRAFT")).toBeNull();
    expect(getJurisdictionTransition("submit", "ACTIVE")).toBeNull();
  });

  it("enforces maker-checker separation for review decisions", () => {
    expect(canReviewJurisdiction("activate", "reviewer", "submitter")).toBe(
      true
    );
    expect(canReviewJurisdiction("return", "submitter", "submitter")).toBe(
      false
    );
    expect(canReviewJurisdiction("activate", "reviewer", null)).toBe(false);
  });
});
