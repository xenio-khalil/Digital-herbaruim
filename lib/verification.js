export const VERIFICATION_STATUS = {
  OFFICIAL: "official",
  VERIFIED: "verified",
  PROFESSOR_REVIEWED: "professor-reviewed",
};

export const VERIFICATION_LABELS = {
  [VERIFICATION_STATUS.OFFICIAL]: "Official Herbarium Record",
  [VERIFICATION_STATUS.VERIFIED]: "Academically Verified",
  [VERIFICATION_STATUS.PROFESSOR_REVIEWED]: "Professor Reviewed",
};

export const VERIFICATION_SHORT = {
  [VERIFICATION_STATUS.OFFICIAL]: "Official",
  [VERIFICATION_STATUS.VERIFIED]: "Verified",
  [VERIFICATION_STATUS.PROFESSOR_REVIEWED]: "Prof. Reviewed",
};

export const VERIFICATION_FILTER_OPTIONS = [
  { value: VERIFICATION_STATUS.OFFICIAL, label: "Official Records" },
  { value: VERIFICATION_STATUS.VERIFIED, label: "Verified Records" },
  { value: VERIFICATION_STATUS.PROFESSOR_REVIEWED, label: "Professor Reviewed" },
];

/**
 * @param {unknown} status
 */
export function normalizeVerificationStatus(status) {
  const s = typeof status === "string" ? status.trim() : "";
  if (Object.values(VERIFICATION_STATUS).includes(s)) return s;
  return "";
}

/**
 * @param {Record<string, unknown> | null | undefined} raw
 */
export function normalizeVerification(raw) {
  if (!raw) {
    return {
      verificationStatus: "",
      contributorId: "",
      contributorName: "",
      reviewedBy: "",
      approvedBy: "",
      approvedAt: null,
      reviewNotes: "",
    };
  }

  return {
    verificationStatus: normalizeVerificationStatus(raw.verificationStatus),
    contributorId: typeof raw.contributorId === "string" ? raw.contributorId : "",
    contributorName: typeof raw.contributorName === "string" ? raw.contributorName : "",
    reviewedBy: typeof raw.reviewedBy === "string" ? raw.reviewedBy : "",
    approvedBy: typeof raw.approvedBy === "string" ? raw.approvedBy : "",
    approvedAt: raw.approvedAt ?? null,
    reviewNotes: typeof raw.reviewNotes === "string" ? raw.reviewNotes : "",
  };
}

/**
 * @param {Record<string, unknown>} plant
 * @param {string[]} statuses
 */
export function plantMatchesVerificationFilter(plant, statuses) {
  if (!statuses?.length) return true;
  const status = normalizeVerificationStatus(plant.verificationStatus);
  return statuses.includes(status);
}

/**
 * @param {import("firebase/firestore").Timestamp | Date | string | null | undefined} value
 */
export function formatVerificationDate(value) {
  if (!value) return "";
  try {
    const date =
      value && typeof value === "object" && "toDate" in value
        ? value.toDate()
        : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}
