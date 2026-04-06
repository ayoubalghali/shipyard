// Shipyard — shared TypeScript types (strict mode)

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  usageCount: number;
  createdAt: string;
  creator: Creator;
  prompt?: string;
  parameters?: AgentParameter[];
  defaultModel?: "claude" | "ollama";
  temperature?: number;
  maxTokens?: number;
  isPublic?: boolean;
  status?: "published" | "draft" | "archived";
}

export interface AgentParameter {
  name: string;
  type: "text" | "number" | "select" | "textarea" | "file";
  required: boolean;
  defaultValue?: string;
  helpText?: string;
  options?: string[]; // for select type
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  agentCount: number;
}

export type SortOption = "trending" | "most_used" | "highest_rated" | "newest";
