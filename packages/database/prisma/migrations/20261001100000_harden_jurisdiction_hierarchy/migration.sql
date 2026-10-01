ALTER TYPE "ActivityEntity" ADD VALUE IF NOT EXISTS 'JURISDICTION';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'JURISDICTION_CREATED';

ALTER TABLE "JurisdictionUnit"
  ADD CONSTRAINT "JurisdictionUnit_effective_dates_check"
  CHECK ("validTo" IS NULL OR "validFrom" IS NULL OR "validTo" >= "validFrom"),
  ADD CONSTRAINT "JurisdictionUnit_positive_version_check"
  CHECK ("version" > 0);

CREATE OR REPLACE FUNCTION validate_jurisdiction_parent()
RETURNS trigger AS $$
DECLARE
  parent_organization_id TEXT;
  parent_type "JurisdictionUnitType";
BEGIN
  IF NEW."parentId" IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW."parentId" = NEW.id THEN
    RAISE EXCEPTION 'A jurisdiction cannot be its own parent';
  END IF;

  SELECT "organizationId", "type" INTO parent_organization_id, parent_type
  FROM "JurisdictionUnit" WHERE id = NEW."parentId";

  IF parent_organization_id IS NULL OR parent_organization_id <> NEW."organizationId" THEN
    RAISE EXCEPTION 'Jurisdiction parent must belong to the same organization';
  END IF;

  IF NOT CASE NEW."type"
    WHEN 'STATE' THEN parent_type IN ('COUNTRY')
    WHEN 'DISTRICT' THEN parent_type IN ('STATE')
    WHEN 'ZILLA_PARISHAD' THEN parent_type IN ('DISTRICT')
    WHEN 'SUBDISTRICT' THEN parent_type IN ('DISTRICT')
    WHEN 'BLOCK' THEN parent_type IN ('DISTRICT', 'SUBDISTRICT')
    WHEN 'PANCHAYAT_SAMITI' THEN parent_type IN ('DISTRICT', 'ZILLA_PARISHAD', 'BLOCK')
    WHEN 'GRAM_PANCHAYAT' THEN parent_type IN ('BLOCK', 'PANCHAYAT_SAMITI')
    WHEN 'VILLAGE' THEN parent_type IN ('SUBDISTRICT', 'BLOCK', 'GRAM_PANCHAYAT')
    WHEN 'WARD' THEN parent_type IN ('GRAM_PANCHAYAT', 'VILLAGE')
    WHEN 'HABITATION' THEN parent_type IN ('GRAM_PANCHAYAT', 'VILLAGE', 'WARD')
    ELSE FALSE
  END THEN
    RAISE EXCEPTION 'Invalid jurisdiction parent type % for child type %', parent_type, NEW."type";
  END IF;

  IF EXISTS (
    WITH RECURSIVE ancestors AS (
      SELECT id, "parentId" FROM "JurisdictionUnit" WHERE id = NEW."parentId"
      UNION ALL
      SELECT unit.id, unit."parentId"
      FROM "JurisdictionUnit" unit
      JOIN ancestors ON unit.id = ancestors."parentId"
    )
    SELECT 1 FROM ancestors WHERE id = NEW.id
  ) THEN
    RAISE EXCEPTION 'Jurisdiction hierarchy cannot contain a cycle';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "JurisdictionUnit_validate_parent"
BEFORE INSERT OR UPDATE OF "parentId", "organizationId" ON "JurisdictionUnit"
FOR EACH ROW EXECUTE FUNCTION validate_jurisdiction_parent();
