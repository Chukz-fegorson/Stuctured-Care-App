export type ReferenceCatalogs = {
  appointmentReasons: string[];
  threadSubjects: string[];
};

export const CATALOG_STORAGE_KEY = "structure-health-reference-catalogs";

export const GENDER_OPTIONS = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "OTHER", label: "Other" }
] as const;

export const APPOINTMENT_STATUS_OPTIONS = ["SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW"];

export const ENCOUNTER_STAGE_OPTIONS = [
  "TRIAGE",
  "CONSULTATION",
  "LAB",
  "PHARMACY",
  "ADMISSION",
  "DISCHARGE"
];

export const ENCOUNTER_STATUS_OPTIONS = ["OPEN", "PENDING", "IN_PROGRESS", "CLOSED"];

export const CLAIM_STATUS_OPTIONS = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "DENIED"];

export const ACUITY_LEVEL_OPTIONS = ["LOW", "MODERATE", "HIGH", "CRITICAL"];

export const TASK_DEPARTMENT_OPTIONS = ["LAB", "PHARMACY", "NURSING"];

export const TASK_STATUS_OPTIONS = ["REQUESTED", "IN_PROGRESS", "COMPLETED", "DISPENSED", "CANCELLED"];

export const DISCHARGE_STATUS_OPTIONS = ["PLANNED", "READY", "COMPLETED"];

export const DISPOSITION_OPTIONS = ["HOME_CARE", "ADMISSION", "TRANSFER", "REFERRAL"];

export const INVENTORY_CATEGORY_OPTIONS = ["MEDICATION", "CONSUMABLE", "LAB_SUPPLY", "DEVICE"];

export const INVENTORY_UNIT_OPTIONS = ["VIAL", "PACK", "KIT", "TABLET", "BOTTLE", "UNIT"];

export const INVENTORY_MOVEMENT_OPTIONS = ["RESTOCK", "ISSUE", "ADJUSTMENT_IN", "ADJUSTMENT_OUT"];

export const DEFAULT_REFERENCE_CATALOGS: ReferenceCatalogs = {
  appointmentReasons: [
    "General consultation",
    "Follow-up review",
    "Medication refill",
    "Lab result review",
    "Virtual consultation",
    "Procedure follow-up"
  ],
  threadSubjects: [
    "Results clarification",
    "Prescription question",
    "Billing support",
    "Care-plan follow-up",
    "Virtual consultation request"
  ]
};

export function loadReferenceCatalogs(): ReferenceCatalogs {
  if (typeof window === "undefined") {
    return DEFAULT_REFERENCE_CATALOGS;
  }

  const stored = window.localStorage.getItem(CATALOG_STORAGE_KEY);
  if (!stored) {
    return DEFAULT_REFERENCE_CATALOGS;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ReferenceCatalogs>;
    return {
      appointmentReasons: mergeOptions(DEFAULT_REFERENCE_CATALOGS.appointmentReasons, parsed.appointmentReasons ?? []),
      threadSubjects: mergeOptions(DEFAULT_REFERENCE_CATALOGS.threadSubjects, parsed.threadSubjects ?? [])
    };
  } catch {
    return DEFAULT_REFERENCE_CATALOGS;
  }
}

export function saveReferenceCatalogs(catalogs: ReferenceCatalogs) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogs));
}

export function addCatalogValue(options: string[], nextValue: string) {
  const normalized = sanitizeOption(nextValue);

  if (!normalized) {
    return options;
  }

  return mergeOptions(options, [normalized]);
}

function mergeOptions(base: string[], extra: string[]) {
  const unique = new Map<string, string>();

  [...base, ...extra].forEach((item) => {
    const normalized = sanitizeOption(item);
    if (!normalized) {
      return;
    }

    unique.set(normalized.toLowerCase(), normalized);
  });

  return Array.from(unique.values());
}

function sanitizeOption(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
