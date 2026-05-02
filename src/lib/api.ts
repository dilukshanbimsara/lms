import type { AdminUser, Banner, AdminInstitution, Teacher, LearningMaterial } from "@/types/admin";

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

// ─── Core request wrapper ──────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
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
