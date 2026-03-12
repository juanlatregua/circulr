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
