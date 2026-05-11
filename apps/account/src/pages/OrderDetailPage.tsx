import React from "react";
import { Link, useParams } from "react-router";
import { useOrder } from "@mfe/api";
import { formatCurrency } from "@mfe/shared";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@mfe/ui";

function DetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="mb-3 h-4 w-full" />
          <Skeleton className="mb-3 h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id!);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">
          {status === 404
            ? "Order not found."
            : ((error as Error).message ?? "Failed to load order.")}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
          {status !== 404 && (
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/orders">← Back to Orders</Link>
        </Button>
      </div>

      {/* Header card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              Order #{order!.id.slice(0, 8).toUpperCase()}
            </span>
            <Badge variant="secondary">{order!.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date
            </p>
            <p className="mt-1">
              {new Date(order!.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="mt-1 font-semibold">{formatCurrency(order!.total)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Line items table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order!.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">
                  Order Total
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(order!.total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
