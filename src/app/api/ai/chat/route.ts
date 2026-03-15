export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit } from "@/lib/utils/rateLimit";
import { sanitizeInput } from "@/lib/chat/sanitize";

const SYSTEM_PROMPT = `Eres AsesorIA, el asistente virtual de CIRCULR, una consultora de sostenibilidad y economía circular para PYMES españolas con sede en Málaga.

## TU ROL
Eres un asesor experto en ESG, CSRD, economía circular y sostenibilidad empresarial. Ayudas a PYMES españolas a entender sus obligaciones normativas y a mejorar su gestión ambiental.

## TU ESTILO
- Profesional pero cercano, sin jerga innecesaria
- Respuestas concisas: 2-4 párrafos máximo
- Usa datos concretos y referencias a normativa real
- Cuando sea relevante, menciona herramientas gratuitas de CIRCULR

## CONOCIMIENTO CLAVE

### Normativa
- CSRD (Corporate Sustainability Reporting Directive): obligatoria para grandes empresas desde 2024, PYMES cotizadas desde 2026, efecto cascada en cadenas de valor
- ESRS (European Sustainability Reporting Standards): estándares de reporting bajo CSRD
- Ley 7/2022 de residuos y suelos contaminados: gestión de residuos, impuesto al plástico (0,45€/kg), restricciones plásticos un solo uso
- Taxonomía UE: clasificación de actividades económicas sostenibles
- Registro de huella de carbono del MITECO: voluntario, sellos Calculo/Reduzco/Compenso

### Huella de carbono
- Scope 1: emisiones directas (gas, flota, procesos)
- Scope 2: electricidad comprada (mix España 2024: 0,181 kgCO₂/kWh)
- Scope 3: cadena de valor (70-90% del total típicamente)
- Factores MITECO: gas natural 0,202 kgCO₂/kWh, gasóleo A 2,65 kgCO₂/litro

### Economía circular
- Diseño para durabilidad y reparabilidad
- Modelos de negocio circulares: producto como servicio, remanufactura, sharing
- Jerarquía de residuos: prevención > reutilización > reciclaje > valorización > eliminación

### CIRCULR ofrece
- Calculadora de huella de carbono gratuita: /tools/huella-carbono
- Test CSRD gratuito: /tools/test-csrd
- Generación de memorias de sostenibilidad con IA
- Políticas medioambientales automatizadas
- Consultoría personalizada con expertos

### Equipo CIRCULR
- Isabelle Guitton: especialista en economía circular
- Miguel Fernández: especialista en economía azul
- Ubicación: Málaga, España

## REGLAS
1. Si el usuario no sabe por dónde empezar, sugiere el test CSRD gratuito (/tools/test-csrd)
2. Si pregunta por huella de carbono, recomienda la calculadora gratuita (/tools/huella-carbono)
3. Para consultas complejas, sugiere contactar al equipo de consultores
4. NUNCA inventes datos legales o normativos. Si no estás seguro, dilo claramente
5. NUNCA hables de competidores
6. Si preguntan sobre temas no relacionados con sostenibilidad, redirige amablemente
7. Usa formateo Markdown cuando sea útil (listas, negritas)
8. Responde en el idioma del usuario (por defecto español)`;

const client = new Anthropic();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, sessionId } = body as {
      messages?: ChatMessage[];
      sessionId?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages required" },
        { status: 400 }
      );
    }

    // Rate limit: 30 messages per session (use sessionId or IP)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const key = sessionId || ip;
    const { success, remaining } = rateLimit(key, {
      windowMs: 3600000, // 1 hour
      max: 30,
    });

    if (!success) {
      return NextResponse.json(
        {
          error: "rate_limit",
          message:
            "Has alcanzado el límite de mensajes. Para consultas más detalladas, contacta con nuestro equipo de consultores.",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Sanitize the last user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    const { clean, isInjection } = sanitizeInput(lastMessage.content);
    if (isInjection) {
      return NextResponse.json(
        {
          error: "invalid_input",
          message:
            "No puedo procesar esa solicitud. ¿En qué puedo ayudarte sobre sostenibilidad?",
        },
        { status: 400 }
      );
    }

    // Build clean messages (limit to last 20)
    const cleanMessages = messages.slice(-20).map((m, i, arr) =>
      i === arr.length - 1 && m.role === "user" ? { ...m, content: clean } : m
    );

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = client.messages.stream({
            model: process.env.CHAT_MODEL || "claude-sonnet-4-20250514",
            max_tokens: 1024,
            temperature: 0.7,
            system: SYSTEM_PROMPT,
            messages: cleanMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          });

          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          controller.close();
        } catch (error: unknown) {
          if (
            error instanceof Anthropic.APIError &&
            error.status >= 500
          ) {
            try {
              const retryStream = client.messages.stream({
                model: process.env.CHAT_MODEL || "claude-sonnet-4-20250514",
                max_tokens: 1024,
                temperature: 0.7,
                system: SYSTEM_PROMPT,
                messages: cleanMessages.map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
              });

              for await (const event of retryStream) {
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
                encoder.encode(
                  "Lo siento, el servicio no está disponible en este momento. Por favor, inténtalo de nuevo más tarde."
                )
              );
              controller.close();
            }
          } else {
            controller.enqueue(
              encoder.encode(
                "Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo."
              )
            );
            controller.close();
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
