import type { JurisdictionUnitType } from "@prisma/client";

/**
 * Approved structural alternatives for Indian local-government hierarchies.
 * LGD data varies by state, so this deliberately supports both direct and
 * intermediate (Zilla Parishad/Panchayat Samiti) parentage.
 */
export const allowedParentTypes: Record<
  JurisdictionUnitType,
  readonly JurisdictionUnitType[]
> = {
  COUNTRY: [],
  STATE: ["COUNTRY"],
  DISTRICT: ["STATE"],
  ZILLA_PARISHAD: ["DISTRICT"],
  SUBDISTRICT: ["DISTRICT"],
  BLOCK: ["DISTRICT", "SUBDISTRICT"],
  PANCHAYAT_SAMITI: ["DISTRICT", "ZILLA_PARISHAD", "BLOCK"],
  GRAM_PANCHAYAT: ["BLOCK", "PANCHAYAT_SAMITI"],
  VILLAGE: ["SUBDISTRICT", "BLOCK", "GRAM_PANCHAYAT"],
  WARD: ["GRAM_PANCHAYAT", "VILLAGE"],
  HABITATION: ["GRAM_PANCHAYAT", "VILLAGE", "WARD"],
};

export function isAllowedJurisdictionParent(
  childType: JurisdictionUnitType,
  parentType: JurisdictionUnitType
) {
  return allowedParentTypes[childType].includes(parentType);
}
