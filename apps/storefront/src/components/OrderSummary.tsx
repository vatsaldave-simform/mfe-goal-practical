import { Button, Separator } from "@mfe/ui";
import { formatCurrency, type CartResponse } from "@mfe/shared";

interface OrderSummaryProps {
  cart: CartResponse;
  actionLabel: string;
  onAction: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function OrderSummary({
  cart,
  actionLabel,
  onAction,
  isLoading = false,
  disabled = false,
}: OrderSummaryProps) {
  return (
    <div className="rounded-lg border bg-card p-6 flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Order Summary</h2>

      <div className="flex flex-col gap-2">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="truncate text-muted-foreground">
              {item.product.name}{" "}
              <span className="text-xs">× {item.quantity}</span>
            </span>
            <span className="shrink-0 font-medium tabular-nums">
              {formatCurrency(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between font-semibold">
        <span>Total</span>
        <span className="text-primary tabular-nums">
          {formatCurrency(cart.total)}
        </span>
      </div>

      <div className="text-xs text-muted-foreground">
        {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
      </div>

      <Button
        className="w-full"
        onClick={onAction}
        disabled={disabled || isLoading || cart.items.length === 0}
      >
        {isLoading ? "Processing…" : actionLabel}
      </Button>
    </div>
  );
}
