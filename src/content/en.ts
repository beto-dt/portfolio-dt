import type { PortfolioContent } from './types';

export const en: PortfolioContent = {
  nav: {
    name: 'Luis De La Torre',
    role: 'Senior Full-Stack & Mobile',
    links: [
      { label: 'Services', anchor: 'services' },
      { label: 'Experience', anchor: 'experience' },
      { label: 'Projects', anchor: 'projects' },
    ],
    languageToggleLabel: 'es / EN',
    cta: { label: "Let's work", anchor: 'contact' },
  },
  hero: {
    availability: 'Available for freelance projects',
    titleLead: 'I build digital products that drive',
    titleAccent: 'real impact.',
    subtitle:
      'Senior Full-Stack & Mobile Developer with 7+ years building mobile apps, scalable web platforms, Augmented Reality experiences and distributed systems. From architecture to App Store and Google Play release.',
    primaryCta: { label: "Let's talk about your project", anchor: 'contact' },
    secondaryCta: { label: 'View projects', anchor: 'projects' },
    stats: [
      { value: '7+', label: 'years of experience' },
      { value: '15+', label: 'microservices in production' },
      { value: '99.9%', label: 'sustained uptime' },
    ],
  },
  services: {
    kicker: 'services',
    heading: 'How I can help you',
    items: [
      { index: '01', tag: 'WEB', title: 'Web Development', description: 'High-performance React and Next.js apps, real-time dashboards and scalable SPAs with polished UX.' },
      { index: '02', tag: 'MOBILE', title: 'Mobile Apps', description: 'Native iOS and Android (Swift/Kotlin) and cross-platform with Flutter, KMP and React Native, shipped to the stores.' },
      { index: '03', tag: 'AR/3D', title: 'Augmented Reality & Unity', description: 'Native AR experiences (ARKit/ARCore) and 3D/VR with Unity that digitize products and triple engagement.' },
      { index: '04', tag: 'BACKEND', title: 'Backend & Microservices', description: 'Distributed architectures, DDD, event-driven systems and robust APIs with NestJS, FastAPI, Spring Boot and Go.' },
      { index: '05', tag: 'CLOUD', title: 'Cloud & DevOps', description: 'AWS and Azure infrastructure with Terraform (IaC), CI/CD, Docker and Kubernetes for reliable deployments.' },
      { index: '06', tag: 'AI/ML', title: 'AI/ML Integration', description: 'Data pipelines, predictive analytics and machine learning models integrated directly into your product.' },
      { index: '07', tag: 'LEAD', title: 'Consulting & Tech Lead', description: 'Architecture definition, engineering standards and technical leadership to take your product to production.' },
    ],
  },
  impact: {
    kicker: 'impact',
    heading: 'Measurable results',
    items: [
      { value: '3×', label: 'more engagement with AR experiences' },
      { value: '85%', label: 'accuracy in emotion detection (ML)' },
      { value: '40%', label: 'less deployment time' },
      { value: '99.9%', label: 'uptime in production' },
      { value: '6h→15m', label: 'iOS build optimized with CI/CD' },
      { value: '1000+', label: 'concurrent users scaled' },
      { value: '+20%', label: 'enterprise revenue generated' },
      { value: '−45%', label: 'response time after optimization' },
    ],
  },
  stack: {
    kicker: 'stack',
    heading: 'Technologies I master',
    groups: [
      { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Material UI', 'Angular'] },
      { category: 'Mobile', items: ['Swift', 'Kotlin', 'Flutter', 'KMP', 'React Native'] },
      { category: 'AR / 3D', items: ['Unity', 'ARKit', 'ARCore', 'VR'] },
      { category: 'Backend', items: ['NestJS', 'FastAPI', 'Django', 'Spring Boot', 'Go', 'Node.js'] },
      { category: 'Cloud & DevOps', items: ['AWS', 'Azure', 'Terraform', 'Docker', 'Kubernetes', 'CI/CD'] },
      { category: 'Data & AI', items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Python', 'ML'] },
      { category: 'Architecture', items: ['Microservices', 'DDD', 'Event Sourcing', 'API Gateway'] },
    ],
  },
  experience: {
    kicker: 'career',
    heading: 'Experience',
    items: [
      { period: '06/2025 — 06/2026', location: 'Ecuador', current: true, currentLabel: 'CURRENT', role: 'Senior Full-Stack Developer', company: 'TechDelivery', description: 'Interim Tech Lead on React Native apps + Go microservices (Tuya IoT). Structured AWS infrastructure with Terraform and redesigned mobile deployment pipelines (APK / TestFlight).' },
      { period: '03/2025 — 04/2026', location: 'Quito', role: 'Software Development Engineer', company: 'Netby IT Consulting', description: 'Banking app (Produbanco) in Kotlin Multiplatform with OTP and facial biometrics. Cut the iOS build from ~6 hours to 15 minutes with CI/CD on Azure and integrated third-party native SDKs.' },
      { period: '09/2022 — 03/2025', location: 'Chile', role: 'Software Development Engineer', company: 'Acid Labs', description: 'Designed 15+ microservices for enterprise e-commerce. Scaled to 1000+ concurrent users, cut latency 35% and raised uptime to 99.9% with CI/CD and IaC on AWS.' },
      { period: '07/2024 — 05/2025', location: 'Quito', role: 'Senior Full-Stack Developer', company: 'Smartisp · Freelance', description: 'Real-time React dashboards for telecom (OLT/ONU) monitoring 100+ devices refreshing every 5s over industrial protocols (SNMP).' },
      { period: '11/2021 — 07/2022', location: 'Quito', role: 'Senior Full-Stack Developer', company: 'Mushroomsoft', description: 'Digital health platform with HL7/FHIR connectors on AWS. Cut response time 45% and raised user satisfaction 20%.' },
      { period: '11/2020 — 12/2021', location: 'Colombia', role: 'Senior Full-Stack Developer', company: 'Sinergia Red Internacional', description: 'Cross-platform React Native apps and scalable backend architecture. Delivered 4+ key projects ~15% ahead of deadline with agile methodology.' },
      { period: '09/2019 — 03/2021', location: 'Mexico', role: 'Full-Stack Developer', company: 'EXCITED, Inc', description: 'Social platform with ML (IBM Watson, 85% accuracy in sentiment analysis), real-time messaging and event-driven architecture on AWS.' },
      { period: '04/2019 — 08/2019', location: 'Ecuador', role: 'Senior Full-Stack Developer', company: 'Vinary VR/AR', description: 'Native AR/VR experiences with Unity that replaced physical material, raised engagement 3× and generated +20% enterprise revenue.' },
    ],
  },
  projects: {
    kicker: 'featured',
    heading: 'Projects',
    items: [
      { category: 'FINTECH', title: 'KMP Mobile Banking', description: 'Cross-platform banking app with OTP, facial biometrics (FacePhi) and store-policy compliance, with CI/CD on Azure.', tech: ['Kotlin Multiplatform', 'iOS', 'Android', 'Azure'] },
      { category: 'IoT', title: 'Audax · Tuya IoT', description: 'Tuya device integration in a React Native app with a Go microservice and optimized mobile deployment pipelines.', tech: ['React Native', 'Go', 'IoT', 'CI/CD'] },
      { category: 'TELECOM', title: 'Smartisp OLT', description: 'Real-time fiber-optic monitoring system with live dashboards, remote equipment control and low-latency telemetry.', tech: ['React', 'SNMP', 'Microservices'] },
      { category: 'E-COMMERCE', title: 'Enterprise Platform', description: '15+ scalable microservices on AWS with payment and partner integrations, supporting 1000+ concurrent users.', tech: ['AWS', 'Terraform', 'Kubernetes', 'Node.js'] },
      { category: 'AR/3D', title: 'AR Commerce', description: 'Augmented Reality experiences with Unity that digitized commercial catalogs and tripled customer engagement.', tech: ['Unity', 'ARKit', 'ARCore'] },
    ],
  },
  certifications: {
    kicker: 'continuous learning',
    heading: 'Certifications',
    items: [
      { name: "Master's in Microservices Architecture with Docker", issuer: 'Lite Thinking' },
      { name: 'DevOps with AWS', issuer: 'Smart Data' },
      { name: 'NestJS: Persistence with MongoDB and TypeORM', issuer: 'Udemy' },
    ],
  },
  contact: {
    kicker: 'contact',
    heading: "Let's work together",
    blurb: "Tell me about your project and let's build something with real impact.",
    email: 'luis.atorred24@gmail.com',
    cta: 'Send an email',
    socials: [
      { label: 'GitHub', url: 'https://github.com/' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    ],
  },
};
