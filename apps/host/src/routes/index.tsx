import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { Skeleton } from "@mfe/ui";
import { RemoteErrorBoundary } from "../components/remote-error-boundary";

const StorefrontApp = lazy(() => import("storefront/App"));
const AccountApp = lazy(() => import("account/App"));

function RemoteSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />

      <Route
        path="/products/*"
        element={
          <RemoteErrorBoundary>
            <Suspense fallback={<RemoteSkeleton />}>
              <StorefrontApp />
            </Suspense>
          </RemoteErrorBoundary>
        }
      />

      <Route
        path="/cart"
        element={
          <RemoteErrorBoundary>
            <Suspense fallback={<RemoteSkeleton />}>
              <StorefrontApp />
            </Suspense>
          </RemoteErrorBoundary>
        }
      />

      <Route
        path="/auth/*"
        element={
          <RemoteErrorBoundary>
            <Suspense fallback={<RemoteSkeleton />}>
              <AccountApp />
            </Suspense>
          </RemoteErrorBoundary>
        }
      />

      <Route
        path="/account/*"
        element={
          <RemoteErrorBoundary>
            <Suspense fallback={<RemoteSkeleton />}>
              <AccountApp />
            </Suspense>
          </RemoteErrorBoundary>
        }
      />
    </Routes>
  );
}
