export const AI_SCHEMAS = {
  csrd_gap_analysis: {
    type: "object" as const,
    properties: {
      compliance_level: { type: "number" as const },
      gaps: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            esrs_topic: { type: "string" as const },
            description: { type: "string" as const },
            severity: { type: "string" as const, enum: ["high", "medium", "low"] },
          },
        },
      },
      priority_actions: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            action: { type: "string" as const },
            urgency: { type: "string" as const },
            impact: { type: "string" as const },
          },
        },
      },
      estimated_timeline_months: { type: "number" as const },
    },
  },

  ce_diagnosis: {
    type: "object" as const,
    properties: {
      maturity_level: { type: "string" as const, enum: ["none", "basic", "intermediate", "advanced"] },
      material_flow_summary: { type: "string" as const },
      waste_opportunities: {
        type: "array" as const,
        items: { type: "string" as const },
      },
      r_strategies: {
        type: "array" as const,
        items: { type: "string" as const },
      },
      quick_wins: {
        type: "array" as const,
        items: { type: "string" as const },
      },
      strategic_recommendations: {
        type: "array" as const,
        items: { type: "string" as const },
      },
    },
  },
} as const;
