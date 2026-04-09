"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const SIZE_MAP = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };

export default function StarRating({
  value,
  onChange,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = SIZE_MAP[size];

  return (
    <div className="flex gap-0.5" role={readonly ? undefined : "radiogroup"} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95 transition-transform"}`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <svg
              className={`${sizeClass} transition-colors`}
              viewBox="0 0 20 20"
              fill={filled ? "#F59E0B" : "none"}
              stroke={filled ? "#F59E0B" : "#4B5563"}
              strokeWidth="1.5"
            >
              <path
                strokeLinejoin="round"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
