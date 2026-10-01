ALTER TYPE "JurisdictionRecordStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'JURISDICTION_STATUS_CHANGED';

CREATE OR REPLACE FUNCTION validate_jurisdiction_status_transition()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'DRAFT' AND NEW.status = 'IN_REVIEW') OR
    (OLD.status = 'IN_REVIEW' AND NEW.status IN ('DRAFT', 'ACTIVE')) OR
    (OLD.status = 'ACTIVE' AND NEW.status = 'RETIRED')
  ) THEN
    RAISE EXCEPTION 'Invalid jurisdiction status transition from % to %', OLD.status, NEW.status;
  END IF;

  IF NEW.version <> OLD.version + 1 THEN
    RAISE EXCEPTION 'Jurisdiction workflow transition must increment version';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "JurisdictionUnit_validate_status_transition"
BEFORE UPDATE OF status ON "JurisdictionUnit"
FOR EACH ROW EXECUTE FUNCTION validate_jurisdiction_status_transition();
