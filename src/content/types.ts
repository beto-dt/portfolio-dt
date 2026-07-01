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

export type ContactContent = {
  kicker: string;
  heading: string;
  blurb: string;
  email: string;
  cta: string;
  socials: { label: string; url: string }[];
};

export type PortfolioContent = {
  nav: NavContent;
  hero: HeroContent;
  services: ServicesContent;
  impact: ImpactContent;
  stack: StackContent;
  experience: ExperienceContent;
  projects: ProjectsContent;
  certifications: CertificationsContent;
  contact: ContactContent;
};
