ALTER TABLE "JurisdictionUnit"
  ADD COLUMN "submittedById" TEXT,
  ADD COLUMN "submittedAt" TIMESTAMP(3),
  ADD COLUMN "reviewedById" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE INDEX "jurisdiction_review_queue_idx"
ON "JurisdictionUnit"("organizationId", status, "submittedAt");

ALTER TABLE "JurisdictionUnit"
  ADD CONSTRAINT "JurisdictionUnit_submission_pair_check"
  CHECK (("submittedById" IS NULL) = ("submittedAt" IS NULL)),
  ADD CONSTRAINT "JurisdictionUnit_review_pair_check"
  CHECK (("reviewedById" IS NULL) = ("reviewedAt" IS NULL)),
  ADD CONSTRAINT "JurisdictionUnit_maker_checker_check"
  CHECK ("reviewedById" IS NULL OR "submittedById" IS NULL OR "reviewedById" <> "submittedById");
