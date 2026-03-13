import { NextRequest, NextResponse } from "next/server";
import { generate } from "@/lib/ai/generate";
import { getTestCsrdPrompt, getPoliticaPrompt, getMemoriaPrompt, getHuellaVerificadaPrompt } from "@/lib/tools/prompts";
import { calculateCarbon } from "@/lib/tools/carbon-calculator";
import { TOOL_PRODUCTS, type ToolSlug } from "@/lib/stripe/products";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Simple in-memory rate limit for free tool (best-effort on serverless)
const freeCallTimestamps: number[] = [];
const FREE_RATE_LIMIT = 30; // max calls per minute
const FREE_RATE_WINDOW = 60_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!(slug in TOOL_PRODUCTS)) {
    return NextResponse.json({ error: "Invalid tool" }, { status: 400 });
  }

  const toolSlug = slug as ToolSlug;
  const product = TOOL_PRODUCTS[toolSlug];
  const body = await request.json();
  const { input_data: bodyInputData, order_id, _webhook_secret } = body as {
    input_data?: Record<string, unknown>;
    order_id?: string;
    _webhook_secret?: string;
  };

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

  // Determine input_data source
  let input_data: Record<string, unknown>;

  if (product.free) {
    // Free tool: use body input_data directly, apply rate limit
    if (!bodyInputData || Object.keys(bodyInputData).length === 0) {
      return NextResponse.json({ error: "Missing input_data" }, { status: 400 });
    }
    const now = Date.now();
    const recent = freeCallTimestamps.filter((t) => now - t < FREE_RATE_WINDOW);
    freeCallTimestamps.length = 0;
    freeCallTimestamps.push(...recent);
    if (recent.length >= FREE_RATE_LIMIT) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Inténtalo en un minuto." }, { status: 429 });
    }
    freeCallTimestamps.push(now);
    input_data = bodyInputData;
  } else {
    // Paid tool: require order_id and verify payment
    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const { data: order } = await supabase
      .from("quick_orders")
      .select("input_data, status, stripe_session_id, output_data")
      .eq("id", order_id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If already completed, return cached result
    if (order.status === "completed" && order.output_data) {
      return NextResponse.json({ result: order.output_data });
    }
    if (order.status === "consultant_review" && order.output_data) {
      return NextResponse.json({ result: order.output_data, status: "consultant_review" });
    }

    // Verify payment: order must have a stripe_session_id (set during checkout)
    if (!order.stripe_session_id) {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    // Use input_data from database (the complete data saved during checkout)
    input_data = (order.input_data as Record<string, unknown>) || {};

    if (Object.keys(input_data).length === 0) {
      return NextResponse.json({ error: "No input data found for this order" }, { status: 400 });
    }

    // Mark as processing
    await supabase
      .from("quick_orders")
      .update({ status: "processing" })
      .eq("id", order_id);
  }

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
    // Reset order status on failure
    if (order_id) {
      await supabase
        .from("quick_orders")
        .update({ status: "pending" })
        .eq("id", order_id);
    }
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
