import { Button, Separator } from "@mfe/ui";
import { formatCurrency, type CartItem } from "@mfe/shared";

interface CartItemRowProps {
  item: CartItem;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  isUpdating?: boolean;
}

export function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  isUpdating = false,
}: CartItemRowProps) {
  const lineTotal = item.product.price * item.quantity;

  return (
    <div className="flex gap-4 py-4">
      <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="size-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm leading-tight line-clamp-2">
            {item.product.name}
          </p>
          <p className="shrink-0 font-semibold text-sm text-primary">
            {formatCurrency(lineTotal)}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          {formatCurrency(item.product.price)} each
        </p>

        <div className="mt-auto flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onDecrease(item.id)}
              disabled={isUpdating || item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </Button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onIncrease(item.id)}
              disabled={isUpdating}
              aria-label="Increase quantity"
            >
              +
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
