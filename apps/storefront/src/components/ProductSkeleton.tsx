import { Card, CardContent, CardFooter, Skeleton, Grid } from "@mfe/ui";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden gap-0 py-0">
      {/* image area */}
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardContent className="flex flex-col gap-2 p-4">
        {/* title + badge row */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {/* description lines */}
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <Skeleton className="h-5 w-20 rounded" />
      </CardFooter>
    </Card>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <Grid cols={1} colsSm={2} colsLg={3} gap={6}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </Grid>
  );
}
