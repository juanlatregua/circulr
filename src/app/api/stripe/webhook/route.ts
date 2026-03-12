import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type Stripe from "stripe";
import { sendEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Webhooks don't need to set cookies
        },
      },
    }
  );

  // Idempotency check — skip if already processed
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("id", event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const projectId = session.metadata?.projectId;
      const userId = session.metadata?.userId;

      if (projectId) {
        // Update project status
        await supabase
          .from("projects")
          .update({
            status: "active" as const,
            stripe_payment_intent: session.payment_intent as string,
          })
          .eq("id", projectId);

        // Create invoice record
        if (userId && session.amount_total) {
          await supabase.from("invoices").insert({
            project_id: projectId,
            client_id: userId,
            amount_eur: session.amount_total,
            stripe_invoice_id: session.payment_intent as string,
            status: "paid",
            issued_at: new Date().toISOString().split("T")[0],
            paid_at: new Date().toISOString(),
          });

          // Send confirmation email (non-blocking)
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single();

          if (session.customer_email) {
            sendEmail({
              to: session.customer_email,
              subject: "Pago confirmado — CIRCULR",
              html: `
                <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #0A0A0A;">Pago confirmado</h1>
                  <p>Hola ${profile?.full_name || ""},</p>
                  <p>Tu pago ha sido procesado correctamente. Tu proyecto ya está activo.</p>
                  <p>Un consultor será asignado en breve.</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}"
                     style="display: inline-block; background: #C8F060; color: #0A0A0A; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                    Ver mi proyecto
                  </a>
                </div>
              `,
            });
          }
        }
        // Audit log for payment
        await supabase.from("audit_log").insert({
          user_id: userId,
          action: "payment_completed",
          resource_type: "project",
          resource_id: projectId,
          new_value: JSON.stringify({
            amount: session.amount_total,
            payment_intent: session.payment_intent,
          }),
        });
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Record processed event for idempotency
  await supabase.from("webhook_events").insert({
    id: event.id,
    event_type: event.type,
  });

  return NextResponse.json({ received: true });
}
