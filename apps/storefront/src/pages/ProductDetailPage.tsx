import { useParams, useNavigate } from "react-router";
import { useProduct, useAddToCart } from "@mfe/api";
import { Button, Badge, Skeleton } from "@mfe/ui";
import { formatCurrency } from "@mfe/shared";
import { useCartSync } from "../hooks/useCartSync";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { syncCartCount } = useCartSync();

  const { data: product, isPending, isError, error } = useProduct(id!);
  const addToCart = useAddToCart();

  function handleAddToCart() {
    if (!id) return;
    addToCart.mutate(
      { productId: id, quantity: 1 },
      {
        onSuccess: (cart) => {
          syncCartCount(cart.itemCount);
        },
      },
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <Skeleton className="aspect-square w-full rounded-xl md:max-w-sm" />
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-8 w-3/4 rounded" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-4/6 rounded" />
          <Skeleton className="mt-4 h-10 w-36 rounded-md" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium text-destructive">
          {error?.message ?? "Product not found"}
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-10">
      <div className="overflow-hidden rounded-xl bg-muted md:max-w-sm">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit">
            {product.category}
          </Badge>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold text-primary">
            {formatCurrency(product.price)}
          </p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        <p className="text-xs text-muted-foreground">
          {product.stock > 0 ? (
            `${product.stock} in stock`
          ) : (
            <span className="text-destructive">Out of stock</span>
          )}
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleAddToCart}
            disabled={addToCart.isPending || product.stock === 0}
          >
            {addToCart.isPending ? "Adding…" : "Add to Cart"}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {addToCart.isError && (
          <p className="text-sm text-destructive">
            {addToCart.error?.message ?? "Failed to add to cart"}
          </p>
        )}
        {addToCart.isSuccess && (
          <p className="text-sm text-green-600">Added to cart!</p>
        )}
      </div>
    </div>
  );
}
