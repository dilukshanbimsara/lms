export type Role = "SUPER_ADMIN" | "TEACHER";

export type ModalMode = "add" | "edit" | null;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  imageUrl?: string;
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<AdminUser>) => void;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminInstitution {
  id: string;
  name: string;
  address: string;
  phone: string;
  mapUrl?: string;
  timetable: AdminTimetableRow[];
}

export interface AdminTimetableRow {
  id: string;
  day: string;
  time: string;
  subject: string;
  level: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl: string;
  role: Role;
  subject?: string;
}

export type MaterialType = "PDF" | "NOTE" | "VIDEO";

export interface LearningMaterial {
  id: string;
  title: string;
  type: MaterialType;
  content: string;
  fileUrl?: string;
  subject: string;
  level: "O/L" | "A/L";
  uploadedBy: string;
  createdAt: string;
}

export interface AdminClassItem {
  id: string;
  subject: string;
  level: string;
  day: string;
  time: string;
  fee: string;
  venue?: string;
  seats?: number;
  notes?: string;
}

export interface AdminClassCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  sortOrder: number;
  items: AdminClassItem[];
}

export interface NavToggle {
  href: string;
  label: string;
  visible: boolean;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface SiteSettings {
  primaryHSL: HslColor;
  accentHSL: HslColor;
  navItems: NavToggle[];
}

export interface Column<T = unknown> {
  key: string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
}

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutContent {
  teacherName: string;
  subject: string;
  sectionTitle: string;
  sectionSubtitle: string;
  /** Newline-separated paragraphs */
  bio: string;
  /** Newline-separated qualification lines */
  qualifications: string;
  imageUrl: string;
  yearsExperience: number;
  stats: AboutStat[];
  address: string;
}

export const DEFAULT_ABOUT: AboutContent = {
  teacherName: "Mr. Kamal Perera",
  subject: "Mathematics & Physics",
  sectionTitle: "About Mr. Kamal Perera",
  sectionSubtitle:
    "A dedicated educator committed to bringing out the best in every student through proven teaching methodologies and personalised attention.",
  bio:
    "With over 15 years of teaching experience, Mr. Kamal Perera has guided thousands of students to academic excellence in O/L and A/L Mathematics and Physics. His student-first approach, combined with deep subject expertise, creates an environment where learning becomes intuitive and results follow naturally.\n\nHolding a B.Sc. (Hons) in Mathematics from the University of Colombo and a Postgraduate Diploma in Education, Mr. Perera brings both academic rigour and practical classroom mastery to every session.\n\nHis classes are structured to build strong fundamentals first, then progressively challenge students through past-paper practice, concept deep-dives, and exam strategy sessions.",
  qualifications:
    "B.Sc. (Hons) Mathematics — University of Colombo\nPostgraduate Diploma in Education\nNational Top Teacher Award (2019, 2020, 2023)\nExaminer — Department of Examinations Sri Lanka",
  imageUrl: "/images/teacher.jpg",
  yearsExperience: 15,
  stats: [
    { value: "800+", label: "Students Annually" },
    { value: "15+", label: "Years Experience" },
    { value: "95%", label: "Pass Rate" },
    { value: "3x", label: "Top Teacher Award" },
  ],
  address: "No. 22, Temple Road, Nugegoda, Colombo",
};

// ─── Color Presets ─────────────────────────────────────────────────────────────

export interface ColorPreset {
  id: string;
  name: string;
  primaryHSL: HslColor;
  accentHSL: HslColor;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "navy-amber",
    name: "Navy & Amber",
    primaryHSL: { h: 215, s: 70, l: 25 },
    accentHSL: { h: 38, s: 95, l: 53 },
  },
  {
    id: "forest-gold",
    name: "Forest & Gold",
    primaryHSL: { h: 160, s: 60, l: 22 },
    accentHSL: { h: 45, s: 90, l: 50 },
  },
  {
    id: "burgundy-teal",
    name: "Burgundy & Teal",
    primaryHSL: { h: 345, s: 62, l: 28 },
    accentHSL: { h: 178, s: 65, l: 40 },
  },
  {
    id: "charcoal-coral",
    name: "Charcoal & Coral",
    primaryHSL: { h: 220, s: 15, l: 22 },
    accentHSL: { h: 10, s: 82, l: 55 },
  },
];

// ─── Hero Background ───────────────────────────────────────────────────────────

export interface HeroBackground {
  type: "gradient" | "image";
  imageUrl?: string;
}

export const DEFAULT_HERO_BG: HeroBackground = { type: "gradient" };

// ─── Site Config ───────────────────────────────────────────────────────────────

export interface SiteConfig {
  siteName: string;
  siteTagline: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: "TutioLMS",
  siteTagline:
    "Professional tuition classes for O/L and A/L students. Expert teaching with proven results.",
};

// ─── Footer Teacher (assembled from DB for server-side rendering) ──────────────

export interface FooterTeacher {
  name: string;
  subject: string;
  phone: string;
  email: string;
  address: string;
}
