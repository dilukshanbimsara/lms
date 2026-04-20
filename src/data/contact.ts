import type { ContactPerson, ContactInstitution } from "@/types";

export const personalContact: ContactPerson = {
  name: "Mr. Kamal Perera",
  role: "Senior Mathematics & Physics Teacher",
  qualifications: [
    "B.Sc. (Hons) in Mathematics — University of Colombo",
    "Postgraduate Diploma in Education (PG Dip. Ed.)",
    "15+ years teaching experience",
    "National Top Teacher Award (2020)",
  ],
  phone: ["+94 77 123 4567", "+94 71 987 6543"],
  email: "kamal.perera@tutiolms.lk",
  address: "No. 22, Temple Road, Nugegoda, Colombo",
  socials: [
    {
      platform: "Facebook",
      url: "https://facebook.com/kamalpereratutor",
      icon: "Facebook",
    },
    {
      platform: "YouTube",
      url: "https://youtube.com/@kamalpereratutor",
      icon: "Youtube",
    },
    {
      platform: "Instagram",
      url: "https://instagram.com/kamalpereratutor",
      icon: "Instagram",
    },
  ],
};

export const institutionContacts: ContactInstitution[] = [
  {
    name: "Colombo Learning Hub",
    address: "45/B, Galle Road, Colombo 03",
    phone: ["+94 11 234 5678", "+94 77 234 5678"],
    hours: "Monday – Sunday: 7:00 AM – 8:00 PM",
  },
  {
    name: "Kandy Education Centre",
    address: "12, Peradeniya Road, Kandy",
    phone: ["+94 81 222 3456"],
    hours: "Monday – Saturday: 8:00 AM – 7:00 PM",
  },
  {
    name: "Gampaha Study Circle",
    address: "78, Yakkala Road, Gampaha",
    phone: ["+94 33 222 7890", "+94 76 222 7890"],
    hours: "Tuesday – Sunday: 8:00 AM – 7:00 PM",
  },
];
