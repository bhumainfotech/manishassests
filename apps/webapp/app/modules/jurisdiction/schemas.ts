import { z } from "zod";

export const jurisdictionUnitTypes = [
  "COUNTRY",
  "STATE",
  "DISTRICT",
  "ZILLA_PARISHAD",
  "SUBDISTRICT",
  "BLOCK",
  "PANCHAYAT_SAMITI",
  "GRAM_PANCHAYAT",
  "VILLAGE",
  "WARD",
  "HABITATION",
] as const;

export const CreateJurisdictionSchema = z
  .object({
    source: z.string().trim().min(1, "Source is required").max(50),
    sourceCode: z.string().trim().min(1, "Source code is required").max(100),
    type: z.enum(jurisdictionUnitTypes),
    name: z.string().trim().min(1, "English name is required").max(200),
    nameHi: z.string().trim().max(200).optional(),
    parentId: z.string().trim().optional(),
    validFrom: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.date().optional()
    ),
    validTo: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.date().optional()
    ),
  })
  .refine(
    ({ validFrom, validTo }) => !validFrom || !validTo || validTo >= validFrom,
    { message: "Valid to must be on or after valid from", path: ["validTo"] }
  )
  .transform((value) => ({
    ...value,
    nameHi: value.nameHi || null,
    parentId: value.parentId || null,
    validFrom: value.validFrom || null,
    validTo: value.validTo || null,
  }));

export const JurisdictionSearchSchema = z.object({
  search: z.string().trim().max(200).catch(""),
  type: z.enum(jurisdictionUnitTypes).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export const JurisdictionTransitionSchema = z
  .object({
    intent: z.enum(["submit", "return", "activate", "retire"]),
    id: z.string().trim().min(1),
    version: z.coerce.number().int().positive(),
    reason: z.string().trim().max(500).optional(),
  })
  .refine(
    ({ intent, reason }) =>
      !["return", "retire"].includes(intent) || Boolean(reason),
    { message: "A reason is required", path: ["reason"] }
  );

export const UpdateJurisdictionSchema = z
  .object({
    id: z.string().trim().min(1),
    version: z.coerce.number().int().positive(),
    name: z.string().trim().min(1, "English name is required").max(200),
    nameHi: z.string().trim().max(200).optional(),
    parentId: z.string().trim().optional(),
    validFrom: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.date().optional()
    ),
    validTo: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.date().optional()
    ),
  })
  .refine(
    ({ validFrom, validTo }) => !validFrom || !validTo || validTo >= validFrom,
    { message: "Valid to must be on or after valid from", path: ["validTo"] }
  )
  .transform((value) => ({
    ...value,
    nameHi: value.nameHi || null,
    parentId: value.parentId || null,
    validFrom: value.validFrom || null,
    validTo: value.validTo || null,
  }));
