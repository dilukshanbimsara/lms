import type { AdminUser, Banner, AdminInstitution, Teacher, LearningMaterial, AdminClassCategory, AdminClassItem, Student, PaginatedStudents, StudentUser, StudentRegisterData, ResultSheet, ResultSheetSummary, StudentResultEntry, StudentMyResult, StudentExamDetail } from "@/types/admin";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000") + "/api";

// ─── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("auth_token");
}

export function getStudentToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("student_auth_token");
}

export function setStudentToken(token: string): void {
  localStorage.setItem("student_auth_token", token);
}

export function clearStudentToken(): void {
  localStorage.removeItem("student_auth_token");
}

// ─── Core request wrapper ──────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}, useStudentToken = false): Promise<T> {
  const token = useStudentToken ? getStudentToken() : getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers ?? {}) as Record<string, string>),
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message) ? body.message[0] : body.message;
      }
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Uses the Next.js app's own API routes so reads/writes hit the same Prisma DB
// that server components use — keeps admin writes and public reads in sync.
async function requestLocal<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers ?? {}) as Record<string, string>),
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message) ? body.message[0] : body.message;
      }
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: AdminUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// ─── Banners ───────────────────────────────────────────────────────────────────

export interface ApiBanner {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

function mapBanner(b: ApiBanner): Banner {
  return {
    id: b.id,
    title: b.title,
    imageUrl: b.imageUrl,
    isActive: b.isActive,
    createdAt: b.createdAt.split("T")[0],
  };
}

// Public endpoint — no auth token required. Safe to call from server components.
export const publicBanners = {
  list: async (): Promise<ApiBanner[]> => {
    try {
      const res = await fetch(`${BASE}/banners-public`, {
        cache: "no-store",
      });
      if (!res.ok) return [];
      return res.json() as Promise<ApiBanner[]>;
    } catch {
      return [];
    }
  },
};

export const banners = {
  list: async (): Promise<Banner[]> => {
    const res = await request<ApiBanner[]>("/banners");
    return res.map(mapBanner);
  },
  create: async (data: Omit<Banner, "id" | "createdAt">): Promise<Banner> => {
    const res = await request<ApiBanner>("/banners", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return mapBanner(res);
  },
  update: async (id: string, data: Partial<Omit<Banner, "id" | "createdAt">>): Promise<Banner> => {
    const res = await request<ApiBanner>(`/banners/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return mapBanner(res);
  },
  delete: (id: string): Promise<void> =>
    request<void>(`/banners/${id}`, { method: "DELETE" }),
};

// ─── Institutions ──────────────────────────────────────────────────────────────

interface ApiTimetableRow {
  id: string;
  day: string;
  time: string;
  subject: string;
  level: string;
  institutionId: string;
}

interface ApiInstitution {
  id: string;
  name: string;
  address: string;
  phone: string;
  mapUrl?: string;
  timetable: ApiTimetableRow[];
}

function mapInstitution(i: ApiInstitution): AdminInstitution {
  return {
    id: i.id,
    name: i.name,
    address: i.address,
    phone: i.phone,
    mapUrl: i.mapUrl,
    timetable: i.timetable.map(({ id, day, time, subject, level }) => ({
      id,
      day,
      time,
      subject,
      level,
    })),
  };
}

function toInstitutionPayload(data: Omit<AdminInstitution, "id">) {
  return {
    name: data.name,
    address: data.address,
    phone: data.phone,
    ...(data.mapUrl ? { mapUrl: data.mapUrl } : {}),
    timetable: data.timetable.map(({ day, time, subject, level }) => ({
      day,
      time,
      subject,
      level,
    })),
  };
}

export const institutions = {
  list: async (): Promise<AdminInstitution[]> => {
    const res = await request<ApiInstitution[]>("/institutions");
    return res.map(mapInstitution);
  },
  create: async (data: Omit<AdminInstitution, "id">): Promise<AdminInstitution> => {
    const res = await request<ApiInstitution>("/institutions", {
      method: "POST",
      body: JSON.stringify(toInstitutionPayload(data)),
    });
    return mapInstitution(res);
  },
  update: async (id: string, data: Omit<AdminInstitution, "id">): Promise<AdminInstitution> => {
    const res = await request<ApiInstitution>(`/institutions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toInstitutionPayload(data)),
    });
    return mapInstitution(res);
  },
  delete: (id: string): Promise<void> =>
    request<void>(`/institutions/${id}`, { method: "DELETE" }),
};

// ─── Users / Teachers ──────────────────────────────────────────────────────────

interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  role: "SUPER_ADMIN" | "TEACHER";
}

