import { create } from "zustand";
import { Agent, SortOption } from "@/lib/types";
import { MOCK_AGENTS } from "@/lib/mockData";

interface AgentStore {
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: SortOption;
  filteredAgents: Agent[];

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sort: SortOption) => void;
  _applyFilters: () => void;
}

function sortAgents(agents: Agent[], sort: SortOption): Agent[] {
  switch (sort) {
    case "trending":
      return [...agents].sort((a, b) => b.usageCount - a.usageCount);
    case "most_used":
      return [...agents].sort((a, b) => b.usageCount - a.usageCount);
    case "highest_rated":
      return [...agents].sort((a, b) => b.rating - a.rating);
    case "newest":
      return [...agents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    default:
      return agents;
  }
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  searchQuery: "",
  selectedCategory: null,
  sortBy: "trending",
  filteredAgents: sortAgents(MOCK_AGENTS, "trending"),

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get()._applyFilters();
  },

  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
    get()._applyFilters();
  },

  setSortBy: (sort: SortOption) => {
    set({ sortBy: sort });
    get()._applyFilters();
  },

  _applyFilters: () => {
    const { searchQuery, selectedCategory, sortBy } = get();
    let result = [...MOCK_AGENTS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter(
        (a) => a.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    set({ filteredAgents: sortAgents(result, sortBy) });
  },
}));
