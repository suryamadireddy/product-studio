"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

export async function generateResearch(projectId: string, rawIdea: string) {
  // Temporary mock sources so we can build the pipeline first
  const mockSources = [
    {
      title: "How people compare phone plans",
      url: "https://example.com/phone-plans-comparison",
      extracted_summary:
        "Users often compare plans by advertised monthly price, but struggle to account for hidden fees, taxes, data throttling, and trade-in conditions.",
    },
    {
      title: "Common frustrations when switching mobile carriers",
      url: "https://example.com/switching-carriers-frustrations",
      extracted_summary:
        "Switching friction includes device compatibility concerns, uncertainty around keeping the same number, contract confusion, and fear of losing coverage quality.",
    },
    {
      title: "Why carrier pricing feels confusing",
      url: "https://example.com/carrier-pricing-confusion",
      extracted_summary:
        "Pricing is difficult to compare because carriers bundle discounts, family plan assumptions, auto-pay incentives, and limited-time promotions differently.",
    },
  ];

  const rows = mockSources.map((source) => ({
    project_id: projectId,
    title: source.title,
    url: source.url,
    extracted_summary: source.extracted_summary,
  }));

  const { error } = await supabaseAdmin.from("research_sources").insert(rows);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
