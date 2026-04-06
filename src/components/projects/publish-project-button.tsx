"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
};

export function PublishProjectButton({ slug }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${slug}/publish`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to publish project");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handlePublish}
        disabled={isLoading}
        className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? "Publishing..." : "Publish Project"}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
