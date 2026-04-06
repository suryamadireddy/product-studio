"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ArtifactType } from "@/lib/types";

type Props = {
  slug: string;
  artifactType: ArtifactType;
  disabled?: boolean;
};

export function RefineArtifactForm({
  slug,
  artifactType,
  disabled = false,
}: Props) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!prompt.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${slug}/refine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artifactType,
          refinementPrompt: prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to refine artifact");
      }

      setPrompt("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={`Refine the ${artifactType}...`}
        disabled={disabled || isLoading}
        rows={4}
        className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={disabled || isLoading || !prompt.trim()}
          className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "Refining..." : "Refine"}
        </button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </form>
  );
}
