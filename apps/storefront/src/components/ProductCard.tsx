import { Link } from "react-router";
import { Badge, Card, CardContent, CardFooter } from "@mfe/ui";
import { formatCurrency, type Product } from "@mfe/shared";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/${product.id}`} className="group outline-none">
      <Card className="overflow-hidden gap-0 py-0 transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight line-clamp-2 text-sm">
              {product.name}
            </h3>
            <Badge variant="secondary" className="shrink-0">
              {product.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0">
          <span className="text-base font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
