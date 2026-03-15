export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { generateStream } from "@/lib/ai/generate";

const PRESENTATION_PROMPTS: Record<string, string> = {
  diagnostico: `Genera un outline profesional de 10-12 slides para una presentación de DIAGNÓSTICO INICIAL de sostenibilidad.
La presentación debe incluir:
- Slide 1: Portada con nombre de empresa y fecha
- Slide 2: Agenda/Índice
- Slide 3: Contexto regulatorio (CSRD, Ley 7/2022, taxonomía EU)
- Slide 4-5: Diagnóstico actual de la empresa (basado en los datos proporcionados)
- Slide 6: Análisis de materialidad (temas ESG relevantes para el sector)
- Slide 7: Huella de carbono estimada (Scope 1, 2 y 3)
- Slide 8: Benchmarking sectorial
- Slide 9: Riesgos y oportunidades identificados
- Slide 10: Hoja de ruta propuesta (corto, medio, largo plazo)
- Slide 11: Próximos pasos concretos
- Slide 12: Contacto y CTA`,

  propuesta: `Genera un outline profesional de 10-12 slides para una PROPUESTA DE SERVICIO de consultoría de sostenibilidad.
La presentación debe incluir:
- Slide 1: Portada con logo CIRCULR y nombre del cliente
- Slide 2: ¿Por qué ahora? (contexto regulatorio y de mercado)
- Slide 3: Entendemos tu negocio (resumen sector y retos específicos)
- Slide 4: Nuestra propuesta de valor
- Slide 5-6: Servicios propuestos (adaptados al sector y tamaño)
- Slide 7: Metodología y enfoque
- Slide 8: Cronograma de trabajo
- Slide 9: Equipo asignado (Isabelle Guitton, Miguel Fernández)
- Slide 10: Inversión y condiciones
- Slide 11: Casos de éxito / referencias
- Slide 12: Próximos pasos y contacto`,

  resultados_huella: `Genera un outline profesional de 10-12 slides para una presentación de RESULTADOS DE HUELLA DE CARBONO.
La presentación debe incluir:
- Slide 1: Portada con nombre de empresa y periodo de cálculo
- Slide 2: Resumen ejecutivo (total tCO₂e, comparativa sectorial)
- Slide 3: Metodología utilizada (GHG Protocol, factores MITECO)
- Slide 4: Scope 1 — Emisiones directas (detalle por fuente)
- Slide 5: Scope 2 — Electricidad (mix vs. renovable)
- Slide 6: Scope 3 — Cadena de valor (principales categorías)
- Slide 7: Distribución por fuente (gráfico)
- Slide 8: Benchmarking sectorial (posición vs. media)
- Slide 9: Evolución interanual (si hay datos previos)
- Slide 10: Plan de reducción — Quick wins
- Slide 11: Plan de reducción — Medio y largo plazo
- Slide 12: Registro MITECO y próximos pasos`,

  plan_csrd: `Genera un outline profesional de 10-12 slides para un PLAN DE PREPARACIÓN CSRD.
La presentación debe incluir:
- Slide 1: Portada con nombre de empresa
- Slide 2: ¿Qué es la CSRD y por qué importa?
- Slide 3: Calendario de obligaciones (cuándo aplica a esta empresa)
- Slide 4: Estándares ESRS aplicables
- Slide 5: Análisis de doble materialidad — Metodología
- Slide 6: Temas materiales identificados
- Slide 7: Gap analysis — Estado actual vs. requerimientos
- Slide 8: Datos y sistemas necesarios
- Slide 9: Hoja de ruta de implementación (3 fases)
- Slide 10: Recursos necesarios (equipo, presupuesto, herramientas)
- Slide 11: Cronograma detallado
- Slide 12: Próximos pasos y llamada a la acción`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, empresa, sector, tamano, datos_clave } = body as {
      tipo: string;
      empresa: string;
      sector: string;
      tamano: string;
      datos_clave?: string;
    };

    if (!tipo || !empresa || !sector) {
      return NextResponse.json(
        { error: "tipo, empresa and sector are required" },
        { status: 400 }
      );
    }

    const basePrompt = PRESENTATION_PROMPTS[tipo];
    if (!basePrompt) {
      return NextResponse.json(
        { error: "Invalid presentation type" },
        { status: 400 }
      );
    }

    const prompt = `${basePrompt}

DATOS DE LA EMPRESA:
- Empresa: ${empresa}
- Sector: ${sector}
- Tamaño: ${tamano || "No especificado"}
${datos_clave ? `- Datos adicionales: ${datos_clave}` : ""}

INSTRUCCIONES DE FORMATO:
- Para cada slide, escribe:
  ## Slide N: [Título]
  **Contenido clave:**
  - Punto 1
  - Punto 2
  - Punto 3
  **Notas del presentador:** [Una frase con lo que decir]
  **Visual sugerido:** [Tipo de gráfico, imagen o layout]

- Usa datos concretos del sector cuando sea posible
- Adapta el tono a una audiencia directiva
- Incluye cifras y porcentajes relevantes
- Escribe en español profesional`;

    const stream = await generateStream({
      prompt,
      maxTokens: 4096,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch {
          controller.enqueue(
            encoder.encode("Error al generar la presentación.")
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
