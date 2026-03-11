export const PROMPTS = {
  csrd_gap_analysis: (context: string) => `
You are a CSRD compliance expert. Analyze the following company data and identify gaps in their European Sustainability Reporting Standards (ESRS) compliance.

Context:
${context}

Provide a structured analysis with:
1. Current compliance level (percentage estimate)
2. Key gaps identified (grouped by ESRS topic)
3. Priority actions (ranked by urgency and impact)
4. Estimated timeline for compliance

Respond in Spanish. Use professional but accessible language.
Format as JSON matching the provided schema.
`,

  ce_diagnosis: (context: string) => `
You are a circular economy expert. Perform a diagnostic assessment of the following company's circular economy maturity.

Context:
${context}

Provide:
1. Current CE maturity level (none/basic/intermediate/advanced)
2. Material flow analysis summary
3. Waste stream opportunities
4. Recommended circular strategies (R-strategies applicable)
5. Quick wins (implementable in <3 months)
6. Strategic recommendations (3-12 months)

Respond in Spanish. Format as JSON matching the provided schema.
`,

  implementation_plan: (context: string) => `
You are a circular economy implementation consultant. Create a detailed implementation plan based on the diagnosis provided.

Context:
${context}

Provide:
1. Phase breakdown (with milestones)
2. Resource requirements
3. KPIs to track
4. Risk assessment
5. Budget estimation

Respond in Spanish. Format as JSON matching the provided schema.
`,

  deliverable_draft: (type: string, context: string) => `
You are an expert circular economy consultant drafting a ${type} deliverable.

Context:
${context}

Generate a professional, well-structured document draft in Spanish.
Use clear headings, data-driven insights, and actionable recommendations.
Format the output as structured markdown.
`,
} as const;

export type PromptType = keyof typeof PROMPTS;