function mapUser(u: ApiUser): Teacher {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    imageUrl: u.imageUrl ?? "",
    role: u.role,
  };
}

export const users = {
  list: async (): Promise<Teacher[]> => {
    const res = await request<ApiUser[]>("/users");
    return res.map(mapUser);
  },
  me: (): Promise<AdminUser> => request<AdminUser>("/users/me"),
  create: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    imageUrl?: string;
    role?: string;
  }): Promise<Teacher> => {
    const res = await request<ApiUser>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return mapUser(res);
  },
  update: async (
    id: string,
    data: { name?: string; phone?: string; imageUrl?: string; password?: string }
  ): Promise<Teacher> => {
    const res = await request<ApiUser>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return mapUser(res);
  },
  updateMe: (data: { name?: string; phone?: string; imageUrl?: string }): Promise<AdminUser> =>
    request<AdminUser>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    request<void>(`/users/${id}`, { method: "DELETE" }),
};

// ─── Learning Materials ────────────────────────────────────────────────────────

interface ApiMaterial {
  id: string;
  title: string;
  type: "PDF" | "NOTE" | "VIDEO";
  content: string;
  fileUrl?: string;
  subject: string;
  level: string;
  uploaderId: string;
  createdAt: string;
}

function mapMaterial(m: ApiMaterial): LearningMaterial {
  return {
    id: m.id,
    title: m.title,
    type: m.type,
    content: m.content,
    fileUrl: m.fileUrl,
    subject: m.subject,
    level: m.level as "O/L" | "A/L",
    uploadedBy: m.uploaderId,
    createdAt: m.createdAt.split("T")[0],
  };
}

export const materials = {
  list: async (): Promise<LearningMaterial[]> => {
    const res = await request<ApiMaterial[]>("/learning-materials");
    return res.map(mapMaterial);
  },
  create: async (data: Omit<LearningMaterial, "id" | "createdAt">): Promise<LearningMaterial> => {
    const res = await request<ApiMaterial>("/learning-materials", {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        type: data.type,
        subject: data.subject,
        level: data.level,
        content: data.content ?? "",
        ...(data.fileUrl ? { fileUrl: data.fileUrl } : {}),
      }),
    });
    return mapMaterial(res);
  },
  update: async (
    id: string,
    data: Partial<Omit<LearningMaterial, "id" | "createdAt">>
  ): Promise<LearningMaterial> => {
    const res = await request<ApiMaterial>(`/learning-materials/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.subject !== undefined ? { subject: data.subject } : {}),
        ...(data.level !== undefined ? { level: data.level } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.fileUrl !== undefined ? { fileUrl: data.fileUrl } : {}),
      }),
    });
    return mapMaterial(res);
  },
  delete: (id: string): Promise<void> =>
    request<void>(`/learning-materials/${id}`, { method: "DELETE" }),
};

// ─── Classes ──────────────────────────────────────────────────────────────────

interface ApiClassItem {
  id: string;
  subject: string;
  subjectCode?: string;
  level: string;
  day: string;
  time: string;
  fee: string;
  venue?: string;
  seats?: number;
  notes?: string;
  sortOrder: number;
  categoryId: string;
}

interface ApiClassCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  sortOrder: number;
  items: ApiClassItem[];
}

function mapClassItem(i: ApiClassItem): AdminClassItem {
  return {
    id: i.id,
    subject: i.subject,
    subjectCode: i.subjectCode,
    level: i.level,
    day: i.day,
    time: i.time,
    fee: i.fee,
    venue: i.venue,
    seats: i.seats,
    notes: i.notes,
  };
}

function mapClassCategory(c: ApiClassCategory): AdminClassCategory {
  return {
    id: c.id,
    label: c.label,
    icon: c.icon,
    description: c.description,
    sortOrder: c.sortOrder,
    items: c.items.map(mapClassItem),
  };
}

function toClassCategoryPayload(data: Omit<AdminClassCategory, "id">) {
  return {
    label: data.label,
    icon: data.icon,
    description: data.description,
    sortOrder: data.sortOrder,
    items: data.items.map(({ subject, subjectCode, level, day, time, fee, venue, seats, notes }) => ({
      subject,
      ...(subjectCode ? { subjectCode } : {}),
      level,
      day,
      time,
      fee,
      ...(venue ? { venue } : {}),
      ...(seats !== undefined ? { seats } : {}),
      ...(notes ? { notes } : {}),
    })),
  };
}

export const classes = {
  list: async (): Promise<AdminClassCategory[]> => {
    const res = await request<ApiClassCategory[]>("/classes");
    return res.map(mapClassCategory);
  },
  create: async (data: Omit<AdminClassCategory, "id">): Promise<AdminClassCategory> => {
    const res = await request<ApiClassCategory>("/classes", {
      method: "POST",
      body: JSON.stringify(toClassCategoryPayload(data)),
    });
    return mapClassCategory(res);
  },
  update: async (id: string, data: Omit<AdminClassCategory, "id">): Promise<AdminClassCategory> => {
    const res = await request<ApiClassCategory>(`/classes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toClassCategoryPayload(data)),
    });
    return mapClassCategory(res);
  },
  delete: (id: string): Promise<void> =>
    request<void>(`/classes/${id}`, { method: "DELETE" }),
};

