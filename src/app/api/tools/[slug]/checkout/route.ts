import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { TOOL_PRODUCTS, type ToolSlug } from "@/lib/stripe/products";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!(slug in TOOL_PRODUCTS) || slug === "huella-carbono") {
    return NextResponse.json({ error: "Invalid tool or free tool" }, { status: 400 });
  }

  const toolSlug = slug as ToolSlug;
  const product = TOOL_PRODUCTS[toolSlug];
  const { input_data } = await request.json();

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
    // Create quick_order first
    const { data: order, error: orderError } = await supabase
      .from("quick_orders")
      .insert({
        email: input_data.email as string,
        name: input_data.name as string,
        company: (input_data.company || input_data.company_name) as string,
        product_slug: toolSlug,
        status: "pending",
        input_data,
        amount_cents: product.price_cents,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: input_data.email as string,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tools/${toolSlug}?order=${order.id}&status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tools/${toolSlug}?status=cancelled`,
      metadata: {
        order_id: order.id,
        tool_slug: toolSlug,
        type: "quick_tool",
      },
    });

    // Update order with stripe session
    await supabase
      .from("quick_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url, order_id: order.id });
  } catch (error) {
    console.error("Tool checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
