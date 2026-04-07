import { createProject } from "./actions";

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">New Project</h1>

      <form action={createProject} className="mt-8 space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Idea title
          </label>
          <input
            id="title"
            name="title"
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="Help people compare phone plans"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="rawIdea" className="block text-sm font-medium">
            Raw idea
          </label>
          <textarea
            id="rawIdea"
            name="rawIdea"
            required
            rows={6}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Describe the idea..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="domain" className="block text-sm font-medium">
            Optional domain
          </label>
          <input
            id="domain"
            name="domain"
            className="w-full rounded-md border px-3 py-2"
            placeholder="Telecom"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="intendedAudience"
            className="block text-sm font-medium"
          >
            Optional intended audience
          </label>
          <input
            id="intendedAudience"
            name="intendedAudience"
            className="w-full rounded-md border px-3 py-2"
            placeholder="Consumers switching plans"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          Create project
        </button>
      </form>
    </main>
  );
}
