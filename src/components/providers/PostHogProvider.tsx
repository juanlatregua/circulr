"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

    if (!key) return;

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Tracking helpers
export const trackEvent = {
  onboardingComplete: (projectType: string) => {
    posthog.capture("onboarding_complete", { project_type: projectType });
  },

  aiGeneration: (projectId: string, tokensUsed: number, model: string) => {
    posthog.capture("ai_generation", {
      project_id: projectId,
      tokens_used: tokensUsed,
      model,
    });
  },

  statusChange: (projectId: string, from: string, to: string) => {
    posthog.capture("project_status_change", {
      project_id: projectId,
      from_status: from,
      to_status: to,
    });
  },

  paymentSuccess: (projectId: string, amountEur: number) => {
    posthog.capture("payment_success", {
      project_id: projectId,
      amount_eur: amountEur / 100,
    });
  },
};
