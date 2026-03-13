export const CIRCULR_PRODUCTS = {
  csrd_response: {
    name: "Respuesta CSRD",
    description: "Análisis de gaps y plan de acción para cumplimiento CSRD/ESRS",
    price_eur: 250000, // 2500 EUR in cents
    features: [
      "Análisis de gaps ESRS completo",
      "Plan de acción priorizado",
      "Plantillas de reporte",
      "Sesión de seguimiento",
    ],
  },
  ce_diagnosis: {
    name: "Diagnóstico CE",
    description: "Evaluación completa de madurez en economía circular",
    price_eur: 150000, // 1500 EUR in cents
    features: [
      "Análisis de flujos de materiales",
      "Evaluación de madurez CE",
      "Identificación de oportunidades",
      "Hoja de ruta circular",
    ],
  },
  implementation: {
    name: "Implementación",
    description: "Acompañamiento en la implementación de estrategias circulares",
    price_eur: 500000, // 5000 EUR in cents
    features: [
      "Plan de implementación detallado",
      "Seguimiento mensual",
      "KPIs y métricas",
      "Soporte continuo 3 meses",
    ],
  },
  training: {
    name: "Formación",
    description: "Capacitación en economía circular para equipos",
    price_eur: 100000, // 1000 EUR in cents
    features: [
      "Workshop personalizado",
      "Material didáctico",
      "Certificado de asistencia",
      "Acceso a recursos online",
    ],
  },
} as const;

export type ProductKey = keyof typeof CIRCULR_PRODUCTS;

export const TOOL_PRODUCTS = {
  "huella-carbono": {
    name: "Calculadora Huella de Carbono",
    description: "Calcula la huella de carbono de tu empresa al instante",
    price_cents: 0,
    timeline: "Instantáneo",
    slug: "huella-carbono",
    free: true,
  },
  "test-csrd": {
    name: "Test Cumplimiento CSRD",
    description: "Descubre tu nivel de riesgo CSRD y Ley 7/2022",
    price_cents: 4900,
    timeline: "Instantáneo",
    slug: "test-csrd",
    free: false,
  },
  "politica-medioambiental": {
    name: "Generador Política Medioambiental",
    description: "Política medioambiental profesional lista para firmar",
    price_cents: 9900,
    timeline: "Instantáneo",
    slug: "politica-medioambiental",
    free: false,
  },
  "memoria-sostenibilidad": {
    name: "Memoria de Sostenibilidad Básica",
    description: "Memoria GRI Lite de 15-20 páginas con tus datos reales",
    price_cents: 29900,
    timeline: "Instantáneo",
    slug: "memoria-sostenibilidad",
    free: false,
  },
  "huella-verificada": {
    name: "Informe Huella de Carbono Verificado",
    description: "Informe ISO 14064 firmado por consultor, válido para MITECO",
    price_cents: 29900,
    timeline: "48h revisión",
    slug: "huella-verificada",
    free: false,
  },
} as const;

export type ToolSlug = keyof typeof TOOL_PRODUCTS;
