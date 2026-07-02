export type Stat = { value: string; label: string };
export type CtaLink = { label: string; anchor: string };

export type NavContent = {
  name: string;
  role: string;
  links: { label: string; anchor: string }[];
  languageToggleLabel: string;
  cta: CtaLink;
};

export type HeroContent = {
  availability: string;
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  stats: Stat[];
  cvLabel: string;
  cvUrl: string;
  clientsHeading: string;
  clients: string[];
};

export type ServiceItem = {
  index: string;
  tag: string;
  title: string;
  description: string;
};
export type ServicesContent = { kicker: string; heading: string; items: ServiceItem[] };

export type ImpactItem = { value: string; label: string };
export type ImpactContent = { kicker: string; heading: string; items: ImpactItem[] };

export type StackGroup = { category: string; items: string[] };
export type StackContent = { kicker: string; heading: string; groups: StackGroup[] };

export type ExperienceItem = {
  period: string;
  location: string;
  current?: boolean;
  currentLabel?: string;
  role: string;
  company: string;
  description: string;
};
export type ExperienceContent = { kicker: string; heading: string; items: ExperienceItem[] };

export type ProjectItem = {
  category: string;
  title: string;
  description: string;
  tech: string[];
};
export type ProjectsContent = { kicker: string; heading: string; items: ProjectItem[] };

export type Certification = { name: string; issuer: string };
export type CertificationsContent = { kicker: string; heading: string; items: Certification[] };

export type EducationItem = { title: string; institution: string; period: string };
export type LanguageItem = { language: string; level: string };
export type EducationContent = {
  kicker: string;
  heading: string;
  items: EducationItem[];
  languagesHeading: string;
  languages: LanguageItem[];
};
export type ProcessStep = { number: string; title: string; description: string };
export type ProcessContent = { kicker: string; heading: string; steps: ProcessStep[] };

export type CollaborationModel = {
  tag: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};
export type CollaborationContent = { kicker: string; heading: string; blurb: string; models: CollaborationModel[] };

export type FooterContent = { copyright: string; tagline: string };

export type ContactContent = {
  kicker: string;
  heading: string;
  blurb: string;
  emailCta: string;
  whatsappCta: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  location: string;
};

export type PortfolioContent = {
  nav: NavContent;
  hero: HeroContent;
  services: ServicesContent;
  process: ProcessContent;
  impact: ImpactContent;
  stack: StackContent;
  experience: ExperienceContent;
  projects: ProjectsContent;
  certifications: CertificationsContent;
  education: EducationContent;
  collaboration: CollaborationContent;
  contact: ContactContent;
  footer: FooterContent;
};
