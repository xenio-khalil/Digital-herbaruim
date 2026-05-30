import { normalizeVerification, plantMatchesVerificationFilter, VERIFICATION_STATUS } from "@/lib/verification";

/** @typedef {{ kingdom?: string, division?: string, class?: string, order?: string, family?: string, genus?: string, species?: string }} ScientificClassification */
/** @typedef {{ url: string, publicId?: string, caption?: string }} MicroscopicImage */
/** @typedef {{ uid?: string, name?: string, email?: string }} SubmittedBy */

export const PLANT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const PLANT_STATUS_LABELS = {
  [PLANT_STATUS.DRAFT]: "Draft",
  [PLANT_STATUS.PENDING]: "Pending Review",
  [PLANT_STATUS.APPROVED]: "Approved",
  [PLANT_STATUS.REJECTED]: "Rejected",
};

export const PLANT_STATUS_ICONS = {
  [PLANT_STATUS.DRAFT]: "📝",
  [PLANT_STATUS.PENDING]: "⏳",
  [PLANT_STATUS.APPROVED]: "✅",
  [PLANT_STATUS.REJECTED]: "❌",
};

export const EMPTY_CLASSIFICATION = {
  kingdom: "",
  division: "",
  class: "",
  order: "",
  family: "",
  genus: "",
  species: "",
};

export const CLASSIFICATION_LABELS = [
  { key: "kingdom", label: "Kingdom" },
  { key: "division", label: "Division" },
  { key: "class", label: "Class" },
  { key: "order", label: "Order" },
  { key: "family", label: "Family" },
  { key: "genus", label: "Genus" },
  { key: "species", label: "Species" },
];

/**
 * @param {unknown} status
 */
export function normalizePlantStatus(status) {
  const s = typeof status === "string" ? status.trim() : "";
  if (Object.values(PLANT_STATUS).includes(s)) return s;
  return PLANT_STATUS.APPROVED;
}

/**
 * @param {unknown} value
 */
export function normalizeSubmittedBy(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    uid: typeof source.uid === "string" ? source.uid : "",
    name: typeof source.name === "string" ? source.name : "",
    email: typeof source.email === "string" ? source.email : "",
  };
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
export function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

/**
 * @param {unknown} value
 * @returns {ScientificClassification}
 */
export function normalizeScientificClassification(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    kingdom: typeof source.kingdom === "string" ? source.kingdom.trim() : "",
    division: typeof source.division === "string" ? source.division.trim() : "",
    class: typeof source.class === "string" ? source.class.trim() : "",
    order: typeof source.order === "string" ? source.order.trim() : "",
    family: typeof source.family === "string" ? source.family.trim() : "",
    genus: typeof source.genus === "string" ? source.genus.trim() : "",
    species: typeof source.species === "string" ? source.species.trim() : "",
  };
}

/**
 * @param {unknown} value
 * @returns {MicroscopicImage[]}
 */
export function normalizeMicroscopicImages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const url = typeof item.url === "string" ? item.url.trim() : "";
      if (!url) return null;
      return {
        url,
        publicId: typeof item.publicId === "string" ? item.publicId.trim() : "",
        caption: typeof item.caption === "string" ? item.caption.trim() : "",
      };
    })
    .filter(Boolean);
}

/**
 * @param {Record<string, unknown> | null | undefined} raw
 */
export function normalizePlant(raw) {
  if (!raw) return null;
  const verification = normalizeVerification(raw);
  const status = normalizePlantStatus(raw.status);
  const submittedBy = normalizeSubmittedBy(raw.submittedBy);

  return {
    ...raw,
    ...verification,
    status,
    submittedBy,
    reviewerNotes: typeof raw.reviewerNotes === "string" ? raw.reviewerNotes : "",
    medicinalProperties: normalizeStringArray(raw.medicinalProperties),
    tags: normalizeStringArray(raw.tags),
    microscopicImages: normalizeMicroscopicImages(raw.microscopicImages),
    scientificClassification: normalizeScientificClassification(raw.scientificClassification),
  };
}

/**
 * @param {Record<string, unknown>} plant
 */
export function isPublicPlant(plant) {
  return normalizePlantStatus(plant.status) === PLANT_STATUS.APPROVED;
}

/**
 * @param {Record<string, unknown>} plant
 * @param {string | undefined} uid
 */
export function isPlantOwner(plant, uid) {
  if (!uid) return false;
  return normalizeSubmittedBy(plant.submittedBy).uid === uid;
}

/**
 * @param {Record<string, unknown>} plant
 * @param {string} query
 */
