export interface Slide {
  id: string;
  heading: string;
  subheading: string;
  backgroundColor: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface TimetableRow {
  day: string;
  time: string;
  subject: string;
  level: string;
}

export interface Institution {
  id: string;
  name: string;
  address: string;
  phone: string;
  mapUrl?: string;
  timetable: TimetableRow[];
}

export interface ClassItem {
  subject: string;
  level: string;
  day: string;
  time: string;
  fee: string;
  venue?: string;
  seats?: number;
  notes?: string;
}

export interface ClassCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  items: ClassItem[];
}

export interface LearningDocument {
  id: string;
  title: string;
  subject: string;
  level: string;
  year?: string;
  fileSize?: string;
  downloadUrl: string;
  icon?: string;
}

export interface Social {
  platform: string;
  url: string;
  icon: string;
}

export interface ContactPerson {
  name: string;
  role: string;
  qualifications: string[];
  phone: string[];
  email?: string;
  address?: string;
  imageUrl?: string;
  socials?: Social[];
}

export interface ContactInstitution {
  name: string;
  address: string;
  phone: string[];
  hours?: string;
}

export interface NavItem {
  label: string;
  href: string;
}
