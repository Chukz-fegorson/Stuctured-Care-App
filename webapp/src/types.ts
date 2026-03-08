export type AuthSession = {
  username: string;
  token: string;
  roles: string[];
};

export type UserProfile = {
  username: string;
  roles: string[];
};

export type OrganizationSummary = {
  id: string;
  code: string;
  name: string;
  organizationType: string;
  departmentCount: number;
};

export type WorkspaceSummary = {
  role: string;
  workspace: string;
  capabilities: string[];
};

export type DashboardOverview = {
  organizations: number;
  patients: number;
  appointments: number;
  openEncounters: number;
  openThreads: number;
  claims: number;
  claimValue: number;
  pendingTasks: number;
  lowStockItems: number;
};

export type DemoResetSummary = {
  triggeredBy: string;
  organizations: number;
  patients: number;
  appointments: number;
  encounters: number;
  tasks: number;
  claims: number;
  inventoryItems: number;
};

export type Patient = {
  id: string;
  fullName: string;
  email: string;
  globalPatientNumber: string;
  gender: string | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  insuranceMemberNumber: string | null;
  createdAt: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  reason: string;
  status: string;
  scheduledAt: string;
  clinicianName: string | null;
};

export type Encounter = {
  id: string;
  patientId: string;
  patientName: string;
  clinicianName: string | null;
  journeyStage: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
};

export type Claim = {
  id: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  status: string;
  totalAmount: number;
  approvedAmount: number | null;
  submittedAt: string | null;
};

export type TriageRecord = {
  encounterId: string;
  patientId: string;
  patientName: string;
  recordedByName: string | null;
  acuityLevel: string;
  chiefComplaint: string;
  temperatureC: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  weightKg: number | null;
  notes: string | null;
  recordedAt: string;
};

export type ConsultationRecord = {
  encounterId: string;
  patientId: string;
  patientName: string;
  clinicianName: string | null;
  diagnosis: string;
  clinicalNotes: string;
  carePlan: string | null;
  followUpInstruction: string | null;
  recordedAt: string;
};

export type EncounterDocumentation = {
  encounterId: string;
  patientId: string;
  patientName: string;
  documentedByName: string | null;
  patientHistory: string | null;
  subjectiveNotes: string;
  objectiveFindings: string;
  assessmentNotes: string;
  carePlanNotes: string;
  medicationPlan: string | null;
  safetyFlags: string | null;
  nextStepNotes: string | null;
  updatedAt: string;
};

export type DepartmentTask = {
  id: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  departmentType: string;
  taskTitle: string;
  taskDetails: string | null;
  taskStatus: string;
  requestedByName: string | null;
  assignedToName: string | null;
  assignedToUserId: string | null;
  inventoryItemId: string | null;
  inventoryItemName: string | null;
  quantityRequested: number | null;
  updatedAt: string;
};

export type DischargePlan = {
  encounterId: string;
  patientId: string;
  patientName: string;
  dischargeStatus: string;
  disposition: string;
  summaryNotes: string;
  medicationNotes: string | null;
  followUpDate: string | null;
  dischargedByName: string | null;
  updatedAt: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  itemName: string;
  itemCategory: string;
  unitOfMeasure: string;
  quantityOnHand: number;
  reorderLevel: number;
  inventoryStatus: string;
  updatedAt: string;
};

export type InventoryMovement = {
  id: string;
  inventoryItemId: string;
  itemName: string;
  movementType: string;
  quantity: number;
  referenceEntityType: string | null;
  referenceEntityId: string | null;
  notes: string | null;
  movedByName: string | null;
  movedAt: string;
};

export type CareBoard = {
  encounters: Encounter[];
  triage: TriageRecord[];
  consultations: ConsultationRecord[];
  documentation: EncounterDocumentation[];
  tasks: DepartmentTask[];
  discharges: DischargePlan[];
  inventoryItems: InventoryItem[];
  inventoryMovements: InventoryMovement[];
};

export type Reconciliation = {
  id: string;
  claimId: string;
  patientId: string;
  patientName: string;
  claimStatus: string;
  patientPosition: string;
  hospitalPosition: string;
  hmoPosition: string;
  varianceAmount: number;
  reconciliationStatus: string;
  updatedAt: string;
};

export type Thread = {
  id: string;
  patientId: string;
  subject: string;
  status: string;
  createdAt: string;
  messageCount: number;
};

export type Message = {
  id: string;
  threadId: string;
  senderUserId: string | null;
  senderPatientId: string | null;
  messageType: string;
  body: string;
  sentAt: string;
};
