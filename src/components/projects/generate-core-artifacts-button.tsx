"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    slug: string;
};

export function GenerateCoreArtifactsButton({ slug }: Props) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleGenerate() {
        try {
            setIsLoading(true);
            setError(null);

            const res = await fetch(`/api/projects/${slug}/artifacts/core/generate`, {
                method: "POST",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate core artifacts");
            }

            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-start gap-2">
            <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
                {isLoading ? "Generating Core Artifacts..." : "Generate Core Artifacts"}
            </button>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
    );
}