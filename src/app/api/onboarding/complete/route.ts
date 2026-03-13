import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { CIRCULR_PRODUCTS, type ProductKey } from "@/lib/stripe/products";
import { sendEmail } from "@/lib/email/send";
import { EMAIL_TEMPLATES } from "@/lib/email/templates";
import { rateLimit } from "@/lib/utils/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, remaining } = rateLimit(`onboarding:${user.id}`, { windowMs: 60_000, max: 5 });
    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo en un minuto." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const {
      sector,
      employees,
      annual_revenue,
      location,
      has_csrd_questionnaire,
      csrd_sender,
      csrd_deadline,
      has_pending_inspection,
      main_waste_types,
      energy_cost_concern,
      ce_maturity,
      project_type,
      main_pain,
      urgency,
    } = body;

    // Input validation
    const validProjectTypes = ["csrd_response", "ce_diagnosis", "implementation", "training"];
    const validUrgencies = ["standard", "urgent", "critical"];
    const validMaturities = ["none", "basic", "intermediate", "advanced"];

    if (!project_type || !validProjectTypes.includes(project_type)) {
      return NextResponse.json({ error: "Tipo de proyecto inválido" }, { status: 400 });
    }
    if (urgency && !validUrgencies.includes(urgency)) {
      return NextResponse.json({ error: "Urgencia inválida" }, { status: 400 });
    }
    if (ce_maturity && !validMaturities.includes(ce_maturity)) {
      return NextResponse.json({ error: "Madurez CE inválida" }, { status: 400 });
    }
    if (sector && typeof sector !== "string") {
      return NextResponse.json({ error: "Sector inválido" }, { status: 400 });
    }
    if (main_waste_types && !Array.isArray(main_waste_types)) {
      return NextResponse.json({ error: "Tipos de residuos inválidos" }, { status: 400 });
    }

    const productKey = project_type as ProductKey;
    const product = CIRCULR_PRODUCTS[productKey];
    if (!product) {
      return NextResponse.json({ error: "Invalid project type" }, { status: 400 });
    }

    // Guard: check if user already has a pending_payment project (avoid duplicates)
    const { data: existingProjects } = await supabase
      .from("projects")
      .select("id, status")
      .eq("client_id", user.id)
      .in("status", ["pending_payment", "draft"]);

    if (existingProjects && existingProjects.length > 0) {
      return NextResponse.json(
        { error: "Ya tienes un proyecto en proceso. Completa el pago pendiente." },
        { status: 409 }
      );
    }

    // 1. Update profile (sector/size now, onboarded AFTER payment via webhook)
    await supabase
      .from("profiles")
      .update({
        sector,
        company_size: employees,
      })
      .eq("id", user.id);

    // 2. Create project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        client_id: user.id,
        type: productKey,
        status: "pending_payment",
        title: product.name,
        description: main_pain || product.description,
        urgency: urgency || "standard",
        price_eur: product.price_eur,
      })
      .select("id")
      .single();

    if (projectError || !project) {
      console.error("Project creation error:", projectError);
      return NextResponse.json({ error: "Error creating project" }, { status: 500 });
    }

    // 3. Create intake record
    await supabase.from("intakes").insert({
      project_id: project.id,
      client_id: user.id,
      sector,
      employees,
      annual_revenue,
      location,
      has_csrd_questionnaire: has_csrd_questionnaire || false,
      csrd_sender: csrd_sender || null,
      csrd_deadline: csrd_deadline || null,
      has_pending_inspection: has_pending_inspection || false,
      main_waste_types: main_waste_types || [],
      energy_cost_concern: energy_cost_concern || false,
      ce_maturity: ce_maturity || "none",
      main_pain: main_pain || null,
      raw_answers: body,
    });

    // 4. Send welcome + project created emails (non-blocking)
    const userName = user.user_metadata?.full_name || user.email || "";
    sendEmail({
      to: user.email!,
      ...EMAIL_TEMPLATES.welcome(userName),
    });
    sendEmail({
      to: user.email!,
      ...EMAIL_TEMPLATES.project_created(userName, product.name),
    });

    // 5. Create Stripe checkout session
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
            unit_amount: product.price_eur,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${project.id}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
      metadata: {
        projectId: project.id,
        userId: user.id,
        productKey,
      },
    });

    return NextResponse.json({
      projectId: project.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
