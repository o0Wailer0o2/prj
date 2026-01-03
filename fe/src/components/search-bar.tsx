"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import SearchSuggestions from "@/components/search-suggestion";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      {/* Search Bar - Responsive */}
      <div className="hidden max-w-xs flex-1 items-center md:flex">
        <div className="group relative w-full">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="bg-muted/50 text-foreground placeholder-muted-foreground focus:ring-primary/50 border-border/40 focus:border-primary/50 group-hover:bg-muted/70 w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
          />
          <button className="text-muted-foreground group-hover:text-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors">
            <Search className="h-4 w-4" />
          </button>

          {/* Suggestions Dropdown */}
          <SearchSuggestions
            query={searchQuery}
            isVisible={isFocused}
            onClose={() => setIsFocused(false)}
            onSelectSuggestion={(suggestion) => {
              setSearchQuery(suggestion);
              setIsFocused(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