// ─── Site Settings ─────────────────────────────────────────────────────────────

export const siteSettings = {
  list: (): Promise<Array<{ key: string; value: unknown }>> =>
    requestLocal<Array<{ key: string; value: unknown }>>("/api/site-settings"),
  get: (key: string): Promise<{ key: string; value: unknown }> =>
    requestLocal<{ key: string; value: unknown }>(`/api/site-settings/${key}`),
  set: (key: string, value: unknown): Promise<{ key: string; value: unknown }> =>
    requestLocal<{ key: string; value: unknown }>(`/api/site-settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    }),
};

// ─── Public endpoints (no auth) ────────────────────────────────────────────────

export const publicClasses = {
  list: async (): Promise<AdminClassCategory[]> => {
    try {
      const res = await fetch(`${BASE}/classes-public`, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json() as ApiClassCategory[];
      return data.map(mapClassCategory);
    } catch {
      return [];
    }
  },
};

export const publicInstitutions = {
  list: async (): Promise<AdminInstitution[]> => {
    try {
      const res = await fetch(`${BASE}/institutions-public`, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json() as ApiInstitution[];
      return data.map(mapInstitution);
    } catch {
      return [];
    }
  },
};

// ─── Students ──────────────────────────────────────────────────────────────────

export const studentAuth = {
  login: (email: string, password: string) =>
    request<{ access_token: string; student: StudentUser }>("/auth/student-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

export const students = {
  register: (data: StudentRegisterData): Promise<Student> =>
    request<Student>("/students/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    examYear?: string;
    examLevel?: string;
  }): Promise<PaginatedStudents> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    if (params?.examYear) qs.set("examYear", params.examYear);
    if (params?.examLevel) qs.set("examLevel", params.examLevel);
    const q = qs.toString();
    return request<PaginatedStudents>(`/students${q ? `?${q}` : ""}`);
  },

  get: (id: string): Promise<Student> =>
    request<Student>(`/students/${id}`),

  approve: (id: string): Promise<Student> =>
    request<Student>(`/students/${id}/approve`, { method: "PATCH" }),

  reject: (id: string): Promise<Student> =>
    request<Student>(`/students/${id}/reject`, { method: "PATCH" }),

  toggleStatus: (id: string): Promise<Student> =>
    request<Student>(`/students/${id}/toggle-status`, { method: "PATCH" }),

  delete: (id: string): Promise<void> =>
    request<void>(`/students/${id}`, { method: "DELETE" }),

  me: (): Promise<Student> =>
    request<Student>("/students/me", {}, true),

  updateProfile: (data: { profileImageUrl?: string; name?: string; phone?: string; address?: string }): Promise<Student> =>
    request<Student>("/students/me/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),
};

// ─── Student Results (student-token endpoints) ────────────────────────────────

export const studentResults = {
  list: (): Promise<StudentMyResult[]> =>
    request<StudentMyResult[]>("/student-results", {}, true),

  getDetail: (sheetId: string): Promise<StudentExamDetail> =>
    request<StudentExamDetail>(`/student-results/${sheetId}`, {}, true),
};

// ─── Results ──────────────────────────────────────────────────────────────────

export const results = {
  list: (): Promise<ResultSheetSummary[]> =>
    request("/results"),

  get: (id: string): Promise<ResultSheet> =>
    request(`/results/${id}`),

  create: (data: Omit<ResultSheet, "id" | "createdAt" | "updatedAt">): Promise<ResultSheet> =>
    request("/results", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Omit<ResultSheet, "id" | "createdAt" | "updatedAt">): Promise<ResultSheet> =>
    request(`/results/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  remove: (id: string): Promise<void> =>
    request(`/results/${id}`, { method: "DELETE" }),

  loadStudents: (institutionIds: string[], year: string): Promise<StudentResultEntry[]> =>
    request(`/results/students?institutionIds=${institutionIds.join(",")}&year=${encodeURIComponent(year)}`),
};