export function plantMatchesSearch(plant, query) {
  if (!query) return true;
  const classification = normalizeScientificClassification(plant.scientificClassification);
  const hay = [
    plant.plantName,
    plant.scientificName,
    plant.family,
    plant.location,
    plant.collector,
    plant.description,
    plant.date,
    ...normalizeStringArray(plant.medicinalProperties),
    ...normalizeStringArray(plant.tags),
    ...Object.values(classification),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(query.toLowerCase());
}

/**
 * @param {Record<string, unknown>} plant
 * @param {{ families?: string[], locations?: string[], medicinalProperties?: string[], tags?: string[], verificationStatuses?: string[] }} filters
 */
export function plantMatchesFilters(plant, filters) {
  const families = filters.families ?? [];
  const locations = filters.locations ?? [];
  const properties = filters.medicinalProperties ?? [];
  const tags = filters.tags ?? [];
  const verificationStatuses = filters.verificationStatuses ?? [];

  if (!plantMatchesVerificationFilter(plant, verificationStatuses)) return false;

  if (families.length > 0) {
    const family = (plant.family ?? "").toString().trim();
    if (!families.some((f) => f.toLowerCase() === family.toLowerCase())) return false;
  }

  if (locations.length > 0) {
    const location = (plant.location ?? "").toString().trim();
    if (!locations.some((l) => l.toLowerCase() === location.toLowerCase())) return false;
  }

  if (properties.length > 0) {
    const plantProps = normalizeStringArray(plant.medicinalProperties).map((p) => p.toLowerCase());
    if (!properties.some((p) => plantProps.includes(p.toLowerCase()))) return false;
  }

  if (tags.length > 0) {
    const plantTags = normalizeStringArray(plant.tags).map((t) => t.toLowerCase());
    if (!tags.some((t) => plantTags.includes(t.toLowerCase()))) return false;
  }

  return true;
}

/**
 * @param {Record<string, unknown>[]} plants
 * @param {{ searchQuery?: string, families?: string[], locations?: string[], medicinalProperties?: string[], tags?: string[], verificationStatuses?: string[] }} options
 */
export function filterPlants(plants, options) {
  const q = (options.searchQuery ?? "").trim().toLowerCase();
  return plants.filter(
    (plant) => plantMatchesSearch(plant, q) && plantMatchesFilters(plant, options),
  );
}

/**
 * @param {Record<string, unknown>[]} plants
 */
export function computePlantStats(plants) {
  const publicPlants = plants.filter(isPublicPlant);
  const families = new Set();
  const locations = new Set();
  const tags = new Set();
  let totalVerified = 0;

  for (const plant of publicPlants) {
    const family = (plant.family ?? "").toString().trim();
    const location = (plant.location ?? "").toString().trim();
    if (family) families.add(family);
    if (location) locations.add(location);
    for (const tag of normalizeStringArray(plant.tags)) tags.add(tag);
    const vs = plant.verificationStatus;
    if (
      vs === VERIFICATION_STATUS.VERIFIED ||
      vs === VERIFICATION_STATUS.PROFESSOR_REVIEWED
    ) {
      totalVerified += 1;
    }
  }

  return {
    totalPlants: publicPlants.length,
    totalFamilies: families.size,
    totalLocations: locations.size,
    totalTags: tags.size,
    totalVerified,
  };
}

/**
 * @param {Record<string, unknown>[]} plants
 */
export function deriveFilterOptions(plants) {
  const publicPlants = plants.filter(isPublicPlant);
  const families = new Set();
  const locations = new Set();
  const medicinalProperties = new Set();
  const tags = new Set();

  for (const plant of publicPlants) {
    const family = (plant.family ?? "").toString().trim();
    const location = (plant.location ?? "").toString().trim();
    if (family) families.add(family);
    if (location) locations.add(location);
    for (const prop of normalizeStringArray(plant.medicinalProperties)) medicinalProperties.add(prop);
    for (const tag of normalizeStringArray(plant.tags)) tags.add(tag);
  }

  const sortAlpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" });

  return {
    families: [...families].sort(sortAlpha),
    locations: [...locations].sort(sortAlpha),
    medicinalProperties: [...medicinalProperties].sort(sortAlpha),
    tags: [...tags].sort(sortAlpha),
  };
}

/**
 * @param {Record<string, unknown>} form
 */
export function buildPlantDocument(form) {
  const classification = normalizeScientificClassification(form.scientificClassification);

  const doc = {
    plantName: (form.plantName ?? "").toString().trim(),
    scientificName: (form.scientificName ?? "").toString().trim(),
    family: (form.family ?? "").toString().trim(),
    location: (form.location ?? "").toString().trim(),
    collector: (form.collector ?? "").toString().trim(),
    date: form.date ?? "",
    description: (form.description ?? "").toString().trim(),
    medicinalProperties: normalizeStringArray(form.medicinalProperties),
    tags: normalizeStringArray(form.tags),
    microscopicImages: normalizeMicroscopicImages(form.microscopicImages),
    scientificClassification: classification,
  };

  if (form.imageUrl) doc.imageUrl = form.imageUrl.toString().trim();
  if (form.imagePublicId) doc.imagePublicId = form.imagePublicId.toString().trim();

  return doc;
}

/**
 * @param {Record<string, unknown>} form
 * @param {{ uid: string, name: string, email: string }} author
 * @param {string} status
 */
export function buildStudentPlantDocument(form, author, status = PLANT_STATUS.DRAFT) {
  return {
    ...buildPlantDocument(form),
    submittedBy: {
      uid: author.uid,
      name: author.name,
      email: author.email,
    },
    status,
    contributorId: author.uid,
    contributorName: author.name,
  };
}

/**
 * @param {Record<string, unknown>} data
 */
export function plantToFormState(data) {
  return {
    plantName: data.plantName ?? "",
    scientificName: data.scientificName ?? "",
    family: data.family ?? "",
    location: data.location ?? "",
    collector: data.collector ?? "",
    date: data.date ?? "",
    description: data.description ?? "",
    imageUrl: data.imageUrl ?? "",
    imagePublicId: data.imagePublicId ?? "",
    medicinalProperties: normalizeStringArray(data.medicinalProperties),
    tags: normalizeStringArray(data.tags),
    microscopicImages: normalizeMicroscopicImages(data.microscopicImages),
    scientificClassification: normalizeScientificClassification(data.scientificClassification),
  };
}

export const EMPTY_PLANT_FORM = {
  plantName: "",
  scientificName: "",
  family: "",
  location: "",
  collector: "",
  date: "",
  description: "",
  imageUrl: "",
  imagePublicId: "",
  medicinalProperties: [],
  tags: [],
  microscopicImages: [],
  scientificClassification: { ...EMPTY_CLASSIFICATION },
};
