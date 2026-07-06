export type Stat = { value: string; label: string };
export type CtaLink = { label: string; anchor: string };

export type NavContent = {
  name: string;
  role: string;
  links: { label: string; anchor: string }[];
  languageToggleLabel: string;
  cta: CtaLink;
  dock: { home: string; services: string; about: string; projects: string; contact: string };
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
  ctaBandTitle: string;
  ctaBandSub: string;
};

export type ServiceItem = {
  index: string;
  tag: string;
  title: string;
  description: string;
  projectType: string;
  recommendedModel: string;
};
export type ServicesContent = { kicker: string; heading: string; requestCta: string; seeAllCta: string; items: ServiceItem[] };

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

export type GlobalStat = { value: string; label: string };
export type GlobalLocation = { name: string; tag: string };
export type GlobalLanguage = { language: string; level: string; percent: number };
export type GlobalReachContent = {
  kicker: string;
  heading: string;
  blurb: string;
  stats: GlobalStat[];
  locationsHeading: string;
  locations: GlobalLocation[];
  languagesHeading: string;
  languages: GlobalLanguage[];
  teamHeading: string;
  teamItems: string[];
};

export type ProjectItem = {
  category: string;
  title: string;
  description: string;
  tech: string[];
};
export type ProjectsContent = { kicker: string; heading: string; items: ProjectItem[] };

export type TestimonialItem = { quote: string; name: string; role: string; photoUrl?: string };
export type TestimonialsContent = {
  kicker: string;
  heading: string;
  blurb: string;
  linkedinUrl: string;
  items: TestimonialItem[];
};

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
  linkedinLabel: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formTypeLabel: string;
  projectTypes: string[];
  formBudgetLabel: string;
  budgets: string[];
  formMessageLabel: string;
  formMessagePlaceholder: string;
  formHint: string;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  stepProjectLabel: string;
  stepScheduleLabel: string;
  nextCta: string;
  backCta: string;
  confirmCta: string;
  slotsHeading: string;
  slotsFreeSuffix: string;
  slotsPickDay: string;
  bannerPickDay: string;
  bannerPickTime: string;
  bannerScheduled: string;
  whatsappAlt: string;
  successTitle: string;
  successBody: string;
  successAgain: string;
  errorRequired: string;
  errorSlotTaken: string;
  errorNetwork: string;
  interestLabel: string;
  intentBanner: string;
};

export type PortfolioContent = {
  nav: NavContent;
  hero: HeroContent;
  services: ServicesContent;
  process: ProcessContent;
  impact: ImpactContent;
  stack: StackContent;
  experience: ExperienceContent;
  globalReach: GlobalReachContent;
  projects: ProjectsContent;
  testimonials: TestimonialsContent;
  certifications: CertificationsContent;
  education: EducationContent;
  collaboration: CollaborationContent;
  contact: ContactContent;
  footer: FooterContent;
};
