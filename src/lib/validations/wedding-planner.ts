export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

export const PLANNER_STAGES = [1, 2, 3, 4, 5, 6, 7] as const;

export const BUDGET_CATEGORIES = [
  "KUA & Hukum",
  "Venue",
  "Katering",
  "Dekorasi",
  "Busana & Rias",
  "Dokumentasi",
  "Undangan",
  "Souvenir",
  "Cincin",
  "Mahar",
  "Seserahan",
  "Musik & MC",
  "Organizer",
  "Operasional",
] as const;

export const KUA_CATEGORIES = [
  "1. Pengantar RT/RW",
  "2. Kelurahan (Model N)",
  "3. Identitas Kependudukan",
  "4. Pas Foto Resmi",
  "5. Kesehatan & Elsimil",
  "6. Numpang Nikah",
  "7. Wali & Saksi",
  "8. KUA & Hari-H",
] as const;

function toInt(v: unknown): number | null {
  const n =
    typeof v === "number"
      ? v
      : typeof v === "string" && /^\d+$/.test(v.trim())
        ? Number(v.trim())
        : Number.NaN;
  return Number.isSafeInteger(n) && n >= 0 && n <= 2_147_483_647 ? n : null;
}

export interface BudgetItemInput {
  category: string;
  itemName: string;
  pic?: string;
  estimatedAmount: number;
  paidAmount: number;
  status: string;
  note?: string;
  isExternal: boolean;
  linkMode: string;
}

const BUDGET_STATUS = ["LUNAS", "DP", "BELUM", "SIAPKAN"] as const;
const LINK_MODES = ["MANUAL", "AUTO"] as const;

export function validateBudgetItemInput(
  raw: Record<string, unknown>
): ValidationResult<BudgetItemInput> {
  const errors: Record<string, string[]> = {};

  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  if (!category) errors.category = ["Kategori wajib dipilih."];

  const itemName = typeof raw.itemName === "string" ? raw.itemName.trim() : "";
  if (!itemName || itemName.length < 2) errors.itemName = ["Nama item minimal 2 karakter."];
  else if (itemName.length > 150) errors.itemName = ["Nama item maksimal 150 karakter."];

  const est = toInt(raw.estimatedAmount);
  if (est === null) errors.estimatedAmount = ["Estimasi harus bilangan bulat rupiah yang valid."];

  const paid = toInt(raw.paidAmount);
  if (paid === null) errors.paidAmount = ["Terbayar harus bilangan bulat rupiah yang valid."];

  const status =
    typeof raw.status === "string" && (BUDGET_STATUS as readonly string[]).includes(raw.status)
      ? raw.status
      : "BELUM";

  const linkMode =
    typeof raw.linkMode === "string" && (LINK_MODES as readonly string[]).includes(raw.linkMode)
      ? raw.linkMode
      : "MANUAL";

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      category,
      itemName,
      pic: typeof raw.pic === "string" ? raw.pic.trim() || undefined : undefined,
      estimatedAmount: est as number,
      paidAmount: paid as number,
      status,
      note: typeof raw.note === "string" ? raw.note.trim() || undefined : undefined,
      isExternal: raw.isExternal !== false,
      linkMode,
    },
  };
}

export interface TaskInput {
  stage: number;
  taskText: string;
  pic?: string;
  priority: string;
  note?: string;
}

export function validateTaskInput(raw: Record<string, unknown>): ValidationResult<TaskInput> {
  const errors: Record<string, string[]> = {};

  const taskText = typeof raw.taskText === "string" ? raw.taskText.trim() : "";
  if (!taskText || taskText.length < 2) errors.taskText = ["Tugas minimal 2 karakter."];
  else if (taskText.length > 200) errors.taskText = ["Tugas maksimal 200 karakter."];

  const stage = toInt(raw.stage);
  if (stage === null || stage < 0 || stage > 7) errors.stage = ["Tahap harus 0..7."];

  const priority = raw.priority === "Tinggi" ? "Tinggi" : "Sedang";

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      stage: stage as number,
      taskText,
      pic: typeof raw.pic === "string" ? raw.pic.trim() || undefined : undefined,
      priority,
      note: typeof raw.note === "string" ? raw.note.trim() || undefined : undefined,
    },
  };
}

export interface KuaInput {
  category: string;
  docName: string;
  institution?: string;
  note?: string;
}

export function validateKuaInput(raw: Record<string, unknown>): ValidationResult<KuaInput> {
  const errors: Record<string, string[]> = {};

  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  if (!category) errors.category = ["Kategori wajib dipilih."];

  const docName = typeof raw.docName === "string" ? raw.docName.trim() : "";
  if (!docName || docName.length < 2) errors.docName = ["Nama berkas minimal 2 karakter."];

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      category,
      docName,
      institution:
        typeof raw.institution === "string" ? raw.institution.trim() || undefined : undefined,
      note: typeof raw.note === "string" ? raw.note.trim() || undefined : undefined,
    },
  };
}

export interface ProofInput {
  fileUrl: string;
  fileName?: string;
  amount?: number;
  note?: string;
}

export function validateProofInput(
  raw: Record<string, unknown>,
  userId?: string
): ValidationResult<ProofInput> {
  const errors: Record<string, string[]> = {};
  const fileUrl = typeof raw.fileUrl === "string" ? raw.fileUrl.trim() : "";
  const expectedPrefix = userId ? `/uploads/ex-budget/${userId}/proof-` : "/uploads/ex-budget/";
  if (!fileUrl || !fileUrl.startsWith(expectedPrefix) || fileUrl.includes("..")) {
    errors.fileUrl = ["File bukti tidak valid."];
  }

  const amount = raw.amount === undefined || raw.amount === "" ? undefined : toInt(raw.amount);
  if (amount !== undefined && amount === null)
    errors.amount = ["Nominal harus bilangan bulat rupiah yang valid."];

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      fileUrl,
      fileName: typeof raw.fileName === "string" ? raw.fileName.trim() || undefined : undefined,
      amount: amount ?? undefined,
      note: typeof raw.note === "string" ? raw.note.trim() || undefined : undefined,
    },
  };
}
