import { NextRequest, NextResponse } from "next/server";
import { generate } from "@/lib/ai/generate";
import { getTestCsrdPrompt, getPoliticaPrompt, getMemoriaPrompt, getHuellaVerificadaPrompt } from "@/lib/tools/prompts";
import { calculateCarbon } from "@/lib/tools/carbon-calculator";
import { TOOL_PRODUCTS, type ToolSlug } from "@/lib/stripe/products";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!(slug in TOOL_PRODUCTS)) {
    return NextResponse.json({ error: "Invalid tool" }, { status: 400 });
  }

  const toolSlug = slug as ToolSlug;
  const body = await request.json();
  const { input_data, order_id } = body as { input_data: Record<string, unknown>; order_id?: string };

  if (!input_data) {
    return NextResponse.json({ error: "Missing input_data" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  try {
    let result: unknown;

    switch (toolSlug) {
      case "huella-carbono": {
        const carbonResult = calculateCarbon({
          sector: input_data.sector as string,
          employees: input_data.employees as string,
          energy_kwh: Number(input_data.energy_kwh) || 0,
          gas_kwh: Number(input_data.gas_kwh) || 0,
          transport_km: Number(input_data.transport_km) || 0,
          waste_tons: Number(input_data.waste_tons) || 0,
        });
        result = carbonResult;
        break;
      }

      case "test-csrd": {
        const prompt = getTestCsrdPrompt(input_data as Record<string, boolean>);
        const aiResult = await generate({ prompt, maxTokens: 4096 });
        try {
          result = JSON.parse(aiResult.content);
        } catch {
          result = { raw: aiResult.content };
        }
        break;
      }

      case "politica-medioambiental": {
        const prompt = getPoliticaPrompt(input_data);
        const aiResult = await generate({ prompt, maxTokens: 4096 });
        result = { content: aiResult.content };
        break;
      }

      case "memoria-sostenibilidad": {
        const prompt = getMemoriaPrompt(input_data);
        const aiResult = await generate({ prompt, maxTokens: 8192 });
        result = { content: aiResult.content };
        break;
      }

      case "huella-verificada": {
        const prompt = getHuellaVerificadaPrompt(input_data);
        const aiResult = await generate({ prompt, maxTokens: 8192 });
        result = { content: aiResult.content };
        break;
      }
    }

    // Update the order with results
    if (order_id) {
      const newStatus = toolSlug === "huella-verificada" ? "consultant_review" : "completed";
      await supabase
        .from("quick_orders")
        .update({ output_data: result, status: newStatus })
        .eq("id", order_id);
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error(`Tool generation error [${toolSlug}]:`, error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
