import type { JurisdictionRecordStatus } from "@prisma/client";

export const jurisdictionTransitions = {
  submit: { from: "DRAFT", to: "IN_REVIEW" },
  return: { from: "IN_REVIEW", to: "DRAFT" },
  activate: { from: "IN_REVIEW", to: "ACTIVE" },
  retire: { from: "ACTIVE", to: "RETIRED" },
} as const satisfies Record<
  string,
  { from: JurisdictionRecordStatus; to: JurisdictionRecordStatus }
>;

export type JurisdictionTransition = keyof typeof jurisdictionTransitions;

export function getJurisdictionTransition(
  action: JurisdictionTransition,
  currentStatus: JurisdictionRecordStatus
) {
  const transition = jurisdictionTransitions[action];
  return transition.from === currentStatus ? transition.to : null;
}

export function canReviewJurisdiction(
  action: JurisdictionTransition,
  actorUserId: string,
  submittedById: string | null
) {
  return (
    !["return", "activate"].includes(action) ||
    (Boolean(submittedById) && submittedById !== actorUserId)
  );
}
