import type { PortfolioContent } from './types';

export const es: PortfolioContent = {
  nav: {
    name: 'Luis De La Torre',
    role: 'Senior Full-Stack & Mobile',
    links: [
      { label: 'Servicios', anchor: 'services' },
      { label: 'Experiencia', anchor: 'experience' },
      { label: 'Proyectos', anchor: 'projects' },
    ],
    languageToggleLabel: 'ES / en',
    cta: { label: 'Trabajemos', anchor: 'contact' },
  },
  hero: {
    availability: 'Disponible para proyectos freelance',
    titleLead: 'Construyo productos digitales que generan',
    titleAccent: 'impacto real.',
    subtitle:
      'Senior Full-Stack & Mobile Developer con +7 años diseñando apps móviles, plataformas web escalables, experiencias de Realidad Aumentada y sistemas distribuidos. De la arquitectura al despliegue en App Store y Google Play.',
    primaryCta: { label: 'Hablemos de tu proyecto', anchor: 'contact' },
    secondaryCta: { label: 'Ver proyectos', anchor: 'projects' },
    stats: [
      { value: '7+', label: 'años de experiencia' },
      { value: '15+', label: 'microservicios en producción' },
      { value: '99.9%', label: 'uptime sostenido' },
    ],
  },
  services: {
    kicker: 'servicios',
    heading: 'Cómo puedo ayudarte',
    items: [
      { index: '01', tag: 'WEB', title: 'Desarrollo Web', description: 'Aplicaciones React y Next.js de alto rendimiento, dashboards en tiempo real y SPAs escalables con UX pulida.' },
      { index: '02', tag: 'MOBILE', title: 'Apps Móviles', description: 'iOS y Android nativo (Swift/Kotlin) y multiplataforma con Flutter, KMP y React Native, publicadas en las stores.' },
      { index: '03', tag: 'AR/3D', title: 'Realidad Aumentada & Unity', description: 'Experiencias AR nativas (ARKit/ARCore) y 3D/VR con Unity que digitalizan productos y triplican el engagement.' },
      { index: '04', tag: 'BACKEND', title: 'Backend & Microservicios', description: 'Arquitecturas distribuidas, DDD, event-driven y APIs robustas con NestJS, FastAPI, Spring Boot y Go.' },
      { index: '05', tag: 'CLOUD', title: 'Cloud & DevOps', description: 'Infraestructura en AWS y Azure con Terraform (IaC), CI/CD, Docker y Kubernetes para despliegues confiables.' },
      { index: '06', tag: 'AI/ML', title: 'Integración de IA/ML', description: 'Pipelines de datos, análisis predictivo y modelos de machine learning integrados directamente en tu producto.' },
      { index: '07', tag: 'LEAD', title: 'Consultoría & Tech Lead', description: 'Definición de arquitectura, estándares de ingeniería y liderazgo técnico para llevar tu producto a producción.' },
    ],
  },
  impact: {
    kicker: 'impacto',
    heading: 'Resultados medibles',
    items: [
      { value: '3×', label: 'más engagement con experiencias AR' },
      { value: '85%', label: 'precisión en detección de emociones (ML)' },
      { value: '40%', label: 'menos tiempo de despliegue' },
      { value: '99.9%', label: 'uptime en producción' },
      { value: '6h→15m', label: 'build de iOS optimizado con CI/CD' },
      { value: '1000+', label: 'usuarios concurrentes escalados' },
      { value: '+20%', label: 'ingresos empresariales generados' },
      { value: '−45%', label: 'response time tras optimización' },
    ],
  },
  stack: {
    kicker: 'stack',
    heading: 'Tecnologías que domino',
    groups: [
      { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Material UI', 'Angular'] },
      { category: 'Mobile', items: ['Swift', 'Kotlin', 'Flutter', 'KMP', 'React Native'] },
      { category: 'AR / 3D', items: ['Unity', 'ARKit', 'ARCore', 'VR'] },
      { category: 'Backend', items: ['NestJS', 'FastAPI', 'Django', 'Spring Boot', 'Go', 'Node.js'] },
    ],
  },
  experience: {
    kicker: 'trayectoria',
    heading: 'Experiencia',
    items: [
      { period: '06/2025 — 06/2026', location: 'Ecuador', current: true, currentLabel: 'ACTUAL', role: 'Senior Full-Stack Developer', company: 'TechDelivery', description: 'Tech Lead provisional en apps React Native + microservicios en Go (IoT Tuya). Estructuré infraestructura AWS con Terraform y rediseñé los pipelines de despliegue móvil (APK / TestFlight).' },
      { period: '03/2025 — 04/2026', location: 'Quito', role: 'Software Development Engineer', company: 'Netby IT Consulting', description: 'App bancaria (Produbanco) en Kotlin Multiplatform con OTP y biometría facial. Reduje el build de iOS de ~6 horas a 15 minutos con CI/CD en Azure e integré SDKs nativos de terceros.' },
      { period: '09/2022 — 03/2025', location: 'Chile', role: 'Software Development Engineer', company: 'Acid Labs', description: 'Diseñé 15+ microservicios para e-commerce enterprise. Escalé a 1000+ usuarios concurrentes, reduje la latencia 35% y elevé el uptime a 99.9% con CI/CD e IaC en AWS.' },
      { period: '07/2024 — 05/2025', location: 'Quito', role: 'Senior Full-Stack Developer', company: 'Smartisp · Freelance', description: 'Dashboards React en tiempo real para telecom (OLT/ONU) monitoreando 100+ dispositivos con refresco cada 5s vía protocolos industriales (SNMP).' },
      { period: '11/2021 — 07/2022', location: 'Quito', role: 'Senior Full-Stack Developer', company: 'Mushroomsoft', description: 'Plataforma de salud digital con conectores HL7/FHIR sobre AWS. Reduje el response time 45% y elevé la satisfacción de usuarios 20%.' },
      { period: '11/2020 — 12/2021', location: 'Colombia', role: 'Senior Full-Stack Developer', company: 'Sinergia Red Internacional', description: 'Apps React Native multiplataforma y arquitectura backend escalable. Entregué 4+ proyectos clave ~15% antes del deadline con metodología ágil.' },
      { period: '09/2019 — 03/2021', location: 'México', role: 'Full-Stack Developer', company: 'EXCITED, Inc', description: 'Plataforma social con ML (IBM Watson, 85% accuracy en sentiment analysis), messaging en tiempo real y arquitectura event-driven sobre AWS.' },
      { period: '04/2019 — 08/2019', location: 'Ecuador', role: 'Senior Full-Stack Developer', company: 'Vinary VR/AR', description: 'Experiencias AR/VR nativas con Unity que reemplazaron material físico, elevaron el engagement 3× y generaron +20% de ingresos empresariales.' },
    ],
  },
  projects: {
    kicker: 'destacados',
    heading: 'Proyectos',
    items: [
      { category: 'FINTECH', title: 'Banca móvil KMP', description: 'App bancaria multiplataforma con OTP, biometría facial (FacePhi) y cumplimiento de políticas de las stores, con CI/CD en Azure.', tech: ['Kotlin Multiplatform', 'iOS', 'Android', 'Azure'] },
      { category: 'IoT', title: 'Audax · Tuya IoT', description: 'Integración de dispositivos Tuya en una app React Native con un microservicio en Go y pipelines de despliegue móvil optimizados.', tech: ['React Native', 'Go', 'IoT', 'CI/CD'] },
      { category: 'TELECOM', title: 'Smartisp OLT', description: 'Sistema de monitoreo de fibra óptica en tiempo real con dashboards en vivo, control remoto de equipos y telemetría de baja latencia.', tech: ['React', 'SNMP', 'Microservicios'] },
      { category: 'E-COMMERCE', title: 'Plataforma Enterprise', description: '15+ microservicios escalables en AWS con integraciones de pagos y partners, soportando 1000+ usuarios concurrentes.', tech: ['AWS', 'Terraform', 'Kubernetes', 'Node.js'] },
      { category: 'AR/3D', title: 'AR Commerce', description: 'Experiencias de Realidad Aumentada con Unity que digitalizaron catálogos comerciales y triplicaron el engagement de clientes.', tech: ['Unity', 'ARKit', 'ARCore'] },
    ],
  },
  certifications: {
    kicker: 'formación continua',
    heading: 'Certificaciones',
    items: [
      { name: 'Máster en Arquitectura de Microservicios con Docker', issuer: 'Lite Thinking' },
      { name: 'DevOps con AWS', issuer: 'Smart Data' },
      { name: 'NestJS: Persistencia con MongoDB y TypeORM', issuer: 'Udemy' },
    ],
  },
  contact: {
    kicker: 'contacto',
    heading: 'Trabajemos juntos',
    blurb: 'Cuéntame sobre tu proyecto y construyamos algo con impacto real.',
    email: 'luis.atorred24@gmail.com',
    cta: 'Enviar un correo',
    socials: [
      { label: 'GitHub', url: 'https://github.com/' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    ],
  },
};
