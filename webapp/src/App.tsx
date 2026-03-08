import { FormEvent, useDeferredValue, useEffect, useState, useTransition } from "react";
import {
  addMessage,
  authenticate,
  buildSession,
  createAppointment,
  createClaim,
  createDepartmentTask,
  createEncounter,
  createInventoryItem,
  createPatient,
  createThread,
  fetchAppointments,
  fetchCareBoard,
  fetchClaims,
  fetchDashboardOverview,
  fetchEncounters,
  fetchMessages,
  fetchOrganizations,
  fetchPatients,
  fetchReconciliations,
  fetchThreads,
  fetchWorkspaces,
  recordInventoryMovement,
  resetDemoData,
  upsertConsultation,
  upsertEncounterDocumentation,
  upsertDischarge,
  upsertTriage,
  updateAppointment,
  updateClaim,
  updateDepartmentTask,
  updateEncounter
} from "./lib/api";
import {
  ACUITY_LEVEL_OPTIONS,
  addCatalogValue,
  APPOINTMENT_STATUS_OPTIONS,
  CLAIM_STATUS_OPTIONS,
  DEFAULT_REFERENCE_CATALOGS,
  DISCHARGE_STATUS_OPTIONS,
  DISPOSITION_OPTIONS,
  ENCOUNTER_STAGE_OPTIONS,
  ENCOUNTER_STATUS_OPTIONS,
  GENDER_OPTIONS,
  INVENTORY_CATEGORY_OPTIONS,
  INVENTORY_MOVEMENT_OPTIONS,
  INVENTORY_UNIT_OPTIONS,
  loadReferenceCatalogs,
  saveReferenceCatalogs,
  TASK_DEPARTMENT_OPTIONS,
  TASK_STATUS_OPTIONS,
  type ReferenceCatalogs
} from "./referenceData";
import type {
  Appointment,
  AuthSession,
  CareBoard,
  Claim,
  ConsultationRecord,
  DashboardOverview,
  DemoResetSummary,
  DepartmentTask,
  DischargePlan,
  EncounterDocumentation,
  Encounter,
  InventoryItem,
  InventoryMovement,
  Message,
  OrganizationSummary,
  Patient,
  Reconciliation,
  Thread,
  TriageRecord,
  WorkspaceSummary
} from "./types";
import {
  CatalogManager,
  CompactList,
  currency,
  EmptyState,
  formatDateTime,
  formatRole,
  HeroCard,
  humanizeEnum,
  LaneCard,
  LaneMiniGrid,
  MetricCard,
  PanelCard,
  PreviewCard,
  StatusBadge,
  TableCard,
  TimelineList
} from "./ui";

const SESSION_KEY = "structure-health-session";
const STAFF_SENDER_ID = "55555555-5555-5555-5555-555555555551";
const CUSTOM_OPTION = "__custom__";

type WorkspaceKind = "hospital" | "patient" | "hmo" | "ministry" | "platform";
type CatalogKey = keyof ReferenceCatalogs;
type SectionDefinition = { key: string; label: string; description: string };
type WorkspaceSignal = { label: string; value: string; tone?: "default" | "teal" | "amber" | "rose" };
type DocumentationFormState = {
  encounterId: string;
  patientHistory: string;
  subjectiveNotes: string;
  objectiveFindings: string;
  assessmentNotes: string;
  carePlanNotes: string;
  medicationPlan: string;
  safetyFlags: string;
  nextStepNotes: string;
};

const NAVIGATION: Record<WorkspaceKind, SectionDefinition[]> = {
  hospital: [
    { key: "command", label: "Command", description: "Operational flow, queues, and quick actions." },
    { key: "patient360", label: "Patient 360", description: "Care, billing, and communication in one patient view." },
    { key: "appointments", label: "Appointments", description: "Booking, check-in, and clinic schedule control." },
    { key: "care", label: "Care Flow", description: "Move patients through triage, consultation, lab, and discharge." },
    { key: "inventory", label: "Inventory", description: "Track stock, consumption, and replenishment across departments." },
    { key: "claims", label: "Claims", description: "Billing handoff, claim tracking, and variance visibility." },
    { key: "messages", label: "Messages", description: "Secure follow-up and patient communication." },
    { key: "admin", label: "Admin", description: "Reference data and setup context." }
  ],
  patient: [
    { key: "overview", label: "Overview", description: "Your upcoming care and latest updates." },
    { key: "journey", label: "Visits", description: "Appointments, encounter history, and follow-up." },
    { key: "messages", label: "Messages", description: "Secure conversation with the hospital." },
    { key: "billing", label: "Billing", description: "Claims and reimbursement status tied to your care." }
  ],
  hmo: [
    { key: "overview", label: "Overview", description: "Claims volume, approvals, and exposure." },
    { key: "claims", label: "Claims Review", description: "Approve, pend, or deny submissions." },
    { key: "reconciliation", label: "Reconciliation", description: "Track variance between hospital and HMO positions." }
  ],
  ministry: [
    { key: "overview", label: "Overview", description: "Topline system statistics and trends." },
    { key: "facilities", label: "Facilities", description: "Organizations and footprint." },
    { key: "service-monitor", label: "Service Monitor", description: "Care, stock, and claims activity signals." }
  ],
  platform: [
    { key: "overview", label: "Overview", description: "Cross-platform performance overview." },
    { key: "patient360", label: "Patient 360", description: "Unified patient-level view." },
    { key: "inventory", label: "Inventory", description: "Shared supply picture across care operations." },
    { key: "claims", label: "Claims", description: "End-to-end claim lifecycle." },
    { key: "admin", label: "Admin", description: "Shared setup and reference data." }
  ]
};

const TASK_TEMPLATES: Record<string, string[]> = {
  LAB: ["Complete blood count", "Urinalysis", "Culture and sensitivity"],
  PHARMACY: ["Ceftriaxone refill", "Analgesic pack", "Wound dressing consumables"],
  NURSING: ["Dressing change", "Vital sign review", "Injection administration"]
};

function createDocumentationForm(encounterId = ""): DocumentationFormState {
  return {
    encounterId,
    patientHistory: "",
    subjectiveNotes: "",
    objectiveFindings: "",
    assessmentNotes: "",
    carePlanNotes: "",
    medicationPlan: "",
    safetyFlags: "",
    nextStepNotes: ""
  };
}

