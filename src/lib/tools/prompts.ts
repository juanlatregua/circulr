export function getTestCsrdPrompt(answers: Record<string, boolean>): string {
  const formatted = Object.entries(answers)
    .filter(([k]) => k.startsWith("q"))
    .map(([k, v]) => `${k}: ${v ? "SÍ" : "NO"}`)
    .join("\n");

  return `Eres un experto en cumplimiento ESG español. Analiza estas respuestas de una empresa y genera:
1) Semáforo de riesgo (ROJO/AMARILLO/VERDE) con justificación
2) Las 3 obligaciones legales más urgentes que debe atender
3) Hoja de ruta de 6 pasos priorizada
4) Estimación de coste de cumplimiento

Preguntas y respuestas:
q1: ¿Tienes más de 250 empleados?
q2: ¿Facturación superior a 40M€?
q3: ¿Eres proveedor de empresa con +500 empleados?
q4: ¿Has recibido algún cuestionario de sostenibilidad de un cliente?
q5: ¿Tienes política medioambiental documentada?
q6: ¿Mides tu huella de carbono?
q7: ¿Gestionas tus residuos con gestor autorizado?
q8: ¿Tienes plan de reducción de emisiones?
q9: ¿Tu empresa consume más de 500.000 kWh/año?
q10: ¿Tienes certificación ISO 14001 o similar?
q11: ¿Eres empresa industrial con más de 10 empleados?
q12: ¿Accedes a financiación bancaria o fondos europeos?
q13: ¿Participas en licitaciones públicas?
q14: ¿Exportas a la UE o tienes clientes en otros países europeos?
q15: ¿Tienes previsto crecer o hacer cambios societarios en los próximos 2 años?

Respuestas de la empresa:
${formatted}

Responde en español, tono profesional pero claro para no-expertos.
Formato: JSON válido con campos: risk_level (ROJO|AMARILLO|VERDE), risk_summary (string), obligations (array de 3 objetos con title y description), roadmap (array de 6 objetos con step y description), cost_estimate (string), upsell_message (string sugiriendo diagnóstico completo de economía circular).
Solo devuelve el JSON, sin markdown ni texto adicional.`;
}

export function getPoliticaPrompt(data: Record<string, unknown>): string {
  return `Genera una Política Medioambiental profesional para empresa española que cumpla con los requisitos de ISO 14001 y la normativa española vigente.

Datos de la empresa:
- Razón social: ${data.company_name}
- CIF: ${data.cif}
- Dirección: ${data.address}
- Sector: ${data.sector}
- Empleados: ${data.employees}
- Actividad principal: ${data.main_activity}
- Certificaciones actuales: ${Array.isArray(data.certifications) ? (data.certifications as string[]).join(", ") : "Ninguna"}
- Compromisos seleccionados: ${Array.isArray(data.commitments) ? (data.commitments as string[]).join(", ") : "No especificados"}
- Firmante: ${data.legal_rep_name}

Debe incluir:
1. Declaración de compromiso de la dirección
2. Alcance y aplicabilidad
3. Objetivos medioambientales específicos
4. Principios rectores (prevención, cumplimiento legal, mejora continua)
5. Responsabilidades
6. Revisión y mejora continua
7. Fecha y firma

Tono formal. Extensión: 600-800 palabras. Lista para firmar y publicar.
Devuelve solo el texto del documento, sin markdown. Usa saltos de línea para separar secciones.`;
}

export function getMemoriaPrompt(data: Record<string, unknown>): string {
  return `Genera una Memoria de Sostenibilidad completa siguiendo estructura GRI Lite para una empresa española.

Datos de la empresa:
- Razón social: ${data.company_name}
- CIF: ${data.cif}
- Dirección: ${data.address}
- Sector: ${data.sector}
- Empleados: ${data.employees}
- Año de reporte: ${data.year}
- Facturación: ${data.revenue_range}
- Actividad principal: ${data.main_activity}
- Certificaciones: ${Array.isArray(data.certifications) ? (data.certifications as string[]).join(", ") : "Ninguna"}

Datos medioambientales:
- Consumo eléctrico: ${data.energy_kwh} kWh/año
- Consumo de agua: ${data.water_m3 || "No reportado"} m³/año
- Residuos generados: ${data.waste_tons || "No reportado"} toneladas/año

Datos sociales:
- Total empleados: ${data.employees_total}
- Mujeres: ${data.employees_female || "No reportado"}
- Hombres: ${data.employees_male || "No reportado"}
- Horas formación/empleado: ${data.training_hours || "No reportado"}
- Accidentes laborales: ${data.accidents || "No reportado"}
- Iniciativas sociales: ${data.social_actions || "No reportadas"}
- % proveedores locales: ${data.suppliers_local_percent || "No reportado"}%

Estructura obligatoria:
1. Carta del CEO / Presentación de la empresa
2. Perfil de la organización
3. Gobierno y ética
4. Medioambiente (energía, agua, residuos, emisiones)
5. Social (empleo, diversidad, formación, seguridad laboral)
6. Cadena de suministro
7. Objetivos y compromisos futuros
8. Índice GRI

Extensión: contenido suficiente para 15-20 páginas. Tono profesional. Usa datos reales proporcionados.
Devuelve solo el texto del documento con títulos de sección (usa ## para secciones y ### para subsecciones).`;
}

export function getHuellaVerificadaPrompt(data: Record<string, unknown>): string {
  return `Genera un Informe de Huella de Carbono alineado con ISO 14064-1 para una empresa española.

Datos de la empresa:
- Razón social: ${data.company_name}
- CIF: ${data.cif}
- Sector: ${data.sector}
- Empleados: ${data.employees}

Datos de emisiones:
- Consumo eléctrico: ${data.energy_kwh} kWh/año
- Consumo de gas: ${data.gas_kwh || 0} kWh/año
- Km viajes empresa: ${data.transport_km} km/año
- Residuos: ${data.waste_tons || 0} toneladas/año
- Otras fuentes: ${data.additional_sources || "No reportadas"}

Uso del informe: ${data.verification_use}

Factores de emisión (MITECO/IPCC 2024):
- Electricidad España: 0.181 kgCO2/kWh
- Gas natural: 0.202 kgCO2/kWh
- Transporte coche: 0.171 kgCO2/km
- Residuos vertedero: 0.58 tCO2/tonelada

Estructura del informe:
1. Resumen ejecutivo
2. Límites organizacionales y operacionales
3. Metodología y factores de emisión
4. Inventario de emisiones (Alcance 1, 2 y 3)
5. Análisis detallado por fuente
6. Comparativa sectorial
7. Plan de reducción de emisiones (objetivos a 1, 3 y 5 años)
8. Declaración de verificación

Calcula las emisiones usando los factores proporcionados. Incluye tablas con datos numéricos.
Tono técnico-profesional. Devuelve el texto con títulos (## para secciones, ### para subsecciones).`;
}
