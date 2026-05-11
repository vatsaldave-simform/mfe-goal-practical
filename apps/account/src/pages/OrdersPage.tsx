import React from "react";
import { Link } from "react-router";
import { useOrders } from "@mfe/api";
import { formatCurrency } from "@mfe/shared";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  cn,
} from "@mfe/ui";

function OrderCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </CardContent>
    </Card>
  );
}

export function OrdersPage() {
  const { data, isLoading, isError, error, refetch } = useOrders();

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Order History</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">
          {(error as Error).message ?? "Failed to load orders."}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const orders = data?.orders ?? [];

  if (orders.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-muted-foreground">You have no orders yet.</p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Order History</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="group">
            <Card
              className={cn("h-full transition-shadow group-hover:shadow-md")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <Badge variant="secondary">{order.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-semibold">{formatCurrency(order.total)}</p>
                <p className="text-muted-foreground">
                  {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                </p>
                <p className="text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
