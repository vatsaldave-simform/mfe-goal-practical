import { Grid } from "@mfe/ui";
import type { Product } from "@mfe/shared";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <Grid cols={1} colsSm={2} colsLg={3} gap={6}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Grid>
  );
}
