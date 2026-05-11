import { useParams, useNavigate } from "react-router";
import {
  useProduct,
  useAddToCart,
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@mfe/api";
import { Button, Badge, Skeleton, toast } from "@mfe/ui";
import { formatCurrency } from "@mfe/shared";
import { QuantityControl } from "../components/QuantityControl";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isPending, isError, error } = useProduct(id!);
  const { data: cart } = useCart();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const cartItem = cart?.items.find((item) => item.productId === id);

  function handleAddToCart() {
    if (!id) return;
    addToCart.mutate(
      { productId: id, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: () => toast.error("Failed to add to cart"),
      },
    );
  }

  function handleIncrement() {
    if (!cartItem) return;
    updateCartItem.mutate({ id: cartItem.id, quantity: cartItem.quantity + 1 });
  }

  function handleDecrement() {
    if (!cartItem) return;
    if (cartItem.quantity === 1) {
      removeCartItem.mutate(cartItem.id);
    } else {
      updateCartItem.mutate({
        id: cartItem.id,
        quantity: cartItem.quantity - 1,
      });
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-6 md:flex-row md:gap-10 p-6">
        <Skeleton className="h-72 w-full rounded-xl md:max-w-xs" />
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

  const isMutating =
    addToCart.isPending || updateCartItem.isPending || removeCartItem.isPending;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-10 p-4">
      <div className="overflow-hidden rounded-xl bg-muted md:max-w-xs">
        <img
          src={product.image}
          alt={product.name}
          className="h-72 object-contain md:h-80"
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

        <div className="flex items-center gap-3 pt-2">
          {cartItem ? (
            <QuantityControl
              quantity={cartItem.quantity}
              onDecrease={handleDecrement}
              onIncrease={handleIncrement}
              disabled={isMutating}
              disableIncrease={cartItem.quantity >= product.stock}
            />
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={isMutating || product.stock === 0}
            >
              {addToCart.isPending ? "Adding…" : "Add to Cart"}
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {(addToCart.isError ||
          updateCartItem.isError ||
          removeCartItem.isError) && (
          <p className="text-sm text-destructive">
            {addToCart.error?.message ??
              updateCartItem.error?.message ??
              removeCartItem.error?.message ??
              "Something went wrong"}
          </p>
        )}
      </div>
    </div>
  );
}
