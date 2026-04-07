import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { data: projects, error } = await supabaseAdmin
    .from("projects")
    .select("id, title, slug, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>

        <Link
          href="/privateStudio/projects/new"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          New Project
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {!projects || projects.length === 0 ? (
          <p className="text-sm text-gray-500">No projects yet.</p>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/privateStudio/projects/${project.slug}`}
              className="block rounded-lg border p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">
                  {project.title || "Untitled project"}
                </h2>
                <span className="text-sm text-gray-500">{project.status}</span>
              </div>

              <p className="mt-1 text-sm text-gray-500">{project.slug}</p>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
