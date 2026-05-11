import { useSearchParams } from "react-router";
import { useProducts } from "@mfe/api";
import { Button } from "@mfe/ui";
import type { ProductFilterInput } from "@mfe/shared";
import { SearchFilter } from "../components/SearchFilter";
import { ProductGrid } from "../components/ProductGrid";
import { ProductGridSkeleton } from "../components/ProductSkeleton";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: Partial<ProductFilterInput> = {
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    page: Number(searchParams.get("page") ?? 1),
    limit: 12,
  };

  const { data, isPending, isError, error } = useProducts(filters);

  const totalPages = data?.pagination.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  function goToPage(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(page));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">
          {data ? `${data.pagination.total} products found` : "\u00a0"}
        </p>
      </div>

      <SearchFilter />

      {isPending && <ProductGridSkeleton count={12} />}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
          Failed to load products: {error?.message ?? "Unknown error"}
        </div>
      )}

      {!isPending && !isError && data && (
        <>
          {data.data.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <ProductGrid products={data.data} />
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