function documentationToFormState(record: EncounterDocumentation): DocumentationFormState {
  return {
    encounterId: record.encounterId,
    patientHistory: record.patientHistory ?? "",
    subjectiveNotes: record.subjectiveNotes,
    objectiveFindings: record.objectiveFindings,
    assessmentNotes: record.assessmentNotes,
    carePlanNotes: record.carePlanNotes,
    medicationPlan: record.medicationPlan ?? "",
    safetyFlags: record.safetyFlags ?? "",
    nextStepNotes: record.nextStepNotes ?? ""
  };
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeSection, setActiveSection] = useState("command");
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastDemoReset, setLastDemoReset] = useState<DemoResetSummary | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [careBoard, setCareBoard] = useState<CareBoard | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [catalogs, setCatalogs] = useState<ReferenceCatalogs>(() => loadReferenceCatalogs());
  const [catalogDrafts, setCatalogDrafts] = useState<Record<CatalogKey, string>>({
    appointmentReasons: "",
    threadSubjects: ""
  });
  const [loginForm, setLoginForm] = useState({ username: "hospital-admin", password: "password" });
  const [patientForm, setPatientForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: GENDER_OPTIONS[0].value,
    dateOfBirth: "",
    insuranceMemberNumber: ""
  });
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: "",
    reasonOption: DEFAULT_REFERENCE_CATALOGS.appointmentReasons[0],
    customReason: "",
    scheduledAt: ""
  });
  const [encounterForm, setEncounterForm] = useState({
    patientId: "",
    journeyStage: "CONSULTATION",
    status: "OPEN"
  });
  const [triageForm, setTriageForm] = useState({
    encounterId: "",
    acuityLevel: ACUITY_LEVEL_OPTIONS[1],
    chiefComplaint: "",
    temperatureC: "",
    systolicBp: "",
    diastolicBp: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weightKg: "",
    notes: ""
  });
  const [consultationForm, setConsultationForm] = useState({
    encounterId: "",
    diagnosis: "",
    clinicalNotes: "",
    carePlan: "",
    followUpInstruction: ""
  });
  const [documentationForm, setDocumentationForm] = useState<DocumentationFormState>(() => createDocumentationForm());
  const [taskForm, setTaskForm] = useState({
    encounterId: "",
    departmentType: TASK_DEPARTMENT_OPTIONS[0],
    taskTemplate: TASK_TEMPLATES[TASK_DEPARTMENT_OPTIONS[0]][0],
    customTaskTitle: "",
    taskDetails: "",
    inventoryItemId: "",
    quantityRequested: ""
  });
  const [dischargeForm, setDischargeForm] = useState({
    encounterId: "",
    dischargeStatus: DISCHARGE_STATUS_OPTIONS[0],
    disposition: DISPOSITION_OPTIONS[0],
    summaryNotes: "",
    medicationNotes: "",
    followUpDate: ""
  });
  const [claimForm, setClaimForm] = useState({ encounterId: "", totalAmount: "0" });
  const [inventoryItemForm, setInventoryItemForm] = useState({
    sku: "",
    itemName: "",
    itemCategory: INVENTORY_CATEGORY_OPTIONS[0],
    unitOfMeasure: INVENTORY_UNIT_OPTIONS[0],
    quantityOnHand: "",
    reorderLevel: ""
  });
  const [movementForm, setMovementForm] = useState({
    inventoryItemId: "",
    movementType: INVENTORY_MOVEMENT_OPTIONS[0],
    quantity: "",
    notes: ""
  });
  const [threadForm, setThreadForm] = useState({
    patientId: "",
    subjectOption: DEFAULT_REFERENCE_CATALOGS.threadSubjects[0],
    customSubject: ""
  });
  const [messageForm, setMessageForm] = useState({ body: "" });
  const [isSwitching, startTransition] = useTransition();

  const deferredPatientSearch = useDeferredValue(patientSearch);
  const workspaceKind = resolveWorkspaceKind(session?.roles ?? []);
  const sections = NAVIGATION[workspaceKind];
  const selectedPatient = patients.find((item) => item.id === selectedPatientId) ?? patients[0] ?? null;
  const selectedThread = threads.find((item) => item.id === selectedThreadId) ?? threads[0] ?? null;
  const patientAppointments = selectedPatient ? appointments.filter((item) => item.patientId === selectedPatient.id) : [];
  const patientEncounters = selectedPatient ? encounters.filter((item) => item.patientId === selectedPatient.id) : [];
  const patientClaims = selectedPatient ? claims.filter((item) => item.patientId === selectedPatient.id) : [];
  const patientReconciliations = selectedPatient
    ? reconciliations.filter((item) => item.patientId === selectedPatient.id)
    : [];
  const triageRecords = careBoard?.triage ?? [];
  const consultationRecords = careBoard?.consultations ?? [];
  const documentationRecords = careBoard?.documentation ?? [];
  const departmentTasks = careBoard?.tasks ?? [];
  const dischargePlans = careBoard?.discharges ?? [];
  const boardInventory = careBoard?.inventoryItems ?? inventoryItems;
  const boardMovements = careBoard?.inventoryMovements ?? inventoryMovements;
  const patientTriage = selectedPatient ? triageRecords.filter((item) => item.patientId === selectedPatient.id) : [];
  const patientConsultations = selectedPatient
    ? consultationRecords.filter((item) => item.patientId === selectedPatient.id)
    : [];
  const patientDocumentation = selectedPatient
    ? documentationRecords.filter((item) => item.patientId === selectedPatient.id)
    : [];
  const patientTasks = selectedPatient ? departmentTasks.filter((item) => item.patientId === selectedPatient.id) : [];
  const patientDischarges = selectedPatient ? dischargePlans.filter((item) => item.patientId === selectedPatient.id) : [];
  const activeTasks = departmentTasks.filter((item) => item.taskStatus === "REQUESTED" || item.taskStatus === "IN_PROGRESS");
  const lowStockItems = boardInventory.filter(
    (item) => item.inventoryStatus === "LOW_STOCK" || item.inventoryStatus === "OUT_OF_STOCK"
  );
  const selectedDocumentationEncounter = encounters.find((item) => item.id === documentationForm.encounterId) ?? null;
  const selectedDocumentationRecord = documentationRecords.find(
    (item) => item.encounterId === documentationForm.encounterId
  ) ?? null;
  const selectedDocumentationTriage = triageRecords.find(
    (item) => item.encounterId === documentationForm.encounterId
  ) ?? null;
  const selectedDocumentationConsultation = consultationRecords.find(
    (item) => item.encounterId === documentationForm.encounterId
  ) ?? null;
  const selectedDocumentationDischarge = dischargePlans.find(
    (item) => item.encounterId === documentationForm.encounterId
  ) ?? null;
  const selectedDocumentationTasks = departmentTasks.filter(
    (item) => item.encounterId === documentationForm.encounterId
  );
  const filteredPatients = patients.filter((item) => {
    const query = deferredPatientSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      item.fullName.toLowerCase().includes(query) ||
      item.globalPatientNumber.toLowerCase().includes(query) ||
      (item.insuranceMemberNumber ?? "").toLowerCase().includes(query)
    );
  });
  const isPatientUser = session?.roles.includes("ROLE_PATIENT") ?? false;
  const canManageCatalogs = hasAnyRole(session?.roles, ["ROLE_HOSPITAL_ADMIN", "ROLE_PLATFORM_ADMIN"]);
  const workspaceSignals = buildWorkspaceSignals({
    kind: workspaceKind,
    overview,
    organizations,
    appointments,
    encounters,
    claims,
    activeTasks,
    lowStockItems,
    patientAppointments,
    patientEncounters,
    patientClaims
  });

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSession(JSON.parse(stored) as AuthSession);
    }
  }, []);

  useEffect(() => {
    if (session?.token && session.username) {
      void bootstrap(session);
    }
  }, [session?.token, session?.username]);

  useEffect(() => {
    if (!sections.some((item) => item.key === activeSection)) {
      setActiveSection(sections[0].key);
    }
  }, [activeSection, sections]);

  useEffect(() => {
    if (!patients.length) {
      return;
    }

    const defaultPatientId = patients[0].id;
    if (isPatientUser) {
      setSelectedPatientId(defaultPatientId);
      setAppointmentForm((current) => ({ ...current, patientId: defaultPatientId }));
      setEncounterForm((current) => ({ ...current, patientId: defaultPatientId }));
      setThreadForm((current) => ({ ...current, patientId: defaultPatientId }));
      return;
    }

    if (!selectedPatientId || !patients.some((item) => item.id === selectedPatientId)) {
      setSelectedPatientId(defaultPatientId);
    }
  }, [isPatientUser, patients, selectedPatientId]);

  useEffect(() => {
    if (!session || !selectedPatientId || !needsThreadData(workspaceKind, activeSection)) {
      setThreads([]);
      setMessages([]);
      return;
    }

    void refreshThreads(session, selectedPatientId);
  }, [activeSection, selectedPatientId, session, workspaceKind]);

  useEffect(() => {
    if (!session || !selectedThreadId || !needsThreadData(workspaceKind, activeSection)) {
      setMessages([]);
      return;
    }

    void refreshMessages(session, selectedThreadId);
  }, [activeSection, selectedThreadId, session, workspaceKind]);

  useEffect(() => {
    if (!documentationForm.encounterId) {
      return;
    }

    const existing = documentationRecords.find((item) => item.encounterId === documentationForm.encounterId);
    if (existing) {
      setDocumentationForm(documentationToFormState(existing));
      return;
    }

    setDocumentationForm(createDocumentationForm(documentationForm.encounterId));
  }, [documentationForm.encounterId, documentationRecords]);

  function selectSection(sectionKey: string) {
    startTransition(() => setActiveSection(sectionKey));
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setError(null);
    setBusyLabel(null);
    setOrganizations([]);
    setWorkspaces([]);
    setOverview(null);
    setPatients([]);
    setAppointments([]);
    setEncounters([]);
    setCareBoard(null);
    setClaims([]);
    setReconciliations([]);
    setInventoryItems([]);
    setInventoryMovements([]);
    setThreads([]);
    setMessages([]);
    setLastDemoReset(null);
  }

  async function bootstrap(activeSession: AuthSession) {
    setBootstrapLoading(true);
    setError(null);

    try {
      const profile = await authenticate(activeSession);
      const resolvedSession = { ...activeSession, roles: profile.roles };

      setSession(resolvedSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(resolvedSession));

      const results = await Promise.allSettled([
        fetchOrganizations(resolvedSession),
        fetchWorkspaces(resolvedSession),
        fetchDashboardOverview(resolvedSession),
        fetchPatients(resolvedSession),
        fetchAppointments(resolvedSession),
        fetchEncounters(resolvedSession),
        fetchCareBoard(resolvedSession),
        fetchClaims(resolvedSession),
        fetchReconciliations(resolvedSession)
      ]);

      settle(results[0], setOrganizations);
      settle(results[1], setWorkspaces);
      settle(results[2], setOverview);
      settle(results[3], (items) => {
        setPatients(items);
        if (items.length && !selectedPatientId) {
          setSelectedPatientId(items[0].id);
        }
      });
      settle(results[4], setAppointments);
      settle(results[5], (items) => {
        setEncounters(items);
        if (items.length && !claimForm.encounterId) {
          setClaimForm((current) => ({ ...current, encounterId: items[0].id }));
        }
        if (items.length && !triageForm.encounterId) {
          setTriageForm((current) => ({ ...current, encounterId: items[0].id }));
          setConsultationForm((current) => ({ ...current, encounterId: items[0].id }));
          setDocumentationForm((current) => ({ ...current, encounterId: items[0].id }));
          setTaskForm((current) => ({ ...current, encounterId: items[0].id }));
          setDischargeForm((current) => ({ ...current, encounterId: items[0].id }));
        }
      });
      settle(results[6], (value) => {
        setCareBoard(value);
        setInventoryItems(value.inventoryItems);
        setInventoryMovements(value.inventoryMovements);
      });
      settle(results[7], setClaims);
      settle(results[8], setReconciliations);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to sign in.");
      logout();
    } finally {
      setBootstrapLoading(false);
    }
  }

  async function withBusy<T>(label: string, action: () => Promise<T>) {
    setBusyLabel(label);
    setError(null);
    try {
      return await action();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Something went wrong.");
      throw actionError;
    } finally {
      setBusyLabel(null);
    }
  }

  async function refreshOverview(activeSession: AuthSession) {
    setOverview(await fetchDashboardOverview(activeSession));
  }

  async function refreshPatients(activeSession: AuthSession) {
    setPatients(await fetchPatients(activeSession));
  }

  async function refreshAppointments(activeSession: AuthSession) {
    setAppointments(await fetchAppointments(activeSession));
  }

  async function refreshEncounters(activeSession: AuthSession) {
    const items = await fetchEncounters(activeSession);
    setEncounters(items);
    if (items.length && !items.some((item) => item.id === claimForm.encounterId)) {
      setClaimForm((current) => ({ ...current, encounterId: items[0].id }));
    }
    if (items.length) {
      setTriageForm((current) => ({ ...current, encounterId: items.some((item) => item.id === current.encounterId) ? current.encounterId : items[0].id }));
      setConsultationForm((current) => ({ ...current, encounterId: items.some((item) => item.id === current.encounterId) ? current.encounterId : items[0].id }));
      setDocumentationForm((current) => ({ ...current, encounterId: items.some((item) => item.id === current.encounterId) ? current.encounterId : items[0].id }));
      setTaskForm((current) => ({ ...current, encounterId: items.some((item) => item.id === current.encounterId) ? current.encounterId : items[0].id }));
      setDischargeForm((current) => ({ ...current, encounterId: items.some((item) => item.id === current.encounterId) ? current.encounterId : items[0].id }));
    }
  }

  async function refreshClaims(activeSession: AuthSession) {
    setClaims(await fetchClaims(activeSession));
  }

  async function refreshReconciliation(activeSession: AuthSession) {
    setReconciliations(await fetchReconciliations(activeSession));
  }

  async function refreshCareBoard(activeSession: AuthSession) {
    const board = await fetchCareBoard(activeSession);
    setCareBoard(board);
    setInventoryItems(board.inventoryItems);
    setInventoryMovements(board.inventoryMovements);
  }

  async function refreshThreads(activeSession: AuthSession, patientId: string) {
    try {
      const items = await fetchThreads(activeSession, patientId);
      setThreads(items);
      setSelectedThreadId((current) => (items.some((item) => item.id === current) ? current : items[0]?.id ?? ""));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load messages.");
    }
  }

  async function refreshMessages(activeSession: AuthSession, threadId: string) {
    try {
      setMessages(await fetchMessages(activeSession, threadId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load conversation.");
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSession(buildSession(loginForm.username, loginForm.password));
  }

  async function handleCreatePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    await withBusy("Registering patient", async () => {
      const created = await createPatient(session, patientForm);
      setPatientForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        gender: GENDER_OPTIONS[0].value,
        dateOfBirth: "",
        insuranceMemberNumber: ""
      });
      await Promise.all([refreshPatients(session), refreshOverview(session)]);
      setSelectedPatientId(created.id);
      selectSection("patient360");
    });
  }

  async function handleCreateAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    const reason = resolveOptionValue(appointmentForm.reasonOption, appointmentForm.customReason);
    if (!reason) {
      setError("Choose a reason or type a custom reason.");
      return;
    }

    await withBusy("Booking appointment", async () => {
      await createAppointment(session, {
        patientId: appointmentForm.patientId,
        reason,
        scheduledAt: appointmentForm.scheduledAt
      });
      setAppointmentForm((current) => ({
        ...current,
        reasonOption: catalogs.appointmentReasons[0] ?? DEFAULT_REFERENCE_CATALOGS.appointmentReasons[0],
        customReason: "",
        scheduledAt: ""
      }));
      await Promise.all([refreshAppointments(session), refreshOverview(session)]);
    });
  }

  async function handleUpdateAppointment(appointmentId: string, status: string) {
    if (!session) {
      return;
    }

    await withBusy("Updating appointment", async () => {
      await updateAppointment(session, appointmentId, { status });
      await refreshAppointments(session);
    });
  }

  async function handleCreateEncounter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    await withBusy("Opening encounter", async () => {
      await createEncounter(session, encounterForm);
      await Promise.all([refreshEncounters(session), refreshOverview(session)]);
    });
  }

  async function handleProgressEncounter(encounter: Encounter, nextStage?: string, nextStatus?: string) {
    if (!session) {
      return;
    }

    await withBusy("Updating care flow", async () => {
      await updateEncounter(session, encounter.id, {
        journeyStage: nextStage ?? encounter.journeyStage,
        status: nextStatus ?? encounter.status
      });
      await Promise.all([refreshEncounters(session), refreshOverview(session)]);
    });
  }

  async function handleUpsertTriage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    await withBusy("Saving triage", async () => {
      await upsertTriage(session, {
        encounterId: triageForm.encounterId,
        acuityLevel: triageForm.acuityLevel,
        chiefComplaint: triageForm.chiefComplaint,
        temperatureC: triageForm.temperatureC ? Number(triageForm.temperatureC) : null,
        systolicBp: triageForm.systolicBp ? Number(triageForm.systolicBp) : null,
        diastolicBp: triageForm.diastolicBp ? Number(triageForm.diastolicBp) : null,
        heartRate: triageForm.heartRate ? Number(triageForm.heartRate) : null,
        respiratoryRate: triageForm.respiratoryRate ? Number(triageForm.respiratoryRate) : null,
        oxygenSaturation: triageForm.oxygenSaturation ? Number(triageForm.oxygenSaturation) : null,
        weightKg: triageForm.weightKg ? Number(triageForm.weightKg) : null,
        notes: triageForm.notes
      });
      await Promise.all([refreshCareBoard(session), refreshEncounters(session), refreshOverview(session)]);
    });
  }

  async function handleUpsertConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    await withBusy("Saving consultation", async () => {
      await upsertConsultation(session, consultationForm);
      await Promise.all([refreshCareBoard(session), refreshEncounters(session), refreshOverview(session)]);
    });
  }

  async function handleUpsertEncounterDocumentation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    await withBusy("Saving clinical documentation", async () => {
      await upsertEncounterDocumentation(session, {
        encounterId: documentationForm.encounterId,
        patientHistory: documentationForm.patientHistory,
        subjectiveNotes: documentationForm.subjectiveNotes,
        objectiveFindings: documentationForm.objectiveFindings,
        assessmentNotes: documentationForm.assessmentNotes,
        carePlanNotes: documentationForm.carePlanNotes,
        medicationPlan: documentationForm.medicationPlan,
        safetyFlags: documentationForm.safetyFlags,
        nextStepNotes: documentationForm.nextStepNotes
      });
      await Promise.all([refreshCareBoard(session), refreshEncounters(session), refreshOverview(session)]);
    });
  }

  function loadEncounterContext(encounterId: string, patientId: string) {
    setSelectedPatientId(patientId);
    setTriageForm((current) => ({ ...current, encounterId }));
    setConsultationForm((current) => ({ ...current, encounterId }));
    setDocumentationForm((current) => ({ ...current, encounterId }));
    setTaskForm((current) => ({ ...current, encounterId }));
    setDischargeForm((current) => ({ ...current, encounterId }));
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    const taskTitle =
      taskForm.taskTemplate === CUSTOM_OPTION ? taskForm.customTaskTitle.trim() : taskForm.taskTemplate.trim();
    if (!taskTitle) {
      setError("Choose a task template or provide a custom task title.");
      return;
    }

    await withBusy("Creating department task", async () => {
      await createDepartmentTask(session, {
        encounterId: taskForm.encounterId,
        departmentType: taskForm.departmentType,
        taskTitle,
        taskDetails: taskForm.taskDetails,
        inventoryItemId: taskForm.inventoryItemId || null,
        quantityRequested: taskForm.quantityRequested ? Number(taskForm.quantityRequested) : null
      });
      setTaskForm((current) => ({
        ...current,
        taskTemplate: TASK_TEMPLATES[current.departmentType][0] ?? CUSTOM_OPTION,
        customTaskTitle: "",
        taskDetails: "",
        inventoryItemId: "",
        quantityRequested: ""
      }));
      await Promise.all([refreshCareBoard(session), refreshEncounters(session), refreshOverview(session)]);
    });
  }

  async function handleUpdateTask(taskId: string, taskStatus: string) {
    if (!session) {
      return;
    }

    await withBusy("Updating department task", async () => {
      await updateDepartmentTask(session, taskId, { taskStatus });
      await Promise.all([refreshCareBoard(session), refreshOverview(session)]);
    });
  }

  async function handleUpsertDischarge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    await withBusy("Saving discharge plan", async () => {
      await upsertDischarge(session, {
        encounterId: dischargeForm.encounterId,
        dischargeStatus: dischargeForm.dischargeStatus,
        disposition: dischargeForm.disposition,
        summaryNotes: dischargeForm.summaryNotes,
        medicationNotes: dischargeForm.medicationNotes,
        followUpDate: dischargeForm.followUpDate || null
      });
      await Promise.all([refreshCareBoard(session), refreshEncounters(session), refreshOverview(session)]);
    });
  }

  async function handleCreateClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    await withBusy("Submitting claim", async () => {
      await createClaim(session, { encounterId: claimForm.encounterId, totalAmount: Number(claimForm.totalAmount) });
      setClaimForm((current) => ({ ...current, totalAmount: "0" }));
      await Promise.all([refreshClaims(session), refreshReconciliation(session), refreshOverview(session)]);
    });
  }

  async function handleUpdateClaim(item: Claim, status: string) {
    if (!session) {
      return;
    }

    const approvedAmount = status === "APPROVED" ? item.totalAmount : status === "DENIED" ? 0 : item.approvedAmount ?? null;

    await withBusy("Reviewing claim", async () => {
      await updateClaim(session, item.id, { status, approvedAmount });
      await Promise.all([refreshClaims(session), refreshReconciliation(session), refreshOverview(session)]);
    });
  }

  async function handleCreateThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    const subject = resolveOptionValue(threadForm.subjectOption, threadForm.customSubject);
    if (!subject) {
      setError("Choose a topic or type a custom subject.");
      return;
    }

    await withBusy("Opening conversation", async () => {
      const created = await createThread(session, { patientId: threadForm.patientId, subject });
      setSelectedPatientId(created.patientId);
      setThreadForm((current) => ({
        ...current,
        subjectOption: catalogs.threadSubjects[0] ?? DEFAULT_REFERENCE_CATALOGS.threadSubjects[0],
        customSubject: ""
      }));
      await refreshThreads(session, created.patientId);
      await refreshOverview(session);
    });
  }

  async function handleAddMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !selectedThreadId || !selectedPatientId || !messageForm.body.trim()) {
      return;
    }

    await withBusy("Sending message", async () => {
      await addMessage(session, selectedThreadId, {
        senderType: isPatientUser ? "PATIENT" : "STAFF",
        senderId: isPatientUser ? selectedPatientId : STAFF_SENDER_ID,
        body: messageForm.body.trim()
      });
      setMessageForm({ body: "" });
      await refreshMessages(session, selectedThreadId);
    });
  }

  async function handleCreateInventoryItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    await withBusy("Creating inventory item", async () => {
      await createInventoryItem(session, {
        sku: inventoryItemForm.sku,
        itemName: inventoryItemForm.itemName,
        itemCategory: inventoryItemForm.itemCategory,
        unitOfMeasure: inventoryItemForm.unitOfMeasure,
        quantityOnHand: Number(inventoryItemForm.quantityOnHand),
        reorderLevel: Number(inventoryItemForm.reorderLevel)
      });
      setInventoryItemForm({
        sku: "",
        itemName: "",
        itemCategory: INVENTORY_CATEGORY_OPTIONS[0],
        unitOfMeasure: INVENTORY_UNIT_OPTIONS[0],
        quantityOnHand: "",
        reorderLevel: ""
      });
      await Promise.all([refreshCareBoard(session), refreshOverview(session)]);
    });
  }

  async function handleRecordInventoryMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    await withBusy("Recording inventory movement", async () => {
      await recordInventoryMovement(session, {
        inventoryItemId: movementForm.inventoryItemId,
        movementType: movementForm.movementType,
        quantity: Number(movementForm.quantity),
        notes: movementForm.notes
      });
      setMovementForm((current) => ({ ...current, quantity: "", notes: "" }));
      await Promise.all([refreshCareBoard(session), refreshOverview(session)]);
    });
  }

  async function handleAddCatalogItem(catalogKey: CatalogKey) {
    const draft = catalogDrafts[catalogKey];
    if (!draft.trim()) {
      return;
    }

    const nextCatalogs = {
      ...catalogs,
      [catalogKey]: addCatalogValue(catalogs[catalogKey], draft)
    };
    setCatalogs(nextCatalogs);
    saveReferenceCatalogs(nextCatalogs);
    setCatalogDrafts((current) => ({ ...current, [catalogKey]: "" }));
  }

  async function handleDemoReset() {
    if (!session) {
      return;
    }

    await withBusy("Resetting demo data", async () => {
      const summary = await resetDemoData(session);
      setSelectedPatientId("");
      setSelectedThreadId("");
      setLastDemoReset(summary);
      await bootstrap(session);
    });
  }

  if (!session) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <div className="login-layout">
            <div className="brand-lockup">
              <p className="eyebrow">Structure Health</p>
              <h1>One operating layer for patient care, hospital work, claims, and oversight.</h1>
              <p className="lede">
                Sign in to a live workspace, not a brochure page. The same dataset powers hospital teams, patients,
                HMOs, and ministry users.
              </p>
              <div className="role-preview-grid">
                <PreviewCard title="Patient portal" body="Upcoming visits, messages, encounter history, and claim visibility." />
                <PreviewCard title="Hospital EMR" body="Patient 360, intake, care execution, inventory, and billing handoff." />
                <PreviewCard title="HMO claims" body="Decision queue, utilization review, and reconciliation watch." />
                <PreviewCard title="Ministry view" body="Operational statistics, facility footprint, and network signals." />
              </div>
            </div>
            <div className="login-form-panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Access workspace</p>
                  <h3>Sign in</h3>
                </div>
              </div>
              <form className="auth-form" onSubmit={handleLogin}>
                <label>
                  Username
                  <input value={loginForm.username} onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))} />
                </label>
                <label>
                  Password
                  <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} />
                </label>
                <button type="submit">Enter workspace</button>
              </form>
              <div className="quick-login-row">
                {[
                  ["patient", "Patient"],
                  ["hospital-admin", "Hospital"],
                  ["hmo-claims-officer", "HMO"],
                  ["ministry-analyst", "Ministry"]
                ].map(([username, label]) => (
                  <button key={username} type="button" className="ghost-button" onClick={() => setLoginForm({ username, password: "password" })}>
                    Use {label}
                  </button>
                ))}
              </div>
              <p className="helper-copy">Demo password for every role: <strong>password</strong></p>
            </div>
          </div>
          {error ? <div className="error-banner">{error}</div> : null}
        </section>
      </main>
    );
  }

  const currentSection = sections.find((item) => item.key === activeSection) ?? sections[0];

  return (
    <div className="workspace-shell">
      <aside className="workspace-nav">
        <div className="nav-brand">
          <p className="eyebrow">{workspaceLabel(workspaceKind)}</p>
          <h1>Structure Health</h1>
          <p className="nav-copy">{workspaceSummary(workspaceKind)}</p>
        </div>
        <nav className="section-list">
          {sections.map((section) => (
            <button key={section.key} type="button" className={`section-button${activeSection === section.key ? " active" : ""}`} onClick={() => selectSection(section.key)}>
              <strong>{section.label}</strong>
              <span>{section.description}</span>
            </button>
          ))}
        </nav>
        <div className="session-card">
          <p className="eyebrow">Signed in</p>
          <strong>{session.username}</strong>
          <div className="role-stack">
            {session.roles.map((role) => (
              <span key={role} className="role-chip">
                {formatRole(role)}
              </span>
            ))}
          </div>
          <button type="button" className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">{currentSection.label}</p>
            <h2>{sectionHeading(workspaceKind, activeSection)}</h2>
            <p className="header-copy">{currentSection.description}</p>
          </div>
          <div className="header-status">
            <span className={`state-pill${busyLabel || bootstrapLoading || isSwitching ? " pending" : ""}`}>
              {busyLabel ?? (bootstrapLoading ? "Loading workspace" : isSwitching ? "Switching view" : "Live")}
            </span>
          </div>
        </header>
        {workspaceSignals.length ? (
          <section className="workspace-ribbon">
            {workspaceSignals.map((signal) => (
              <MetricCard key={signal.label} label={signal.label} value={signal.value} tone={signal.tone ?? "default"} />
            ))}
          </section>
        ) : null}

        {error ? <div className="error-banner">{error}</div> : null}
        {!overview ? <EmptyState title="Loading workspace" body="Syncing patients, appointments, encounters, and claims." /> : renderContent()}
      </main>
    </div>
  );

  function renderContent() {
    if (workspaceKind === "patient") {
      return renderPatientWorkspace();
    }

    if (workspaceKind === "hmo") {
      return renderHmoWorkspace();
    }

    if (workspaceKind === "ministry") {
      return renderMinistryWorkspace();
    }

    if (workspaceKind === "platform") {
      if (activeSection === "claims") {
        return renderHmoWorkspace();
      }
      if (activeSection === "inventory") {
        return renderInventoryWorkspace(true);
      }
      if (activeSection === "overview") {
        return renderMinistryWorkspace();
      }
    }

    return renderHospitalWorkspace();
  }

  function renderHospitalWorkspace() {
    if (activeSection === "command") {
      const dueAppointments = appointments.filter((item) => item.status === "SCHEDULED" || item.status === "CHECKED_IN");
      const openEncounters = encounters.filter((item) => item.status !== "CLOSED");
      const activeClaims = claims.filter((item) => item.status !== "APPROVED");

      return (
        <div className="page-grid">
          <HeroCard
            title="Hospital operations at a glance"
            body="Track intake, live care, active claims, and patient communication from one operating view."
            actions={[
              { label: "Open Patient 360", onClick: () => selectSection("patient360") },
              { label: "Book visit", onClick: () => selectSection("appointments"), tone: "secondary" }
            ]}
          />
          <section className="metrics-grid">
            <MetricCard label="Patients" value={overview!.patients.toString()} />
            <MetricCard label="Appointments due" value={dueAppointments.length.toString()} tone="teal" />
            <MetricCard label="Pending tasks" value={overview!.pendingTasks.toString()} tone="amber" />
            <MetricCard label="Low stock" value={overview!.lowStockItems.toString()} tone="rose" />
          </section>
          <section className="lane-grid">
            <LaneCard title="Front desk" summary={`${dueAppointments.length} visits need movement into care`} items={dueAppointments.slice(0, 4).map((item) => `${item.patientName} - ${item.reason}`)} />
            <LaneCard title="Clinical flow" summary={`${openEncounters.length} encounters still active`} items={openEncounters.slice(0, 4).map((item) => `${item.patientName} - ${humanizeEnum(item.journeyStage)}`)} />
            <LaneCard title="Department tasks" summary={`${activeTasks.length} tasks are still being worked`} items={activeTasks.slice(0, 4).map((item) => `${item.patientName} - ${item.taskTitle}`)} />
          </section>
          <section className="panel-grid two-up">
            <PanelCard title="Recent appointments">
              <CompactList items={appointments.slice(0, 5).map((item) => ({ title: item.patientName, detail: item.reason, meta: formatDateTime(item.scheduledAt), status: item.status }))} />
            </PanelCard>
            <PanelCard title="Supply pressure">
              <CompactList items={lowStockItems.slice(0, 5).map((item) => ({ title: item.itemName, detail: `${item.quantityOnHand} ${item.unitOfMeasure}`, meta: item.sku, status: item.inventoryStatus }))} emptyTitle="No low stock items." />
            </PanelCard>
          </section>
        </div>
      );
    }

    if (activeSection === "patient360") {
      return (
        <div className="page-grid patient360-layout">
          <section className="roster-card">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Patient list</p>
                <h3>Patient 360</h3>
              </div>
              <input placeholder="Search patient" value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} />
            </div>
            <div className="roster-list">
              {filteredPatients.map((item) => (
                <button key={item.id} type="button" className={`roster-item${selectedPatient?.id === item.id ? " active" : ""}`} onClick={() => startTransition(() => setSelectedPatientId(item.id))}>
                  <strong>{item.fullName}</strong>
                  <span>{item.globalPatientNumber}</span>
                  <span>{item.insuranceMemberNumber ?? "Coverage pending"}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="page-grid">
            {selectedPatient ? (
              <>
                <HeroCard
                  title={selectedPatient.fullName}
                  body={`${selectedPatient.globalPatientNumber} - ${selectedPatient.gender ?? "Gender pending"} - ${selectedPatient.phoneNumber ?? "Phone pending"}`}
                  actions={[
                    { label: "Open messages", onClick: () => selectSection("messages") },
                    { label: "Start encounter", onClick: () => selectSection("care"), tone: "secondary" }
                  ]}
                />
                <section className="metrics-grid">
                  <MetricCard label="Upcoming visits" value={countUpcoming(patientAppointments).toString()} />
                  <MetricCard label="Open encounters" value={patientEncounters.filter((item) => item.status !== "CLOSED").length.toString()} tone="amber" />
                  <MetricCard label="Department tasks" value={patientTasks.length.toString()} tone="teal" />
                  <MetricCard label="Claims" value={patientClaims.length.toString()} tone="rose" />
                </section>
                <section className="panel-grid two-up">
                  <PanelCard title="Visit timeline">
                    <TimelineList items={[
                      ...patientAppointments.map((item) => ({ title: item.reason, detail: "Appointment", time: item.scheduledAt, status: item.status })),
                      ...patientTriage.map((item) => ({ title: `Triage - ${humanizeEnum(item.acuityLevel)}`, detail: item.chiefComplaint, time: item.recordedAt, status: item.acuityLevel })),
                      ...patientConsultations.map((item) => ({ title: item.diagnosis, detail: item.clinicalNotes, time: item.recordedAt, status: "DOCUMENTED" })),
                      ...patientDocumentation.map((item) => ({ title: "Clinical documentation", detail: item.assessmentNotes, time: item.updatedAt, status: "UPDATED" })),
                      ...patientEncounters.map((item) => ({ title: humanizeEnum(item.journeyStage), detail: "Encounter", time: item.openedAt, status: item.status }))
                    ].sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())} />
                  </PanelCard>
                  <PanelCard title="Tasks, discharge, and finance">
                    <TimelineList items={[
                      ...patientTasks.map((item) => ({ title: item.taskTitle, detail: `${humanizeEnum(item.departmentType)} task`, time: item.updatedAt, status: item.taskStatus })),
                      ...patientDischarges.map((item) => ({ title: humanizeEnum(item.disposition), detail: item.summaryNotes, time: item.updatedAt, status: item.dischargeStatus })),
                      ...patientClaims.map((item) => ({ title: `Claim ${currency(item.totalAmount)}`, detail: item.patientName, time: item.submittedAt ?? item.id, status: item.status })),
                      ...patientReconciliations.map((item) => ({ title: `Variance ${currency(item.varianceAmount)}`, detail: item.patientName, time: item.updatedAt, status: item.reconciliationStatus }))
                    ].sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())} />
                  </PanelCard>
                </section>
              </>
            ) : (
              <EmptyState title="No patient selected" body="Register a patient to open this view." />
            )}
          </section>
        </div>
      );
    }

    if (activeSection === "appointments") {
      return renderAppointmentBoard();
    }

    if (activeSection === "care") {
      return renderCareBoard();
    }

    if (activeSection === "inventory") {
      return renderInventoryWorkspace(false);
    }

    if (activeSection === "claims") {
      return renderHospitalClaimsBoard();
    }

    if (activeSection === "messages") {
      return renderMessaging(false);
    }

    return (
      <div className="page-grid">
        <HeroCard
          title="Setup and demo controls"
          body="Manage reference values, add fresh patient records, and restore the environment to a clean walkthrough state when you need it."
          actions={canManageCatalogs ? [{ label: "Reset demo data", onClick: () => void handleDemoReset() }] : undefined}
        />
        <section className="panel-grid two-up">
          <form className="form-card" onSubmit={(event) => void handleCreatePatient(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">New patient</p>
                <h3>Register patient</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Full name
                <input required value={patientForm.fullName} onChange={(event) => setPatientForm((current) => ({ ...current, fullName: event.target.value }))} />
              </label>
              <label>
                Email
                <input required type="email" value={patientForm.email} onChange={(event) => setPatientForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label>
                Phone
                <input value={patientForm.phoneNumber} onChange={(event) => setPatientForm((current) => ({ ...current, phoneNumber: event.target.value }))} />
              </label>
              <label>
                Gender
                <select value={patientForm.gender} onChange={(event) => setPatientForm((current) => ({ ...current, gender: event.target.value }))}>
                  {GENDER_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date of birth
                <input type="date" value={patientForm.dateOfBirth} onChange={(event) => setPatientForm((current) => ({ ...current, dateOfBirth: event.target.value }))} />
              </label>
              <label>
                Insurance number
                <input value={patientForm.insuranceMemberNumber} onChange={(event) => setPatientForm((current) => ({ ...current, insuranceMemberNumber: event.target.value }))} />
              </label>
            </div>
            <button type="submit">Create patient</button>
          </form>
          <PanelCard title="Demo environment">
            <CompactList
              items={[
                { title: "Organizations", detail: `${organizations.length} loaded`, status: "ACTIVE" },
                { title: "Patients", detail: `${patients.length} live records`, status: "ACTIVE" },
                { title: "Claims", detail: `${claims.length} in the reimbursement flow`, status: "UNDER_REVIEW" },
                { title: "Inventory", detail: `${boardInventory.length} stocked items`, status: lowStockItems.length ? "LOW_STOCK" : "AVAILABLE" }
              ]}
            />
            <div className="stack-actions">
              <button type="button" onClick={() => void handleDemoReset()} disabled={!canManageCatalogs || busyLabel === "Resetting demo data"}>
                Reset demo data
              </button>
              <p className="helper-copy">Use the same reset from pgAdmin with `database/demo-reset.sql` then `database/demo-seed.sql`, or run `demo-reset.cmd`.</p>
              {lastDemoReset ? (
                <div className="reset-summary">
                  <strong>Last reset by {lastDemoReset.triggeredBy}</strong>
                  <span>{lastDemoReset.patients} patients, {lastDemoReset.appointments} appointments, {lastDemoReset.encounters} encounters, {lastDemoReset.claims} claims.</span>
                </div>
              ) : null}
            </div>
          </PanelCard>
        </section>
        <section className="panel-grid two-up">
          <PanelCard title="Appointment reasons">
            <CatalogManager label="Appointment reasons" options={catalogs.appointmentReasons} draft={catalogDrafts.appointmentReasons} canEdit={canManageCatalogs} onDraftChange={(value) => setCatalogDrafts((current) => ({ ...current, appointmentReasons: value }))} onAdd={() => void handleAddCatalogItem("appointmentReasons")} />
          </PanelCard>
          <PanelCard title="Conversation topics">
            <CatalogManager label="Message subjects" options={catalogs.threadSubjects} draft={catalogDrafts.threadSubjects} canEdit={canManageCatalogs} onDraftChange={(value) => setCatalogDrafts((current) => ({ ...current, threadSubjects: value }))} onAdd={() => void handleAddCatalogItem("threadSubjects")} />
          </PanelCard>
        </section>
        <TableCard title="Organizations" headers={["Code", "Name", "Type", "Departments"]} rows={organizations.map((item) => [item.code, item.name, humanizeEnum(item.organizationType), item.departmentCount.toString()])} />
        <PanelCard title="Enabled role access">
          <CompactList items={workspaces.map((item) => ({ title: item.workspace, detail: humanizeEnum(item.role), meta: item.capabilities.join(" - ") }))} />
        </PanelCard>
      </div>
    );
  }

  function renderPatientWorkspace() {
    if (!selectedPatient) {
      return <EmptyState title="No patient record available" body="This demo login will show the first linked patient once data loads." />;
    }

    if (activeSection === "messages") {
      return renderMessaging(true);
    }

    if (activeSection === "billing") {
      return (
        <div className="page-grid">
          <section className="metrics-grid">
            <MetricCard label="Claims submitted" value={patientClaims.length.toString()} tone="rose" />
            <MetricCard label="Approved amount" value={currency(sumApproved(patientClaims))} tone="teal" />
            <MetricCard label="Open variance" value={currency(sumVariance(patientReconciliations))} tone="amber" />
          </section>
          <TableCard title="Claims status" headers={["Amount", "Status", "Approved", "Submitted"]} rows={patientClaims.map((item) => [currency(item.totalAmount), <StatusBadge key={`${item.id}-status`} value={item.status} />, item.approvedAmount == null ? "Pending" : currency(item.approvedAmount), item.submittedAt ? formatDateTime(item.submittedAt) : "Not sent"])} />
          <TableCard title="Reconciliation status" headers={["Hospital", "HMO", "Variance", "Status"]} rows={patientReconciliations.map((item) => [item.hospitalPosition, item.hmoPosition, currency(item.varianceAmount), <StatusBadge key={`${item.id}-status`} value={item.reconciliationStatus} />])} />
        </div>
      );
    }

    if (activeSection === "journey") {
      return renderPatientJourney();
    }

    return (
      <div className="page-grid">
        <HeroCard title={`Welcome back, ${selectedPatient.fullName}`} body="Your next visit, care history, claims, and conversations are all in one place." actions={[{ label: "Book follow-up", onClick: () => selectSection("journey") }, { label: "Message hospital", onClick: () => selectSection("messages"), tone: "secondary" }]} />
        <section className="metrics-grid">
          <MetricCard label="Upcoming visits" value={countUpcoming(patientAppointments).toString()} />
          <MetricCard label="Open care items" value={patientEncounters.filter((item) => item.status !== "CLOSED").length.toString()} tone="amber" />
          <MetricCard label="Department tasks" value={patientTasks.length.toString()} tone="teal" />
          <MetricCard label="Claims" value={patientClaims.length.toString()} tone="rose" />
        </section>
        <section className="panel-grid two-up">
          <PanelCard title="Next appointments">
            <CompactList items={patientAppointments.filter((item) => new Date(item.scheduledAt) >= new Date()).map((item) => ({ title: item.reason, detail: item.clinicianName ?? "Assigned clinician", meta: formatDateTime(item.scheduledAt), status: item.status }))} emptyTitle="No upcoming appointment." />
          </PanelCard>
          <PanelCard title="Latest care updates">
            <CompactList items={[
              ...patientDocumentation.map((item) => ({ title: "Clinical chart updated", detail: item.assessmentNotes, meta: formatDateTime(item.updatedAt), status: "UPDATED" })),
              ...patientTasks.map((item) => ({ title: item.taskTitle, detail: humanizeEnum(item.departmentType), meta: formatDateTime(item.updatedAt), status: item.taskStatus })),
              ...patientDischarges.map((item) => ({ title: humanizeEnum(item.disposition), detail: item.summaryNotes, meta: formatDateTime(item.updatedAt), status: item.dischargeStatus })),
              ...patientEncounters.map((item) => ({ title: humanizeEnum(item.journeyStage), detail: item.clinicianName ?? "Clinical team", meta: formatDateTime(item.openedAt), status: item.status }))
            ].slice(0, 6)} emptyTitle="No encounter history yet." />
          </PanelCard>
        </section>
      </div>
    );
  }

  function renderPatientJourney() {
    return (
      <div className="page-grid">
        <section className="split-grid">
          <form className="form-card" onSubmit={(event) => void handleCreateAppointment(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">Book care</p>
                <h3>Request appointment</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Visit reason
                <select value={appointmentForm.reasonOption} onChange={(event) => setAppointmentForm((current) => ({ ...current, reasonOption: event.target.value, patientId: selectedPatient!.id }))}>
                  {catalogs.appointmentReasons.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_OPTION}>Other</option>
                </select>
              </label>
              {appointmentForm.reasonOption === CUSTOM_OPTION ? (
                <label>
                  Custom reason
                  <input required value={appointmentForm.customReason} onChange={(event) => setAppointmentForm((current) => ({ ...current, customReason: event.target.value, patientId: selectedPatient!.id }))} />
                </label>
              ) : null}
              <label>
                Preferred time
                <input required type="datetime-local" value={appointmentForm.scheduledAt} onChange={(event) => setAppointmentForm((current) => ({ ...current, scheduledAt: event.target.value, patientId: selectedPatient!.id }))} />
              </label>
            </div>
            <button type="submit">Request appointment</button>
          </form>
          <PanelCard title="Patient profile">
            <CompactList items={[
              { title: selectedPatient!.globalPatientNumber, detail: "Patient number" },
              { title: selectedPatient!.insuranceMemberNumber ?? "Coverage pending", detail: "Insurance" },
              { title: selectedPatient!.phoneNumber ?? "Phone pending", detail: "Phone" },
              { title: selectedPatient!.dateOfBirth ?? "Date of birth pending", detail: "Date of birth" }
            ]} />
          </PanelCard>
        </section>
        <TableCard title="Appointment history" headers={["Reason", "Scheduled", "Status", "Clinician", "Action"]} rows={patientAppointments.map((item) => [
          item.reason,
          formatDateTime(item.scheduledAt),
          <StatusBadge key={`${item.id}-status`} value={item.status} />,
          item.clinicianName ?? "Pending",
          item.status === "SCHEDULED" ? (
            <button key={`${item.id}-cancel`} type="button" className="ghost-button" onClick={() => void handleUpdateAppointment(item.id, "CANCELLED")}>
              Cancel
            </button>
          ) : (
            "Completed"
          )
        ])} />
        <TableCard title="Encounter history" headers={["Stage", "Status", "Opened", "Clinician"]} rows={patientEncounters.map((item) => [
          humanizeEnum(item.journeyStage),
          <StatusBadge key={`${item.id}-status`} value={item.status} />,
          formatDateTime(item.openedAt),
          item.clinicianName ?? "Clinical team"
        ])} />
        <TableCard title="Clinical and service record" headers={["Type", "Detail", "When", "Status"]} rows={[
          ...patientTriage.map((item) => [
            `Triage - ${humanizeEnum(item.acuityLevel)}`,
            item.chiefComplaint,
            formatDateTime(item.recordedAt),
            <StatusBadge key={`${item.encounterId}-triage`} value={item.acuityLevel} />
          ]),
          ...patientConsultations.map((item) => [
            "Consultation",
            item.diagnosis,
            formatDateTime(item.recordedAt),
            <StatusBadge key={`${item.encounterId}-consultation`} value="DOCUMENTED" />
          ]),
          ...patientDocumentation.map((item) => [
            "Clinical documentation",
            item.assessmentNotes,
            formatDateTime(item.updatedAt),
            <StatusBadge key={`${item.encounterId}-documentation`} value="UPDATED" />
          ]),
          ...patientTasks.map((item) => [
            humanizeEnum(item.departmentType),
            item.taskTitle,
            formatDateTime(item.updatedAt),
            <StatusBadge key={`${item.id}-task`} value={item.taskStatus} />
          ]),
          ...patientDischarges.map((item) => [
            "Discharge",
            item.summaryNotes,
            formatDateTime(item.updatedAt),
            <StatusBadge key={`${item.encounterId}-discharge`} value={item.dischargeStatus} />
          ])
        ]} />
      </div>
    );
  }

  function renderAppointmentBoard() {
    return (
      <div className="page-grid">
        <section className="split-grid">
          <form className="form-card" onSubmit={(event) => void handleCreateAppointment(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">New visit</p>
                <h3>Book appointment</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Patient
                <select required value={appointmentForm.patientId} onChange={(event) => setAppointmentForm((current) => ({ ...current, patientId: event.target.value }))}>
                  <option value="">Select patient</option>
                  {patients.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Visit reason
                <select value={appointmentForm.reasonOption} onChange={(event) => setAppointmentForm((current) => ({ ...current, reasonOption: event.target.value }))}>
                  {catalogs.appointmentReasons.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_OPTION}>Other</option>
                </select>
              </label>
              {appointmentForm.reasonOption === CUSTOM_OPTION ? (
                <label className="full-span">
                  Custom reason
                  <input required value={appointmentForm.customReason} onChange={(event) => setAppointmentForm((current) => ({ ...current, customReason: event.target.value }))} />
                </label>
              ) : null}
              <label>
                Schedule
                <input required type="datetime-local" value={appointmentForm.scheduledAt} onChange={(event) => setAppointmentForm((current) => ({ ...current, scheduledAt: event.target.value }))} />
              </label>
            </div>
            <button type="submit">Save appointment</button>
          </form>
          <PanelCard title="Queue summary">
            <CompactList items={appointments.slice(0, 6).map((item) => ({ title: item.patientName, detail: item.reason, meta: formatDateTime(item.scheduledAt), status: item.status }))} />
          </PanelCard>
        </section>
        <TableCard title="Appointment schedule" headers={["Patient", "Reason", "Scheduled", "Status", "Action"]} rows={appointments.map((item) => [
          item.patientName,
          item.reason,
          formatDateTime(item.scheduledAt),
          <StatusBadge key={`${item.id}-status`} value={item.status} />,
          <div key={`${item.id}-actions`} className="table-actions">
            {APPOINTMENT_STATUS_OPTIONS.map((status) => (
              <button key={status} type="button" className="ghost-button" onClick={() => void handleUpdateAppointment(item.id, status)}>
                {humanizeEnum(status)}
              </button>
            ))}
          </div>
        ])} />
      </div>
    );
  }

  function renderCareBoard() {
    const selectedEncounterTimeline = [
      ...(selectedDocumentationTriage
        ? [
            {
              title: `Triage - ${humanizeEnum(selectedDocumentationTriage.acuityLevel)}`,
              detail: selectedDocumentationTriage.chiefComplaint,
              time: selectedDocumentationTriage.recordedAt,
              status: selectedDocumentationTriage.acuityLevel
            }
          ]
        : []),
      ...(selectedDocumentationConsultation
        ? [
            {
              title: selectedDocumentationConsultation.diagnosis,
              detail: selectedDocumentationConsultation.clinicalNotes,
              time: selectedDocumentationConsultation.recordedAt,
              status: "DOCUMENTED"
            }
          ]
        : []),
      ...(selectedDocumentationRecord
        ? [
            {
              title: "Clinical documentation",
              detail: selectedDocumentationRecord.assessmentNotes,
              time: selectedDocumentationRecord.updatedAt,
              status: "UPDATED"
            }
          ]
        : []),
      ...selectedDocumentationTasks.map((item) => ({
        title: item.taskTitle,
        detail: `${humanizeEnum(item.departmentType)} task`,
        time: item.updatedAt,
        status: item.taskStatus
      })),
      ...(selectedDocumentationDischarge
        ? [
            {
              title: humanizeEnum(selectedDocumentationDischarge.disposition),
              detail: selectedDocumentationDischarge.summaryNotes,
              time: selectedDocumentationDischarge.updatedAt,
              status: selectedDocumentationDischarge.dischargeStatus
            }
          ]
        : [])
    ].sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime());

    return (
      <div className="page-grid">
        <HeroCard
          title="Care execution board"
          body="Run intake, clinical charting, orders, fulfillment, and discharge from one operational board."
          actions={[
            { label: "Open inventory", onClick: () => selectSection("inventory") },
            { label: "Claims handoff", onClick: () => selectSection("claims"), tone: "secondary" }
          ]}
        />
        <section className="metrics-grid">
          <MetricCard label="Open encounters" value={encounters.filter((item) => item.status !== "CLOSED").length.toString()} />
          <MetricCard label="Charts updated" value={documentationRecords.length.toString()} tone="teal" />
          <MetricCard label="Pending tasks" value={activeTasks.length.toString()} tone="amber" />
          <MetricCard label="Low stock items" value={lowStockItems.length.toString()} tone="rose" />
        </section>
        <section className="split-grid">
          <form className="form-card" onSubmit={(event) => void handleCreateEncounter(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">Front desk handoff</p>
                <h3>Open encounter</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Patient
                <select required value={encounterForm.patientId} onChange={(event) => setEncounterForm((current) => ({ ...current, patientId: event.target.value }))}>
                  <option value="">Select patient</option>
                  {patients.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Journey stage
                <select value={encounterForm.journeyStage} onChange={(event) => setEncounterForm((current) => ({ ...current, journeyStage: event.target.value }))}>
                  {ENCOUNTER_STAGE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {humanizeEnum(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select value={encounterForm.status} onChange={(event) => setEncounterForm((current) => ({ ...current, status: event.target.value }))}>
                  {ENCOUNTER_STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {humanizeEnum(item)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit">Start encounter</button>
          </form>
          <PanelCard title="Active care lanes">
            <LaneMiniGrid items={ENCOUNTER_STAGE_OPTIONS.map((stage) => ({ label: humanizeEnum(stage), value: encounters.filter((item) => item.journeyStage === stage && item.status !== "CLOSED").length }))} />
          </PanelCard>
        </section>
        <section className="split-grid">
          <form className="form-card" onSubmit={(event) => void handleUpsertEncounterDocumentation(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">Clinical chart</p>
                <h3>Encounter documentation</h3>
              </div>
              {selectedDocumentationRecord ? <StatusBadge value="UPDATED" /> : null}
            </div>
            <div className="form-grid">
              <label>
                Encounter
                <select
                  required
                  value={documentationForm.encounterId}
                  onChange={(event) => {
                    const encounterId = event.target.value;
                    const encounter = encounters.find((item) => item.id === encounterId);
                    if (encounter) {
                      loadEncounterContext(encounter.id, encounter.patientId);
                      return;
                    }
                    setDocumentationForm(createDocumentationForm(encounterId));
                  }}
                >
                  <option value="">Select encounter</option>
                  {encounters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.patientName} - {humanizeEnum(item.journeyStage)} - {humanizeEnum(item.status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-span">
                Patient history
                <textarea
                  value={documentationForm.patientHistory}
                  onChange={(event) =>
                    setDocumentationForm((current) => ({ ...current, patientHistory: event.target.value }))
                  }
                />
              </label>
              <label className="full-span">
                Subjective notes
                <textarea
                  required
                  value={documentationForm.subjectiveNotes}
                  onChange={(event) =>
                    setDocumentationForm((current) => ({ ...current, subjectiveNotes: event.target.value }))
                  }
                />
              </label>
              <label className="full-span">
                Objective findings
                <textarea
                  required
                  value={documentationForm.objectiveFindings}
                  onChange={(event) =>
                    setDocumentationForm((current) => ({ ...current, objectiveFindings: event.target.value }))
                  }
                />
              </label>
              <label className="full-span">
                Assessment
                <textarea
                  required
                  value={documentationForm.assessmentNotes}
                  onChange={(event) =>
                    setDocumentationForm((current) => ({ ...current, assessmentNotes: event.target.value }))
                  }
                />
              </label>
              <label className="full-span">
                Care plan
                <textarea
                  required
                  value={documentationForm.carePlanNotes}
                  onChange={(event) =>
                    setDocumentationForm((current) => ({ ...current, carePlanNotes: event.target.value }))
                  }
                />
              </label>
              <label className="full-span">
                Medication plan
                <textarea
                  value={documentationForm.medicationPlan}
                  onChange={(event) =>
                    setDocumentationForm((current) => ({ ...current, medicationPlan: event.target.value }))
                  }
                />
              </label>
              <label>
                Safety flags
                <textarea
                  value={documentationForm.safetyFlags}
                  onChange={(event) =>
                    setDocumentationForm((current) => ({ ...current, safetyFlags: event.target.value }))
                  }
                />
              </label>
              <label>
                Next steps
                <textarea
                  value={documentationForm.nextStepNotes}
                  onChange={(event) =>
                    setDocumentationForm((current) => ({ ...current, nextStepNotes: event.target.value }))
                  }
                />
              </label>
            </div>
            <button type="submit">Save chart</button>
          </form>
          <PanelCard title="Encounter chart context">
            {selectedDocumentationEncounter ? (
              <div className="chart-context">
                <div className="summary-grid">
                  <div className="summary-item">
                    <span>Patient</span>
                    <strong>{selectedDocumentationEncounter.patientName}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Current stage</span>
                    <strong>{humanizeEnum(selectedDocumentationEncounter.journeyStage)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Status</span>
                    <StatusBadge value={selectedDocumentationEncounter.status} />
                  </div>
                  <div className="summary-item">
                    <span>Last chart update</span>
                    <strong>
                      {selectedDocumentationRecord
                        ? formatDateTime(selectedDocumentationRecord.updatedAt)
                        : "Not yet charted"}
                    </strong>
                  </div>
                </div>
                <div className="preview-strip">
                  <PreviewCard
                    title="Chief complaint"
                    body={selectedDocumentationTriage?.chiefComplaint ?? "Triage has not been captured yet."}
                  />
                  <PreviewCard
                    title="Diagnosis"
                    body={selectedDocumentationConsultation?.diagnosis ?? "Consultation diagnosis pending."}
                  />
                  <PreviewCard
                    title="Assessment"
                    body={selectedDocumentationRecord?.assessmentNotes ?? "No structured assessment saved yet."}
                  />
                  <PreviewCard
                    title="Next step"
                    body={selectedDocumentationRecord?.nextStepNotes ?? "No next step recorded yet."}
                  />
                </div>
                <TimelineList items={selectedEncounterTimeline} />
              </div>
            ) : (
              <EmptyState
                title="Select an encounter to document"
                body="Choosing an encounter loads the live patient context, previous notes, and department activity."
              />
            )}
          </PanelCard>
        </section>
        <section className="panel-grid two-up">
          <form className="form-card" onSubmit={(event) => void handleUpsertTriage(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">Nursing intake</p>
                <h3>Triage assessment</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Encounter
                <select required value={triageForm.encounterId} onChange={(event) => setTriageForm((current) => ({ ...current, encounterId: event.target.value }))}>
                  <option value="">Select encounter</option>
                  {encounters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.patientName} - {humanizeEnum(item.journeyStage)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Acuity
                <select value={triageForm.acuityLevel} onChange={(event) => setTriageForm((current) => ({ ...current, acuityLevel: event.target.value }))}>
                  {ACUITY_LEVEL_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {humanizeEnum(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-span">
                Chief complaint
                <input required value={triageForm.chiefComplaint} onChange={(event) => setTriageForm((current) => ({ ...current, chiefComplaint: event.target.value }))} />
              </label>
              <label>
                Temperature C
                <input type="number" step="0.1" value={triageForm.temperatureC} onChange={(event) => setTriageForm((current) => ({ ...current, temperatureC: event.target.value }))} />
              </label>
              <label>
                Systolic BP
                <input type="number" value={triageForm.systolicBp} onChange={(event) => setTriageForm((current) => ({ ...current, systolicBp: event.target.value }))} />
              </label>
              <label>
                Diastolic BP
                <input type="number" value={triageForm.diastolicBp} onChange={(event) => setTriageForm((current) => ({ ...current, diastolicBp: event.target.value }))} />
              </label>
              <label>
                Heart rate
                <input type="number" value={triageForm.heartRate} onChange={(event) => setTriageForm((current) => ({ ...current, heartRate: event.target.value }))} />
              </label>
              <label>
                Resp rate
                <input type="number" value={triageForm.respiratoryRate} onChange={(event) => setTriageForm((current) => ({ ...current, respiratoryRate: event.target.value }))} />
              </label>
              <label>
                O2 saturation
                <input type="number" value={triageForm.oxygenSaturation} onChange={(event) => setTriageForm((current) => ({ ...current, oxygenSaturation: event.target.value }))} />
              </label>
              <label>
                Weight kg
                <input type="number" step="0.1" value={triageForm.weightKg} onChange={(event) => setTriageForm((current) => ({ ...current, weightKg: event.target.value }))} />
              </label>
              <label className="full-span">
                Notes
                <textarea value={triageForm.notes} onChange={(event) => setTriageForm((current) => ({ ...current, notes: event.target.value }))} />
              </label>
            </div>
            <button type="submit">Save triage</button>
          </form>
          <form className="form-card" onSubmit={(event) => void handleUpsertConsultation(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">Consultation</p>
                <h3>Clinical note</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Encounter
                <select required value={consultationForm.encounterId} onChange={(event) => setConsultationForm((current) => ({ ...current, encounterId: event.target.value }))}>
                  <option value="">Select encounter</option>
                  {encounters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.patientName} - {humanizeEnum(item.journeyStage)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-span">
                Diagnosis
                <input required value={consultationForm.diagnosis} onChange={(event) => setConsultationForm((current) => ({ ...current, diagnosis: event.target.value }))} />
              </label>
              <label className="full-span">
                Clinical notes
                <textarea required value={consultationForm.clinicalNotes} onChange={(event) => setConsultationForm((current) => ({ ...current, clinicalNotes: event.target.value }))} />
              </label>
              <label className="full-span">
                Care plan
                <textarea value={consultationForm.carePlan} onChange={(event) => setConsultationForm((current) => ({ ...current, carePlan: event.target.value }))} />
              </label>
              <label className="full-span">
                Follow-up instruction
                <textarea value={consultationForm.followUpInstruction} onChange={(event) => setConsultationForm((current) => ({ ...current, followUpInstruction: event.target.value }))} />
              </label>
            </div>
            <button type="submit">Save consultation</button>
          </form>
        </section>
        <section className="panel-grid two-up">
          <form className="form-card" onSubmit={(event) => void handleCreateTask(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">Department execution</p>
                <h3>Create task</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Encounter
                <select required value={taskForm.encounterId} onChange={(event) => setTaskForm((current) => ({ ...current, encounterId: event.target.value }))}>
                  <option value="">Select encounter</option>
                  {encounters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.patientName} - {humanizeEnum(item.journeyStage)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Department
                <select value={taskForm.departmentType} onChange={(event) => {
                  const departmentType = event.target.value;
                  setTaskForm((current) => ({
                    ...current,
                    departmentType,
                    taskTemplate: TASK_TEMPLATES[departmentType]?.[0] ?? CUSTOM_OPTION,
                    customTaskTitle: "",
                    inventoryItemId: ""
                  }));
                }}>
                  {TASK_DEPARTMENT_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {humanizeEnum(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Task template
                <select value={taskForm.taskTemplate} onChange={(event) => setTaskForm((current) => ({ ...current, taskTemplate: event.target.value }))}>
                  {(TASK_TEMPLATES[taskForm.departmentType] ?? []).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_OPTION}>Other</option>
                </select>
              </label>
              {taskForm.taskTemplate === CUSTOM_OPTION ? (
                <label className="full-span">
                  Custom task title
                  <input required value={taskForm.customTaskTitle} onChange={(event) => setTaskForm((current) => ({ ...current, customTaskTitle: event.target.value }))} />
                </label>
              ) : null}
              <label>
                Inventory item
                <select value={taskForm.inventoryItemId} onChange={(event) => setTaskForm((current) => ({ ...current, inventoryItemId: event.target.value }))}>
                  <option value="">No linked stock</option>
                  {boardInventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} - {item.quantityOnHand} {item.unitOfMeasure}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity
                <input type="number" min="0" step="0.01" value={taskForm.quantityRequested} onChange={(event) => setTaskForm((current) => ({ ...current, quantityRequested: event.target.value }))} />
              </label>
              <label className="full-span">
                Task details
                <textarea value={taskForm.taskDetails} onChange={(event) => setTaskForm((current) => ({ ...current, taskDetails: event.target.value }))} />
              </label>
            </div>
            <button type="submit">Create task</button>
          </form>
          <form className="form-card" onSubmit={(event) => void handleUpsertDischarge(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">Exit from care</p>
                <h3>Discharge plan</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Encounter
                <select required value={dischargeForm.encounterId} onChange={(event) => setDischargeForm((current) => ({ ...current, encounterId: event.target.value }))}>
                  <option value="">Select encounter</option>
                  {encounters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.patientName} - {humanizeEnum(item.journeyStage)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Discharge status
                <select value={dischargeForm.dischargeStatus} onChange={(event) => setDischargeForm((current) => ({ ...current, dischargeStatus: event.target.value }))}>
                  {DISCHARGE_STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {humanizeEnum(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Disposition
                <select value={dischargeForm.disposition} onChange={(event) => setDischargeForm((current) => ({ ...current, disposition: event.target.value }))}>
                  {DISPOSITION_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {humanizeEnum(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-span">
                Summary notes
                <textarea required value={dischargeForm.summaryNotes} onChange={(event) => setDischargeForm((current) => ({ ...current, summaryNotes: event.target.value }))} />
              </label>
              <label className="full-span">
                Medication notes
                <textarea value={dischargeForm.medicationNotes} onChange={(event) => setDischargeForm((current) => ({ ...current, medicationNotes: event.target.value }))} />
              </label>
              <label>
                Follow-up date
                <input type="date" value={dischargeForm.followUpDate} onChange={(event) => setDischargeForm((current) => ({ ...current, followUpDate: event.target.value }))} />
              </label>
            </div>
            <button type="submit">Save discharge plan</button>
          </form>
        </section>
        <TableCard title="Encounter queue" headers={["Patient", "Current stage", "Status", "Opened", "Next action"]} rows={encounters.map((item) => [
          item.patientName,
          humanizeEnum(item.journeyStage),
          <StatusBadge key={`${item.id}-status`} value={item.status} />,
          formatDateTime(item.openedAt),
          <div key={`${item.id}-actions`} className="table-actions">
            <button type="button" className="ghost-button" onClick={() => loadEncounterContext(item.id, item.patientId)}>
              Document
            </button>
            {nextStages(item.journeyStage).map((stage) => (
              <button key={stage} type="button" className="ghost-button" onClick={() => void handleProgressEncounter(item, stage, "IN_PROGRESS")}>
                Move to {humanizeEnum(stage)}
              </button>
            ))}
            {item.status !== "CLOSED" ? (
              <button type="button" className="ghost-button" onClick={() => void handleProgressEncounter(item, item.journeyStage, "CLOSED")}>
                Close
              </button>
            ) : null}
          </div>
        ])} />
        <TableCard title="Department task queue" headers={["Patient", "Department", "Task", "Stock", "Status", "Action"]} rows={departmentTasks.map((item) => [
          item.patientName,
          humanizeEnum(item.departmentType),
          item.taskTitle,
          item.inventoryItemName ? `${item.inventoryItemName} (${item.quantityRequested ?? 0})` : "Not linked",
          <StatusBadge key={`${item.id}-status`} value={item.taskStatus} />,
          <div key={`${item.id}-actions`} className="table-actions">
            {TASK_STATUS_OPTIONS.filter((status) => status !== item.taskStatus).map((status) => (
              <button key={status} type="button" className="ghost-button" onClick={() => void handleUpdateTask(item.id, status)}>
                {humanizeEnum(status)}
              </button>
            ))}
          </div>
        ])} />
      </div>
    );
  }

  function renderInventoryWorkspace(readOnly: boolean) {
    return (
      <div className="page-grid">
        <HeroCard
          title="Inventory operations"
          body="Track stock on hand, replenish supplies, and monitor care-linked consumption across departments."
        />
        <section className="metrics-grid">
          <MetricCard label="Items tracked" value={boardInventory.length.toString()} />
          <MetricCard label="Low stock" value={lowStockItems.length.toString()} tone="rose" />
          <MetricCard label="Movements logged" value={boardMovements.length.toString()} tone="teal" />
          <MetricCard label="Linked care tasks" value={departmentTasks.filter((item) => item.inventoryItemId).length.toString()} tone="amber" />
        </section>
        {!readOnly ? (
          <section className="panel-grid two-up">
            <form className="form-card" onSubmit={(event) => void handleCreateInventoryItem(event)}>
              <div className="panel-head">
                <div>
                  <p className="eyebrow">New stock line</p>
                  <h3>Create inventory item</h3>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  SKU
                  <input required value={inventoryItemForm.sku} onChange={(event) => setInventoryItemForm((current) => ({ ...current, sku: event.target.value }))} />
                </label>
                <label>
                  Item name
                  <input required value={inventoryItemForm.itemName} onChange={(event) => setInventoryItemForm((current) => ({ ...current, itemName: event.target.value }))} />
                </label>
                <label>
                  Category
                  <select value={inventoryItemForm.itemCategory} onChange={(event) => setInventoryItemForm((current) => ({ ...current, itemCategory: event.target.value }))}>
                    {INVENTORY_CATEGORY_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {humanizeEnum(item)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Unit
                  <select value={inventoryItemForm.unitOfMeasure} onChange={(event) => setInventoryItemForm((current) => ({ ...current, unitOfMeasure: event.target.value }))}>
                    {INVENTORY_UNIT_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {humanizeEnum(item)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Opening quantity
                  <input required type="number" min="0" step="0.01" value={inventoryItemForm.quantityOnHand} onChange={(event) => setInventoryItemForm((current) => ({ ...current, quantityOnHand: event.target.value }))} />
                </label>
                <label>
                  Reorder level
                  <input required type="number" min="0" step="0.01" value={inventoryItemForm.reorderLevel} onChange={(event) => setInventoryItemForm((current) => ({ ...current, reorderLevel: event.target.value }))} />
                </label>
              </div>
              <button type="submit">Create inventory item</button>
            </form>
            <form className="form-card" onSubmit={(event) => void handleRecordInventoryMovement(event)}>
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Stock movement</p>
                  <h3>Record adjustment</h3>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  Inventory item
                  <select required value={movementForm.inventoryItemId} onChange={(event) => setMovementForm((current) => ({ ...current, inventoryItemId: event.target.value }))}>
                    <option value="">Select item</option>
                    {boardInventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.itemName} - {item.quantityOnHand} {item.unitOfMeasure}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Movement type
                  <select value={movementForm.movementType} onChange={(event) => setMovementForm((current) => ({ ...current, movementType: event.target.value }))}>
                    {INVENTORY_MOVEMENT_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {humanizeEnum(item)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantity
                  <input required type="number" min="0" step="0.01" value={movementForm.quantity} onChange={(event) => setMovementForm((current) => ({ ...current, quantity: event.target.value }))} />
                </label>
                <label className="full-span">
                  Notes
                  <textarea value={movementForm.notes} onChange={(event) => setMovementForm((current) => ({ ...current, notes: event.target.value }))} />
                </label>
              </div>
              <button type="submit">Record movement</button>
            </form>
          </section>
        ) : null}
        <TableCard title="Inventory register" headers={["SKU", "Item", "Category", "On hand", "Reorder", "Status"]} rows={boardInventory.map((item) => [
          item.sku,
          item.itemName,
          humanizeEnum(item.itemCategory),
          `${item.quantityOnHand} ${item.unitOfMeasure}`,
          `${item.reorderLevel} ${item.unitOfMeasure}`,
          <StatusBadge key={`${item.id}-status`} value={item.inventoryStatus} />
        ])} />
        <TableCard title="Recent movements" headers={["Item", "Movement", "Quantity", "Reference", "By", "When"]} rows={boardMovements.map((item) => [
          item.itemName,
          <StatusBadge key={`${item.id}-movement`} value={item.movementType} />,
          item.quantity.toString(),
          item.referenceEntityType ?? "Manual",
          item.movedByName ?? "System",
          formatDateTime(item.movedAt)
        ])} />
      </div>
    );
  }

  function renderHospitalClaimsBoard() {
    return (
      <div className="page-grid">
        <section className="split-grid">
          <form className="form-card" onSubmit={(event) => void handleCreateClaim(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">Revenue cycle</p>
                <h3>Submit claim</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Encounter
                <select required value={claimForm.encounterId} onChange={(event) => setClaimForm((current) => ({ ...current, encounterId: event.target.value }))}>
                  <option value="">Select encounter</option>
                  {encounters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.patientName} - {humanizeEnum(item.journeyStage)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Total amount
                <input required type="number" min="0" step="0.01" value={claimForm.totalAmount} onChange={(event) => setClaimForm((current) => ({ ...current, totalAmount: event.target.value }))} />
              </label>
            </div>
            <button type="submit">Send to HMO</button>
          </form>
          <PanelCard title="Claim health">
            <LaneMiniGrid items={CLAIM_STATUS_OPTIONS.map((status) => ({ label: humanizeEnum(status), value: claims.filter((item) => item.status === status).length }))} />
          </PanelCard>
        </section>
        <TableCard title="Claims tracker" headers={["Patient", "Status", "Amount", "Approved", "Submitted"]} rows={claims.map((item) => [
          item.patientName,
          <StatusBadge key={`${item.id}-status`} value={item.status} />,
          currency(item.totalAmount),
          item.approvedAmount == null ? "Pending" : currency(item.approvedAmount),
          item.submittedAt ? formatDateTime(item.submittedAt) : "Not sent"
        ])} />
        <TableCard title="Reconciliation watch" headers={["Patient", "Variance", "Hospital", "HMO", "Status"]} rows={reconciliations.map((item) => [
          item.patientName,
          currency(item.varianceAmount),
          item.hospitalPosition,
          item.hmoPosition,
          <StatusBadge key={`${item.id}-status`} value={item.reconciliationStatus} />
        ])} />
      </div>
    );
  }

  function renderHmoWorkspace() {
    if (activeSection === "claims") {
      return <TableCard title="Claims review queue" headers={["Patient", "Claim", "Status", "Approved", "Decision"]} rows={claims.map((item) => [item.patientName, currency(item.totalAmount), <StatusBadge key={`${item.id}-status`} value={item.status} />, item.approvedAmount == null ? "Pending" : currency(item.approvedAmount), <div key={`${item.id}-actions`} className="table-actions"><button type="button" className="ghost-button" onClick={() => void handleUpdateClaim(item, "UNDER_REVIEW")}>Pend</button><button type="button" className="ghost-button" onClick={() => void handleUpdateClaim(item, "APPROVED")}>Approve</button><button type="button" className="ghost-button" onClick={() => void handleUpdateClaim(item, "DENIED")}>Deny</button></div>])} />;
    }

    if (activeSection === "reconciliation") {
      return <TableCard title="Reconciliation queue" headers={["Patient", "Claim", "Hospital", "HMO", "Variance", "State"]} rows={reconciliations.map((item) => [item.patientName, <StatusBadge key={`${item.id}-claim`} value={item.claimStatus} />, item.hospitalPosition, item.hmoPosition, currency(item.varianceAmount), <StatusBadge key={`${item.id}-recon`} value={item.reconciliationStatus} />])} />;
    }

    return (
      <div className="page-grid">
        <HeroCard title="Claims command center" body="Review incoming submissions, manage exposure, and keep variance visible before settlement." />
        <section className="metrics-grid">
          <MetricCard label="Submitted" value={claims.filter((item) => item.status === "SUBMITTED").length.toString()} />
          <MetricCard label="Under review" value={claims.filter((item) => item.status === "UNDER_REVIEW").length.toString()} tone="amber" />
          <MetricCard label="Approved value" value={currency(sumApproved(claims))} tone="teal" />
          <MetricCard label="Open variance" value={currency(sumVariance(reconciliations))} tone="rose" />
        </section>
        <section className="panel-grid two-up">
          <PanelCard title="Claims awaiting decision">
            <CompactList items={claims.filter((item) => item.status === "SUBMITTED" || item.status === "UNDER_REVIEW").map((item) => ({ title: item.patientName, detail: currency(item.totalAmount), meta: item.submittedAt ? formatDateTime(item.submittedAt) : "Draft", status: item.status }))} />
          </PanelCard>
          <PanelCard title="Variance watch">
            <CompactList items={reconciliations.map((item) => ({ title: item.patientName, detail: `${item.hospitalPosition} vs ${item.hmoPosition}`, meta: currency(item.varianceAmount), status: item.reconciliationStatus }))} />
          </PanelCard>
        </section>
      </div>
    );
  }

  function renderMinistryWorkspace() {
    if (activeSection === "facilities") {
      return <TableCard title="Facility footprint" headers={["Code", "Name", "Type", "Departments"]} rows={organizations.map((item) => [item.code, item.name, humanizeEnum(item.organizationType), item.departmentCount.toString()])} />;
    }

    if (activeSection === "service-monitor") {
      return <TableCard title="Service and claims monitor" headers={["Metric", "Current value", "Signal"]} rows={[["Appointments", overview!.appointments.toString(), "Demand for outpatient care"], ["Open encounters", overview!.openEncounters.toString(), "Patients still in active care"], ["Pending tasks", overview!.pendingTasks.toString(), "Department workload still unresolved"], ["Low stock items", overview!.lowStockItems.toString(), "Supplies requiring replenishment"], ["Claims", overview!.claims.toString(), "Financial load sent to payer workflows"]]} />;
    }

    return (
      <div className="page-grid">
        <HeroCard title="National oversight dashboard" body="Track patient volume, care activity, claims, and participating facilities from one summary view." />
        <section className="metrics-grid">
          <MetricCard label="Organizations" value={overview!.organizations.toString()} />
          <MetricCard label="Patients" value={overview!.patients.toString()} tone="teal" />
          <MetricCard label="Pending tasks" value={overview!.pendingTasks.toString()} tone="amber" />
          <MetricCard label="Low stock items" value={overview!.lowStockItems.toString()} tone="rose" />
        </section>
        <section className="panel-grid two-up">
          <PanelCard title="Facility footprint">
            <CompactList items={organizations.map((item) => ({ title: item.name, detail: humanizeEnum(item.organizationType), meta: `${item.departmentCount} departments` }))} />
          </PanelCard>
          <PanelCard title="Operational signals">
            <CompactList items={[{ title: `${appointments.length} appointments`, detail: "Visits scheduled across the network" }, { title: `${activeTasks.length} active tasks`, detail: "Lab, nursing, and pharmacy work in progress" }, { title: `${lowStockItems.length} low stock items`, detail: "Supply lines close to reorder level" }, { title: `${claims.length} claims`, detail: "Claims in the reimbursement pipeline" }]} />
          </PanelCard>
        </section>
      </div>
    );
  }

  function renderMessaging(patientView: boolean) {
    const patientId = patientView ? selectedPatient?.id ?? "" : threadForm.patientId || selectedPatientId;

    return (
      <div className="page-grid">
        <section className="split-grid">
          <form className="form-card" onSubmit={(event) => void handleCreateThread(event)}>
            <div className="panel-head">
              <div>
                <p className="eyebrow">Secure messaging</p>
                <h3>Open a conversation</h3>
              </div>
            </div>
            <div className="form-grid">
              {!patientView ? (
                <label>
                  Patient
                  <select required value={threadForm.patientId} onChange={(event) => { const value = event.target.value; setThreadForm((current) => ({ ...current, patientId: value })); setSelectedPatientId(value); }}>
                    <option value="">Select patient</option>
                    {patients.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.fullName}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label>
                Topic
                <select value={threadForm.subjectOption} onChange={(event) => setThreadForm((current) => ({ ...current, subjectOption: event.target.value, patientId }))}>
                  {catalogs.threadSubjects.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_OPTION}>Other</option>
                </select>
              </label>
              {threadForm.subjectOption === CUSTOM_OPTION ? (
                <label className="full-span">
                  Custom topic
                  <input required value={threadForm.customSubject} onChange={(event) => setThreadForm((current) => ({ ...current, customSubject: event.target.value, patientId }))} />
                </label>
              ) : null}
            </div>
            <button type="submit">Start thread</button>
          </form>
          <PanelCard title="Conversation list">
            <div className="thread-picker">
              {threads.map((item) => (
                <button key={item.id} type="button" className={`thread-button${selectedThread?.id === item.id ? " active" : ""}`} onClick={() => setSelectedThreadId(item.id)}>
                  <strong>{item.subject}</strong>
                  <span>{item.messageCount} messages</span>
                  <StatusBadge value={item.status} />
                </button>
              ))}
            </div>
          </PanelCard>
        </section>
        <PanelCard title={selectedThread?.subject ?? "Conversation"}>
          <ul className="message-list">
            {messages.map((item) => (
              <li key={item.id} className={`message-bubble${item.senderPatientId ? " patient" : " staff"}`}>
                <div className="message-meta">
                  <strong>{item.senderPatientId ? "Patient" : "Hospital"}</strong>
                  <time>{formatDateTime(item.sentAt)}</time>
                </div>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
          <form className="message-form" onSubmit={(event) => void handleAddMessage(event)}>
            <textarea placeholder={patientView ? "Ask the hospital a question" : "Reply to the patient"} value={messageForm.body} onChange={(event) => setMessageForm({ body: event.target.value })} />
            <button type="submit">Send message</button>
          </form>
        </PanelCard>
      </div>
    );
  }
}

function resolveWorkspaceKind(roles: string[]): WorkspaceKind {
  if (roles.includes("ROLE_PLATFORM_ADMIN")) {
    return "platform";
  }
  if (roles.includes("ROLE_PATIENT")) {
    return "patient";
  }
  if (roles.some((role) => role.startsWith("ROLE_HMO_"))) {
    return "hmo";
  }
  if (roles.some((role) => role.startsWith("ROLE_MINISTRY_"))) {
    return "ministry";
  }
  return "hospital";
}

function workspaceLabel(kind: WorkspaceKind) {
  return {
    hospital: "Hospital workspace",
    patient: "Patient portal",
    hmo: "HMO workspace",
    ministry: "Ministry dashboard",
    platform: "Platform control"
  }[kind];
}

function workspaceSummary(kind: WorkspaceKind) {
  return {
    hospital: "Run intake, care, billing, and patient follow-up from one workspace.",
    patient: "Follow your care, ask questions, and keep track of visits and claims.",
    hmo: "Review claims quickly and keep variance visible.",
    ministry: "Monitor volume, facilities, and claims across the platform.",
    platform: "See the system end to end and manage shared setup."
  }[kind];
}

function buildWorkspaceSignals({
  kind,
  overview,
  organizations,
  appointments,
  encounters,
  claims,
  activeTasks,
  lowStockItems,
  patientAppointments,
  patientEncounters,
  patientClaims
}: {
  kind: WorkspaceKind;
  overview: DashboardOverview | null;
  organizations: OrganizationSummary[];
  appointments: Appointment[];
  encounters: Encounter[];
  claims: Claim[];
  activeTasks: DepartmentTask[];
  lowStockItems: InventoryItem[];
  patientAppointments: Appointment[];
  patientEncounters: Encounter[];
  patientClaims: Claim[];
}): WorkspaceSignal[] {
  if (!overview) {
    return [];
  }

  if (kind === "patient") {
    return [
      { label: "Upcoming visits", value: countUpcoming(patientAppointments).toString(), tone: "teal" },
      {
        label: "Open care items",
        value: patientEncounters.filter((item) => item.status !== "CLOSED").length.toString(),
        tone: "amber"
      },
      { label: "Claims", value: patientClaims.length.toString(), tone: "rose" },
      { label: "Approved amount", value: currency(sumApproved(patientClaims)) }
    ];
  }

  if (kind === "hmo") {
    return [
      { label: "Submitted claims", value: claims.filter((item) => item.status === "SUBMITTED").length.toString() },
      {
        label: "Under review",
        value: claims.filter((item) => item.status === "UNDER_REVIEW").length.toString(),
        tone: "amber"
      },
      { label: "Approved value", value: currency(sumApproved(claims)), tone: "teal" },
      { label: "Claim count", value: claims.length.toString(), tone: "rose" }
    ];
  }

  if (kind === "ministry") {
    return [
      { label: "Organizations", value: organizations.length.toString() },
      { label: "Patients", value: overview.patients.toString(), tone: "teal" },
      { label: "Pending tasks", value: overview.pendingTasks.toString(), tone: "amber" },
      { label: "Low stock", value: lowStockItems.length.toString(), tone: "rose" }
    ];
  }

  if (kind === "platform") {
    return [
      { label: "Organizations", value: organizations.length.toString() },
      { label: "Patients", value: overview.patients.toString(), tone: "teal" },
      { label: "Claims", value: claims.length.toString(), tone: "amber" },
      { label: "Low stock", value: lowStockItems.length.toString(), tone: "rose" }
    ];
  }

  return [
    { label: "Appointments", value: appointments.length.toString(), tone: "teal" },
    {
      label: "Open encounters",
      value: encounters.filter((item) => item.status !== "CLOSED").length.toString(),
      tone: "amber"
    },
    { label: "Pending tasks", value: activeTasks.length.toString() },
    { label: "Low stock", value: lowStockItems.length.toString(), tone: "rose" }
  ];
}

function sectionHeading(kind: WorkspaceKind, sectionKey: string) {
  const headings: Record<WorkspaceKind, Record<string, string>> = {
    hospital: {
      command: "Hospital command center",
      patient360: "Patient 360",
      appointments: "Appointment and intake control",
      care: "Care progression",
      inventory: "Inventory control",
      claims: "Claims and reconciliation",
      messages: "Patient communication",
      admin: "Reference data and access"
    },
    patient: {
      overview: "Patient portal",
      journey: "Visits and follow-up",
      messages: "Messages with the hospital",
      billing: "Claims and payment status"
    },
    hmo: {
      overview: "Claims command center",
      claims: "Claims review queue",
      reconciliation: "Reconciliation board"
    },
    ministry: {
      overview: "National overview",
      facilities: "Facility footprint",
      "service-monitor": "Service and claims monitor"
    },
    platform: {
      overview: "Platform overview",
      patient360: "Patient 360",
      inventory: "Cross-platform inventory",
      claims: "Claims lifecycle",
      admin: "Shared platform setup"
    }
  };

  return headings[kind][sectionKey] ?? "Workspace";
}

function needsThreadData(kind: WorkspaceKind, sectionKey: string) {
  return sectionKey === "messages" || (kind === "patient" && sectionKey === "overview");
}

function resolveOptionValue(selected: string, customValue: string) {
  return selected === CUSTOM_OPTION ? customValue.trim() : selected.trim();
}

function hasAnyRole(roles: string[] | undefined, candidates: string[]) {
  return roles ? roles.some((role) => candidates.includes(role)) : false;
}

function countUpcoming(items: Appointment[]) {
  const now = new Date().getTime();
  return items.filter((item) => new Date(item.scheduledAt).getTime() >= now).length;
}

function sumApproved(items: Claim[]) {
  return items.reduce((total, item) => total + (item.approvedAmount ?? 0), 0);
}

function sumVariance(items: Reconciliation[]) {
  return items.reduce((total, item) => total + item.varianceAmount, 0);
}

function nextStages(stage: string) {
  const currentIndex = ENCOUNTER_STAGE_OPTIONS.indexOf(stage);
  if (currentIndex === -1 || currentIndex === ENCOUNTER_STAGE_OPTIONS.length - 1) {
    return [];
  }

  return [ENCOUNTER_STAGE_OPTIONS[currentIndex + 1]];
}

function settle<T>(result: PromiseSettledResult<T>, onSuccess: (value: T) => void) {
  if (result.status === "fulfilled") {
    onSuccess(result.value);
  } else {
    console.error(result.reason);
  }
}

export default App;
