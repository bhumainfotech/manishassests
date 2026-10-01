CREATE TYPE "JurisdictionUnitType" AS ENUM (
  'COUNTRY', 'STATE', 'DISTRICT', 'ZILLA_PARISHAD', 'SUBDISTRICT',
  'BLOCK', 'PANCHAYAT_SAMITI', 'GRAM_PANCHAYAT', 'VILLAGE', 'WARD',
  'HABITATION'
);

CREATE TYPE "JurisdictionRecordStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

CREATE TYPE "JurisdictionImportStatus" AS ENUM (
  'UPLOADED', 'VALIDATING', 'VALIDATED', 'REJECTED', 'APPROVED',
  'ACTIVATED', 'FAILED'
);

CREATE TABLE "JurisdictionUnit" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "sourceCode" TEXT NOT NULL,
  "type" "JurisdictionUnitType" NOT NULL,
  "name" TEXT NOT NULL,
  "nameHi" TEXT,
  "status" "JurisdictionRecordStatus" NOT NULL DEFAULT 'DRAFT',
  "validFrom" TIMESTAMP(3),
  "validTo" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  "metadata" JSONB,
  "parentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JurisdictionUnit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JurisdictionImportBatch" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "sourceVersion" TEXT,
  "checksum" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "status" "JurisdictionImportStatus" NOT NULL DEFAULT 'UPLOADED',
  "totalRows" INTEGER NOT NULL DEFAULT 0,
  "validRows" INTEGER NOT NULL DEFAULT 0,
  "invalidRows" INTEGER NOT NULL DEFAULT 0,
  "summary" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JurisdictionImportBatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "jurisdiction_source_code_unique" ON "JurisdictionUnit"("organizationId", "source", "type", "sourceCode");
CREATE INDEX "jurisdiction_parent_status_idx" ON "JurisdictionUnit"("organizationId", "parentId", "status");
CREATE INDEX "jurisdiction_type_name_idx" ON "JurisdictionUnit"("organizationId", "type", "name");
CREATE UNIQUE INDEX "jurisdiction_import_checksum_unique" ON "JurisdictionImportBatch"("organizationId", "source", "checksum");
CREATE INDEX "jurisdiction_import_created_idx" ON "JurisdictionImportBatch"("organizationId", "createdAt" DESC);

ALTER TABLE "JurisdictionUnit" ADD CONSTRAINT "JurisdictionUnit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JurisdictionUnit" ADD CONSTRAINT "JurisdictionUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "JurisdictionUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JurisdictionImportBatch" ADD CONSTRAINT "JurisdictionImportBatch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
