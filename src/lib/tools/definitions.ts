export interface ToolField {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "textarea" | "checkboxes" | "boolean" | "file";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  step?: number;
}

export interface ToolStep {
  title: string;
  fields: ToolField[];
}

export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  priceLabel: string;
  timeline: string;
  free: boolean;
  icon: string;
  upsell?: { text: string; href: string; price: string };
  steps: ToolStep[];
}

const sectorOptions = [
  { value: "industria", label: "Industria" },
  { value: "hosteleria", label: "Hostelería" },
  { value: "comercio", label: "Comercio" },
  { value: "servicios", label: "Servicios" },
  { value: "construccion", label: "Construcción" },
  { value: "transporte", label: "Transporte" },
  { value: "alimentacion", label: "Alimentación" },
  { value: "otro", label: "Otro" },
];

const employeeOptions = [
  { value: "1-5", label: "1-5" },
  { value: "6-20", label: "6-20" },
  { value: "21-50", label: "21-50" },
  { value: "51-200", label: "51-200" },
  { value: "200+", label: "+200" },
];

export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  "huella-carbono": {
    slug: "huella-carbono",
    name: "Calculadora Huella de Carbono",
    description: "Calcula la huella de carbono de tu empresa al instante",
    longDescription:
      "Obtén una estimación fiable de las emisiones de CO₂ de tu empresa usando factores IPCC/MITECO actualizados. Incluye desglose por alcance, comparativa sectorial y recomendaciones.",
    price: 0,
    priceLabel: "Gratis",
    timeline: "Instantáneo",
    free: true,
    icon: "Leaf",
    upsell: {
      text: "¿Necesitas un informe verificado para MITECO o tu cliente?",
      href: "/tools/huella-verificada",
      price: "299€",
    },
    steps: [
      {
        title: "Datos de consumo",
        fields: [
          { name: "sector", label: "Sector de actividad", type: "select", required: true, options: sectorOptions },
          { name: "employees", label: "Número de empleados", type: "select", required: true, options: employeeOptions },
          { name: "energy_kwh", label: "Consumo eléctrico anual (kWh)", type: "number", placeholder: "50000", required: true, min: 0 },
          { name: "gas_kwh", label: "Consumo de gas anual (kWh)", type: "number", placeholder: "10000", min: 0 },
          { name: "transport_km", label: "Km viajes de empresa anuales", type: "number", placeholder: "20000", required: true, min: 0 },
          { name: "waste_tons", label: "Toneladas de residuos anuales", type: "number", placeholder: "5", min: 0 },
        ],
      },
      {
        title: "Tus datos",
        fields: [
          { name: "name", label: "Nombre", type: "text", required: true, placeholder: "María García" },
          { name: "company", label: "Empresa", type: "text", required: true, placeholder: "Empresa S.L." },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "tu@empresa.com" },
        ],
      },
    ],
  },

  "test-csrd": {
    slug: "test-csrd",
    name: "Test Cumplimiento CSRD",
    description: "Descubre tu nivel de riesgo CSRD y Ley 7/2022",
    longDescription:
      "15 preguntas clave para evaluar tu exposición regulatoria. Obtén un semáforo de riesgo, obligaciones urgentes y hoja de ruta de cumplimiento.",
    price: 49,
    priceLabel: "49€",
    timeline: "Instantáneo",
    free: false,
    icon: "ShieldCheck",
    upsell: {
      text: "¿Necesitas un diagnóstico completo de economía circular?",
      href: "/auth/register",
      price: "1.500€",
    },
    steps: [
      {
        title: "Tu empresa",
        fields: [
          { name: "name", label: "Nombre", type: "text", required: true, placeholder: "María García" },
          { name: "company", label: "Empresa", type: "text", required: true, placeholder: "Empresa S.L." },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "tu@empresa.com" },
        ],
      },
      {
        title: "Preguntas (1-8)",
        fields: [
          { name: "q1", label: "¿Tienes más de 250 empleados?", type: "boolean" },
          { name: "q2", label: "¿Facturación superior a 40M€?", type: "boolean" },
          { name: "q3", label: "¿Eres proveedor de empresa con +500 empleados?", type: "boolean" },
          { name: "q4", label: "¿Has recibido algún cuestionario de sostenibilidad de un cliente?", type: "boolean" },
          { name: "q5", label: "¿Tienes política medioambiental documentada?", type: "boolean" },
          { name: "q6", label: "¿Mides tu huella de carbono?", type: "boolean" },
          { name: "q7", label: "¿Gestionas tus residuos con gestor autorizado?", type: "boolean" },
          { name: "q8", label: "¿Tienes plan de reducción de emisiones?", type: "boolean" },
        ],
      },
      {
        title: "Preguntas (9-15)",
        fields: [
          { name: "q9", label: "¿Tu empresa consume más de 500.000 kWh/año?", type: "boolean" },
          { name: "q10", label: "¿Tienes certificación ISO 14001 o similar?", type: "boolean" },
          { name: "q11", label: "¿Eres empresa industrial con más de 10 empleados?", type: "boolean" },
          { name: "q12", label: "¿Accedes a financiación bancaria o fondos europeos?", type: "boolean" },
          { name: "q13", label: "¿Participas en licitaciones públicas?", type: "boolean" },
          { name: "q14", label: "¿Exportas a la UE o tienes clientes en otros países europeos?", type: "boolean" },
          { name: "q15", label: "¿Tienes previsto crecer o hacer cambios societarios en los próximos 2 años?", type: "boolean" },
        ],
      },
    ],
  },

  "politica-medioambiental": {
    slug: "politica-medioambiental",
    name: "Generador Política Medioambiental",
    description: "Política medioambiental profesional lista para firmar",
    longDescription:
      "Genera una política medioambiental que cumple con ISO 14001 y la normativa española. Lista para firmar y publicar en tu empresa.",
    price: 99,
    priceLabel: "99€",
    timeline: "Instantáneo",
    free: false,
    icon: "FileText",
    upsell: {
      text: "¿Necesitas un diagnóstico completo de economía circular?",
      href: "/auth/register",
      price: "1.500€",
    },
    steps: [
      {
        title: "Datos de empresa",
        fields: [
          { name: "company_name", label: "Razón social", type: "text", required: true, placeholder: "Empresa S.L." },
          { name: "cif", label: "CIF", type: "text", required: true, placeholder: "B12345678" },
          { name: "address", label: "Dirección", type: "text", required: true, placeholder: "Calle Example, 1, Málaga" },
          { name: "sector", label: "Sector", type: "select", required: true, options: sectorOptions },
          { name: "employees", label: "Empleados", type: "select", required: true, options: employeeOptions },
        ],
      },
      {
        title: "Actividad y certificaciones",
        fields: [
          { name: "main_activity", label: "Describe brevemente la actividad de tu empresa", type: "textarea", required: true, placeholder: "Fabricamos componentes de acero para automoción..." },
          {
            name: "certifications",
            label: "Certificaciones actuales",
            type: "checkboxes",
            options: [
              { value: "iso14001", label: "ISO 14001" },
              { value: "iso9001", label: "ISO 9001" },
              { value: "emas", label: "EMAS" },
              { value: "ninguna", label: "Ninguna" },
            ],
          },
          {
            name: "commitments",
            label: "Compromisos a incluir",
            type: "checkboxes",
            options: [
              { value: "reducir_emisiones", label: "Reducir emisiones" },
              { value: "gestion_residuos", label: "Gestión de residuos" },
              { value: "eficiencia_energetica", label: "Eficiencia energética" },
              { value: "movilidad_sostenible", label: "Movilidad sostenible" },
              { value: "formacion_empleados", label: "Formación empleados" },
            ],
          },
        ],
      },
      {
        title: "Datos de contacto",
        fields: [
          { name: "legal_rep_name", label: "Nombre del firmante", type: "text", required: true, placeholder: "María García López" },
          { name: "name", label: "Tu nombre", type: "text", required: true, placeholder: "María García" },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "tu@empresa.com" },
        ],
      },
    ],
  },

  "memoria-sostenibilidad": {
    slug: "memoria-sostenibilidad",
    name: "Memoria de Sostenibilidad Básica",
    description: "Memoria GRI Lite de 15-20 páginas con tus datos reales",
    longDescription:
      "Genera una memoria de sostenibilidad completa siguiendo estructura GRI. Incluye medioambiente, social, gobernanza y objetivos futuros.",
    price: 299,
    priceLabel: "299€",
    timeline: "Instantáneo",
    free: false,
    icon: "BookOpen",
    upsell: {
      text: "¿Necesitas acompañamiento continuo en sostenibilidad?",
      href: "/auth/register",
      price: "1.500€/mes",
    },
    steps: [
      {
        title: "Datos de empresa",
        fields: [
          { name: "company_name", label: "Razón social", type: "text", required: true, placeholder: "Empresa S.L." },
          { name: "cif", label: "CIF", type: "text", required: true, placeholder: "B12345678" },
          { name: "address", label: "Dirección", type: "text", required: true, placeholder: "Calle Example, 1, Málaga" },
          { name: "sector", label: "Sector", type: "select", required: true, options: sectorOptions },
          { name: "employees", label: "Empleados", type: "select", required: true, options: employeeOptions },
          { name: "year", label: "Año de reporte", type: "number", required: true, placeholder: "2025", min: 2020 },
          {
            name: "revenue_range",
            label: "Facturación anual",
            type: "select",
            required: true,
            options: [
              { value: "<1M", label: "Menos de 1M€" },
              { value: "1-5M", label: "1-5M€" },
              { value: "5-20M", label: "5-20M€" },
              { value: ">20M", label: "Más de 20M€" },
            ],
          },
        ],
      },
      {
        title: "Datos medioambientales",
        fields: [
          { name: "energy_kwh", label: "Consumo eléctrico anual (kWh)", type: "number", required: true, placeholder: "50000", min: 0 },
          { name: "water_m3", label: "Consumo de agua anual (m³)", type: "number", placeholder: "500", min: 0 },
          { name: "waste_tons", label: "Residuos generados (toneladas)", type: "number", placeholder: "5", min: 0 },
          { name: "main_activity", label: "Actividad principal", type: "textarea", required: true, placeholder: "Describe la actividad principal de tu empresa..." },
          {
            name: "certifications",
            label: "Certificaciones actuales",
            type: "checkboxes",
            options: [
              { value: "iso14001", label: "ISO 14001" },
              { value: "iso9001", label: "ISO 9001" },
              { value: "emas", label: "EMAS" },
              { value: "ninguna", label: "Ninguna" },
            ],
          },
        ],
      },
      {
        title: "Datos sociales",
        fields: [
          { name: "employees_total", label: "Total empleados", type: "number", required: true, placeholder: "50", min: 1 },
          { name: "employees_female", label: "Empleadas (mujeres)", type: "number", placeholder: "25", min: 0 },
          { name: "employees_male", label: "Empleados (hombres)", type: "number", placeholder: "25", min: 0 },
          { name: "training_hours", label: "Horas formación/empleado/año", type: "number", placeholder: "20", min: 0 },
          { name: "accidents", label: "Accidentes laborales (año)", type: "number", placeholder: "0", min: 0 },
          { name: "social_actions", label: "Iniciativas sociales/comunitarias", type: "textarea", placeholder: "Describe acciones sociales, patrocinios, voluntariado..." },
          { name: "suppliers_local_percent", label: "% proveedores locales", type: "number", placeholder: "60", min: 0, step: 1 },
        ],
      },
      {
        title: "Datos de contacto",
        fields: [
          { name: "name", label: "Tu nombre", type: "text", required: true, placeholder: "María García" },
          { name: "company", label: "Empresa", type: "text", required: true, placeholder: "Empresa S.L." },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "tu@empresa.com" },
        ],
      },
    ],
  },

  "huella-verificada": {
    slug: "huella-verificada",
    name: "Informe Huella de Carbono Verificado",
    description: "Informe ISO 14064 firmado por consultor, válido para MITECO",
    longDescription:
      "Informe profesional de huella de carbono alineado con ISO 14064, verificado y firmado por nuestra consultora. Válido para registro MITECO, licitaciones y clientes.",
    price: 299,
    priceLabel: "299€",
    timeline: "48h tras pago",
    free: false,
    icon: "Award",
    upsell: {
      text: "¿Necesitas un diagnóstico completo de economía circular?",
      href: "/auth/register",
      price: "1.500€",
    },
    steps: [
      {
        title: "Datos de consumo",
        fields: [
          { name: "sector", label: "Sector de actividad", type: "select", required: true, options: sectorOptions },
          { name: "employees", label: "Número de empleados", type: "select", required: true, options: employeeOptions },
          { name: "energy_kwh", label: "Consumo eléctrico anual (kWh)", type: "number", placeholder: "50000", required: true, min: 0 },
          { name: "gas_kwh", label: "Consumo de gas anual (kWh)", type: "number", placeholder: "10000", min: 0 },
          { name: "transport_km", label: "Km viajes de empresa anuales", type: "number", placeholder: "20000", required: true, min: 0 },
          { name: "waste_tons", label: "Toneladas de residuos anuales", type: "number", placeholder: "5", min: 0 },
        ],
      },
      {
        title: "Documentación adicional",
        fields: [
          { name: "additional_sources", label: "Otras fuentes de emisión", type: "textarea", placeholder: "Describe cualquier otra fuente de emisión (maquinaria, refrigerantes, etc.)" },
          {
            name: "verification_use",
            label: "¿Para qué necesitas el informe?",
            type: "select",
            required: true,
            options: [
              { value: "miteco", label: "Registro MITECO" },
              { value: "cliente", label: "Solicitud de cliente" },
              { value: "banco", label: "Financiación bancaria" },
              { value: "licitacion", label: "Licitación pública" },
              { value: "interno", label: "Uso interno" },
            ],
          },
        ],
      },
      {
        title: "Tus datos",
        fields: [
          { name: "company_name", label: "Razón social", type: "text", required: true, placeholder: "Empresa S.L." },
          { name: "cif", label: "CIF", type: "text", required: true, placeholder: "B12345678" },
          { name: "name", label: "Tu nombre", type: "text", required: true, placeholder: "María García" },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "tu@empresa.com" },
        ],
      },
    ],
  },
};

export const TOOL_SLUGS = Object.keys(TOOL_DEFINITIONS) as (keyof typeof TOOL_DEFINITIONS)[];
