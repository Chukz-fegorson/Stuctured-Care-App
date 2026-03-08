import type {
  Appointment,
  AuthSession,
  CareBoard,
  Claim,
  ConsultationRecord,
  DashboardOverview,
  DemoResetSummary,
  EncounterDocumentation,
  DepartmentTask,
  DischargePlan,
  Encounter,
  InventoryItem,
  InventoryMovement,
  Message,
  OrganizationSummary,
  Patient,
  Reconciliation,
  Thread,
  TriageRecord,
  UserProfile,
  WorkspaceSummary
} from "../types";

const serviceUrls = {
  platform:
    import.meta.env.VITE_PLATFORM_API_URL ??
    (typeof window === "undefined" ? "http://localhost:6060" : window.location.origin),
  identity: import.meta.env.VITE_IDENTITY_API_URL ?? "http://localhost:6061",
  patient: import.meta.env.VITE_PATIENT_API_URL ?? "http://localhost:6062",
  care: import.meta.env.VITE_CARE_API_URL ?? "http://localhost:6063",
  billing: import.meta.env.VITE_BILLING_API_URL ?? "http://localhost:6064",
  reporting: import.meta.env.VITE_REPORTING_API_URL ?? "http://localhost:6065"
};

function authHeaders(session: AuthSession): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Basic ${session.token}`,
    "Content-Type": "application/json"
  };
}

async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function buildSession(username: string, password: string): AuthSession {
  return {
    username,
    token: btoa(`${username}:${password}`),
    roles: []
  };
}

export async function authenticate(session: AuthSession): Promise<UserProfile> {
  return readJson<UserProfile>(`${serviceUrls.identity}/api/v1/access/me`, {
    headers: authHeaders(session)
  });
}

export function fetchOrganizations(session: AuthSession): Promise<OrganizationSummary[]> {
  return readJson<OrganizationSummary[]>(`${serviceUrls.identity}/api/v1/access/organizations`, {
    headers: authHeaders(session)
  });
}

export function fetchWorkspaces(session: AuthSession): Promise<WorkspaceSummary[]> {
  return readJson<WorkspaceSummary[]>(`${serviceUrls.identity}/api/v1/access/workspaces`, {
    headers: authHeaders(session)
  });
}

export function fetchDashboardOverview(session: AuthSession): Promise<DashboardOverview> {
  return readJson<DashboardOverview>(`${serviceUrls.reporting}/api/v1/reporting/overview`, {
    headers: authHeaders(session)
  });
}

export function resetDemoData(session: AuthSession): Promise<DemoResetSummary> {
  return readJson<DemoResetSummary>(`${serviceUrls.platform}/api/v1/platform/demo/reset`, {
    method: "POST",
    headers: authHeaders(session)
  });
}

export function fetchPatients(session: AuthSession): Promise<Patient[]> {
  return readJson<Patient[]>(`${serviceUrls.patient}/api/v1/patients`, {
    headers: authHeaders(session)
  });
}

export function createPatient(
  session: AuthSession,
  payload: {
    fullName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    dateOfBirth: string;
    insuranceMemberNumber: string;
  }
): Promise<Patient> {
  return readJson<Patient>(`${serviceUrls.patient}/api/v1/patients`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify({
      ...payload,
      dateOfBirth: payload.dateOfBirth || null,
      phoneNumber: payload.phoneNumber || null,
      insuranceMemberNumber: payload.insuranceMemberNumber || null
    })
  });
}

export function fetchAppointments(session: AuthSession): Promise<Appointment[]> {
  return readJson<Appointment[]>(`${serviceUrls.patient}/api/v1/appointments`, {
    headers: authHeaders(session)
  });
}

export function createAppointment(
  session: AuthSession,
  payload: {
    patientId: string;
    reason: string;
    scheduledAt: string;
  }
): Promise<Appointment> {
  return readJson<Appointment>(`${serviceUrls.patient}/api/v1/appointments`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function updateAppointment(
  session: AuthSession,
  appointmentId: string,
  payload: {
    status?: string;
    scheduledAt?: string;
  }
): Promise<Appointment> {
  return readJson<Appointment>(`${serviceUrls.patient}/api/v1/appointments/${appointmentId}`, {
    method: "PATCH",
    headers: authHeaders(session),
    body: JSON.stringify({
      status: payload.status ?? null,
      scheduledAt: payload.scheduledAt ?? null
    })
  });
}

export function fetchThreads(session: AuthSession, patientId: string): Promise<Thread[]> {
  return readJson<Thread[]>(
    `${serviceUrls.patient}/api/v1/threads?patientId=${encodeURIComponent(patientId)}`,
    {
      headers: authHeaders(session)
    }
  );
}

export function createThread(
  session: AuthSession,
  payload: {
    patientId: string;
    subject: string;
  }
): Promise<Thread> {
  return readJson<Thread>(`${serviceUrls.patient}/api/v1/threads`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function fetchMessages(session: AuthSession, threadId: string): Promise<Message[]> {
  return readJson<Message[]>(`${serviceUrls.patient}/api/v1/threads/${threadId}/messages`, {
    headers: authHeaders(session)
  });
}

export function addMessage(
  session: AuthSession,
  threadId: string,
  payload: {
    senderType: string;
    senderId: string;
    body: string;
  }
): Promise<Message> {
  return readJson<Message>(`${serviceUrls.patient}/api/v1/threads/${threadId}/messages`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function fetchEncounters(session: AuthSession): Promise<Encounter[]> {
  return readJson<Encounter[]>(`${serviceUrls.care}/api/v1/encounters`, {
    headers: authHeaders(session)
  });
}

export function fetchCareBoard(session: AuthSession): Promise<CareBoard> {
  return readJson<CareBoard>(`${serviceUrls.care}/api/v1/care-board`, {
    headers: authHeaders(session)
  });
}

export function createEncounter(
  session: AuthSession,
  payload: {
    patientId: string;
    journeyStage: string;
    status: string;
  }
): Promise<Encounter> {
  return readJson<Encounter>(`${serviceUrls.care}/api/v1/encounters`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function updateEncounter(
  session: AuthSession,
  encounterId: string,
  payload: {
    journeyStage?: string;
    status?: string;
  }
): Promise<Encounter> {
  return readJson<Encounter>(`${serviceUrls.care}/api/v1/encounters/${encounterId}`, {
    method: "PATCH",
    headers: authHeaders(session),
    body: JSON.stringify({
      journeyStage: payload.journeyStage ?? null,
      status: payload.status ?? null
    })
  });
}

export function upsertTriage(
  session: AuthSession,
  payload: {
    encounterId: string;
    acuityLevel: string;
    chiefComplaint: string;
    temperatureC?: number | null;
    systolicBp?: number | null;
    diastolicBp?: number | null;
    heartRate?: number | null;
    respiratoryRate?: number | null;
    oxygenSaturation?: number | null;
    weightKg?: number | null;
    notes?: string;
  }
): Promise<TriageRecord> {
  return readJson<TriageRecord>(`${serviceUrls.care}/api/v1/triage`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function upsertConsultation(
  session: AuthSession,
  payload: {
    encounterId: string;
    diagnosis: string;
    clinicalNotes: string;
    carePlan?: string;
    followUpInstruction?: string;
  }
): Promise<ConsultationRecord> {
  return readJson<ConsultationRecord>(`${serviceUrls.care}/api/v1/consultations`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function fetchEncounterDocumentation(
  session: AuthSession,
  encounterId: string
): Promise<EncounterDocumentation> {
  return readJson<EncounterDocumentation>(
    `${serviceUrls.care}/api/v1/encounters/${encounterId}/documentation`,
    {
      headers: authHeaders(session)
    }
  );
}

export function upsertEncounterDocumentation(
  session: AuthSession,
  payload: {
    encounterId: string;
    patientHistory?: string;
    subjectiveNotes: string;
    objectiveFindings: string;
    assessmentNotes: string;
    carePlanNotes: string;
    medicationPlan?: string;
    safetyFlags?: string;
    nextStepNotes?: string;
  }
): Promise<EncounterDocumentation> {
  return readJson<EncounterDocumentation>(`${serviceUrls.care}/api/v1/encounter-documentation`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function createDepartmentTask(
  session: AuthSession,
  payload: {
    encounterId: string;
    departmentType: string;
    taskTitle: string;
    taskDetails?: string;
    inventoryItemId?: string | null;
    quantityRequested?: number | null;
  }
): Promise<DepartmentTask> {
  return readJson<DepartmentTask>(`${serviceUrls.care}/api/v1/tasks`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function updateDepartmentTask(
  session: AuthSession,
  taskId: string,
  payload: {
    taskStatus?: string;
    taskDetails?: string;
    assignedToUserId?: string | null;
    inventoryItemId?: string | null;
    quantityRequested?: number | null;
  }
): Promise<DepartmentTask> {
  return readJson<DepartmentTask>(`${serviceUrls.care}/api/v1/tasks/${taskId}`, {
    method: "PATCH",
    headers: authHeaders(session),
    body: JSON.stringify({
      taskStatus: payload.taskStatus ?? null,
      taskDetails: payload.taskDetails ?? null,
      assignedToUserId: payload.assignedToUserId ?? null,
      inventoryItemId: payload.inventoryItemId ?? null,
      quantityRequested: payload.quantityRequested ?? null
    })
  });
}

export function upsertDischarge(
  session: AuthSession,
  payload: {
    encounterId: string;
    dischargeStatus: string;
    disposition: string;
    summaryNotes: string;
    medicationNotes?: string;
    followUpDate?: string | null;
  }
): Promise<DischargePlan> {
  return readJson<DischargePlan>(`${serviceUrls.care}/api/v1/discharges`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function fetchInventory(session: AuthSession): Promise<InventoryItem[]> {
  return readJson<InventoryItem[]>(`${serviceUrls.care}/api/v1/inventory`, {
    headers: authHeaders(session)
  });
}

export function createInventoryItem(
  session: AuthSession,
  payload: {
    sku: string;
    itemName: string;
    itemCategory: string;
    unitOfMeasure: string;
    quantityOnHand: number;
    reorderLevel: number;
  }
): Promise<InventoryItem> {
  return readJson<InventoryItem>(`${serviceUrls.care}/api/v1/inventory`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function fetchInventoryMovements(session: AuthSession): Promise<InventoryMovement[]> {
  return readJson<InventoryMovement[]>(`${serviceUrls.care}/api/v1/inventory/movements`, {
    headers: authHeaders(session)
  });
}

export function recordInventoryMovement(
  session: AuthSession,
  payload: {
    inventoryItemId: string;
    movementType: string;
    quantity: number;
    referenceEntityType?: string | null;
    referenceEntityId?: string | null;
    notes?: string;
  }
): Promise<InventoryMovement> {
  return readJson<InventoryMovement>(`${serviceUrls.care}/api/v1/inventory/movements`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify({
      inventoryItemId: payload.inventoryItemId,
      movementType: payload.movementType,
      quantity: payload.quantity,
      referenceEntityType: payload.referenceEntityType ?? null,
      referenceEntityId: payload.referenceEntityId ?? null,
      notes: payload.notes ?? null
    })
  });
}

export function fetchClaims(session: AuthSession): Promise<Claim[]> {
  return readJson<Claim[]>(`${serviceUrls.billing}/api/v1/claims`, {
    headers: authHeaders(session)
  });
}

export function createClaim(
  session: AuthSession,
  payload: {
    encounterId: string;
    totalAmount: number;
  }
): Promise<Claim> {
  return readJson<Claim>(`${serviceUrls.billing}/api/v1/claims`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(payload)
  });
}

export function updateClaim(
  session: AuthSession,
  claimId: string,
  payload: {
    status?: string;
    approvedAmount?: number | null;
  }
): Promise<Claim> {
  return readJson<Claim>(`${serviceUrls.billing}/api/v1/claims/${claimId}`, {
    method: "PATCH",
    headers: authHeaders(session),
    body: JSON.stringify({
      status: payload.status ?? null,
      approvedAmount: payload.approvedAmount ?? null
    })
  });
}

export function fetchReconciliations(session: AuthSession): Promise<Reconciliation[]> {
  return readJson<Reconciliation[]>(`${serviceUrls.billing}/api/v1/reconciliations`, {
    headers: authHeaders(session)
  });
}
