import { CVData, CustomSection } from '../types/cv';

export const createEmptyCV = (): CVData => ({
  personalInfo: {
    fullName: "",
    professionalTitle: "",
    avatarUrl: ""
  },
  profile: "",
  contact: {
    email: "",
    phone: "",
    location: "",
    github: "",
    linkedin: ""
  },
  skills: [],
  technologies: [],
  experiences: [],
  languages: [],
  certifications: [],
  customSections: [],
  sectionOrder: [
    "personal",
    "profile",
    "skills",
    "technologies",
    "experiences",
    "certifications",
    "languages"
  ],
  sectionTitles: {
    profile: "Profil Professionnel",
    skills: "Domaines de Compétences",
    technologies: "Environnements Techniques",
    experiences: "Expériences Professionnelles",
    certifications: "Certifications",
    languages: "Langues"
  }
});

export const createCustomSection = (title: string, subtitle?: string): CustomSection => ({
  id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title,
  subtitle,
  blocks: [""]
});

export const generateSectionId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const migrateLegacyData = (data: any): CVData => {
  if (!data.customSections) {
    data.customSections = [];
  }

  if (!data.sectionOrder || data.sectionOrder.length === 0) {
    data.sectionOrder = [
      "personal",
      "profile",
      "skills",
      "technologies",
      "experiences",
      "certifications",
      "languages"
    ];
  }

  if (!data.sectionTitles.skills) {
    data.sectionTitles.skills = "Domaines de Compétences";
  }

  if (data.technologies && data.technologies.length > 0) {
    data.technologies = data.technologies.map((tech: any, index: number) => {
      if (!tech.id) {
        return { ...tech, id: `tech-${index + 1}` };
      }
      return tech;
    });
  }

  return data as CVData;
};
