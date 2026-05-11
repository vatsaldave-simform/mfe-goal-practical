import { Button, Separator } from "@mfe/ui";
import { formatCurrency, type CartItem } from "@mfe/shared";
import { QuantityControl } from "./QuantityControl";

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
    <div className="flex gap-4 py-6">
      <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="size-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-base leading-tight line-clamp-2">
            {item.product.name}
          </p>
          <p className="shrink-0 font-semibold text-base text-primary">
            {formatCurrency(lineTotal)}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {formatCurrency(item.product.price)} each
        </p>

        <div className="mt-auto flex items-center justify-between">
          <QuantityControl
            quantity={item.quantity}
            onDecrease={() => onDecrease(item.id)}
            onIncrease={() => onIncrease(item.id)}
            disabled={isUpdating}
            disableDecrease={item.quantity <= 1}
          />

          <Button
            variant="ghost"
            className="h-7 text-destructive hover:text-destructive"
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
