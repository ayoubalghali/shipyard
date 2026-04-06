"use client";

import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/mockData";
import { useAgentStore } from "@/store/agentStore";

export default function CategoriesGrid() {
  const { selectedCategory, setSelectedCategory } = useAgentStore();

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    // Scroll to browse section
    document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-[24px] font-semibold leading-[1.3] text-white">
            Browse by Category
          </h2>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            Find exactly what you need
          </p>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          aria-label="Agent categories"
        >
          {CATEGORIES.map((category, index) => {
            const isActive = selectedCategory === category.id;

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: index * 0.03 }}
                onClick={() => handleCategoryClick(category.id)}
                aria-pressed={isActive}
                aria-label={`${category.name}: ${category.agentCount} agents. ${isActive ? "Active filter" : "Click to filter"}`}
                className={`group relative flex flex-col rounded-[8px] border p-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] ${
                  isActive
                    ? "border-[#2563EB] bg-[#0A0E27] shadow-[0_0_16px_rgba(0,217,255,0.08)]"
                    : "border-[#2A3A4E] bg-[#0A0E27] hover:border-[#2563EB] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[#00D9FF]" aria-hidden="true" />
                )}

                {/* Icon */}
                <span className="text-2xl leading-none" role="img" aria-hidden="true">
                  {category.icon}
                </span>

                {/* Name */}
                <h3
                  className={`mt-2 text-sm font-semibold transition-colors duration-150 ${
                    isActive
                      ? "text-[#00D9FF]"
                      : "text-white group-hover:text-[#00D9FF]"
                  }`}
                >
                  {category.name}
                </h3>

                {/* Description */}
                <p className="mt-0.5 text-[12px] leading-relaxed text-[#6B7280] line-clamp-2">
                  {category.description}
                </p>

                {/* Count */}
                <p className="mt-2 text-[11px] font-medium text-[#4B5563]">
                  {category.agentCount} agents
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Clear filter */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex justify-center"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-[#6B7280] transition-colors hover:text-[#A3A3A3]"
            >
              Clear category filter ×
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
