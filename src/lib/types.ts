export type ProjectStatus = "draft" | "published" | "archived";
export type ArtifactType = "brief" | "synthesis" | "prd" | "directions";
export type ChatScope = "public" | "private";
export type GenerationMethod = "initial" | "refinement";
export type ChatMessageRole = "user" | "assistant" | "system";

export interface Project {
  id: string;
  slug: string;
  raw_idea: string;
  title: string;
  summary: string | null;
  domain: string | null;
  intended_audience: string | null;
  status: ProjectStatus;
  is_public: boolean;
  featured_order: number | null;
  hero_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Artifact {
  id: string;
  project_id: string;
  artifact_type: ArtifactType;
  version: number;
  content_md: string;
  source_artifact_id: string | null;
  generation_method: GenerationMethod;
  refinement_prompt: string | null;
  is_current: boolean;
  created_at: string;
}

export interface RetrievalChunk {
  id: string;
  project_id: string;
  artifact_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Chat {
  id: string;
  project_id: string;
  chat_scope: ChatScope;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: ChatMessageRole;
  content: string;
  retrieval_context: Record<string, unknown> | null;
  source_artifact_ids: string[] | null;
  created_at: string;
}