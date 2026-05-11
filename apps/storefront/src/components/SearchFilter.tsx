import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mfe/ui";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "home", label: "Home" },
];

const ALL_CATEGORIES = "all";
const DEBOUNCE_MS = 300;

export function SearchFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(
    searchParams.get("search") ?? "",
  );

  // Debounce search param update
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (inputValue) {
          next.set("search", inputValue);
        } else {
          next.delete("search");
        }
        next.delete("page"); // reset to page 1 on new search
        return next;
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const category = searchParams.get("category") ?? ALL_CATEGORIES;

  function handleCategoryChange(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === ALL_CATEGORIES) {
        next.delete("category");
      } else {
        next.set("category", value);
      }
      next.delete("page");
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        type="search"
        placeholder="Search products…"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="sm:w-44">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
