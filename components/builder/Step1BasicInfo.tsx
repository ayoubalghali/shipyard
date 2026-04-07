"use client";

import { useBuilderStore } from "@/store/builderStore";

const CATEGORIES = [
  "Workflows", "Code", "Visual", "Apps", "Writing", "Data", "Research", "Marketing",
];

const TAG_SUGGESTIONS = [
  "writing", "code", "seo", "automation", "productivity", "data", "marketing",
  "email", "social", "ai", "analysis", "design", "research", "finance",
];

export default function Step1BasicInfo() {
  const {
    name, description, category, tags, errors,
    setName, setDescription, setCategory, setTags,
  } = useBuilderStore();

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else if (tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-semibold leading-[1.3] text-white">
          Basic Information
        </h2>
        <p className="mt-1 text-sm text-[#A3A3A3]">
          Give your agent a clear name and description so users know what it does.
        </p>
      </div>

      {/* Agent Name */}
      <div>
        <label htmlFor="agent-name" className="mb-1.5 flex items-center justify-between text-sm font-medium text-white">
          <span>
            Agent Name <span className="text-[#EF4444]" aria-label="required">*</span>
          </span>
          <span className={`text-xs ${name.length > 50 ? "text-[#F59E0B]" : "text-[#6B7280]"}`}>
            {name.length}/60
          </span>
        </label>
        <input
          id="agent-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Blog Post Writer, SQL Query Generator..."
          maxLength={60}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`w-full rounded-[6px] border bg-[#1A2332] px-3 py-2.5 text-sm text-white placeholder-[#6B7280] transition-all focus:outline-none ${
            errors.name
              ? "border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
              : "border-[#2A3A4E] focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
          }`}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="agent-description" className="mb-1.5 flex items-center justify-between text-sm font-medium text-white">
          <span>
            Description <span className="text-[#EF4444]" aria-label="required">*</span>
          </span>
          <span className={`text-xs ${description.length > 450 ? "text-[#F59E0B]" : "text-[#6B7280]"}`}>
            {description.length}/500
          </span>
        </label>
        <p className="mb-2 text-xs text-[#6B7280]">
          What does this agent do? What problem does it solve? Be specific — this shows on the marketplace card.
        </p>
        <textarea
          id="agent-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Generate high-quality, SEO-optimized blog posts on any topic in seconds. Supports multiple tones and lengths."
          rows={3}
          maxLength={500}
          aria-required="true"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
          className={`w-full resize-none rounded-[6px] border bg-[#1A2332] px-3 py-2.5 text-sm text-white placeholder-[#6B7280] transition-all focus:outline-none ${
            errors.description
              ? "border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
              : "border-[#2A3A4E] focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
          }`}
        />
        {errors.description && (
          <p id="description-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">{errors.description}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-white">
            Category <span className="text-[#EF4444]" aria-label="required">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <label
                  key={cat}
                  className={`flex cursor-pointer items-center justify-center rounded-[6px] border px-3 py-2 text-sm transition-all duration-150 ${
                    isSelected
                      ? "border-[#2563EB] bg-[#0A0E27] font-medium text-[#00D9FF]"
                      : "border-[#2A3A4E] bg-[#0A0E27] text-[#A3A3A3] hover:border-[#2563EB]/50 hover:text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={isSelected}
                    onChange={() => setCategory(cat)}
                    className="sr-only"
                    aria-label={cat}
                  />
                  {cat}
                </label>
              );
            })}
          </div>
          {errors.category && (
            <p role="alert" className="mt-1.5 text-xs text-[#EF4444]">{errors.category}</p>
          )}
        </fieldset>
      </div>

      {/* Tags */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-white">Tags <span className="text-[#6B7280]">(optional, max 5)</span></p>
          <span className="text-xs text-[#6B7280]">{tags.length}/5 selected</span>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tag selection">
          {TAG_SUGGESTIONS.map((tag) => {
            const isSelected = tags.includes(tag);
            const isDisabled = !isSelected && tags.length >= 5;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? "Remove" : "Add"} tag: ${tag}`}
                className={`rounded-full border px-3 py-1 text-xs transition-all duration-150 ${
                  isSelected
                    ? "border-[#2563EB] bg-[#0A0E27] text-[#00D9FF]"
                    : isDisabled
                    ? "cursor-not-allowed border-[#2A3A4E] text-[#4B5563]"
                    : "border-[#2A3A4E] text-[#6B7280] hover:border-[#2563EB]/50 hover:text-white"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
        {/* Selected tags preview */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/30 px-2.5 py-0.5 text-xs text-[#00D9FF]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className="text-[#00D9FF]/60 transition-colors hover:text-[#EF4444]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
