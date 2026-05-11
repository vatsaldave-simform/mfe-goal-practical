import { Button } from "@mfe/ui";

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  /** Disables both buttons */
  disabled?: boolean;
  /** Disables only the − button (in addition to `disabled`) */
  disableDecrease?: boolean;
  /** Disables only the + button (in addition to `disabled`) */
  disableIncrease?: boolean;
}

export function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  disabled = false,
  disableDecrease = false,
  disableIncrease = false,
}: QuantityControlProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onDecrease}
        disabled={disabled || disableDecrease}
        aria-label="Decrease quantity"
      >
        −
      </Button>
      <span className="w-8 text-center text-sm font-medium tabular-nums">
        {quantity}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onIncrease}
        disabled={disabled || disableIncrease}
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  );
}
