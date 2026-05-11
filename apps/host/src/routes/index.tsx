import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { Skeleton } from "@mfe/ui";
import { RemoteErrorBoundary } from "../components/remote-error-boundary";
import { AuthGuard } from "../components/auth-guard";
import { LandingPage } from "../pages/landing";
import { useStore } from "@mfe/store";

function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const StorefrontApp = lazy(() => import("storefront/App"));
const CartApp = lazy(() => import("storefront/CartApp"));
const AccountApp = lazy(() => import("account/App"));
const AccountAuthApp = lazy(() => import("account/AuthApp"));
const AccountOrdersApp = lazy(() => import("account/OrdersApp"));

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
      <Route path="/" element={<LandingPage />} />

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
        path="/cart/*"
        element={
          <RemoteErrorBoundary>
            <Suspense fallback={<RemoteSkeleton />}>
              <CartApp />
            </Suspense>
          </RemoteErrorBoundary>
        }
      />

      <Route
        path="/auth/*"
        element={
          <GuestGuard>
            <RemoteErrorBoundary>
              <Suspense fallback={<RemoteSkeleton />}>
                <AccountAuthApp />
              </Suspense>
            </RemoteErrorBoundary>
          </GuestGuard>
        }
      />

      <Route
        path="/account/*"
        element={
          <AuthGuard>
            <RemoteErrorBoundary>
              <Suspense fallback={<RemoteSkeleton />}>
                <AccountApp />
              </Suspense>
            </RemoteErrorBoundary>
          </AuthGuard>
        }
      />

      <Route
        path="/orders/*"
        element={
          <AuthGuard>
            <RemoteErrorBoundary>
              <Suspense fallback={<RemoteSkeleton />}>
                <AccountOrdersApp />
              </Suspense>
            </RemoteErrorBoundary>
          </AuthGuard>
        }
      />
    </Routes>
  );
}
