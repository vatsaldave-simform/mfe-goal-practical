import React from "react";
import { NavLink, Link, useNavigate } from "react-router";
import { Package, ShoppingCart, User } from "lucide-react";
import { Badge, Button, cn } from "@mfe/ui";
import { useStore } from "@mfe/store";
import { useLogout } from "@mfe/api";

export function Navbar() {
  const itemCount = useStore((s) => s.itemCount);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const user = useStore((s) => s.user);
  const clearAuth = useStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        navigate("/auth/login");
      },
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto flex h-14 items-center gap-6 px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <Package className="size-5" />
          <span>MFE Store</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-4">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive ? "text-foreground" : "text-muted-foreground",
              )
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive ? "text-foreground" : "text-muted-foreground",
              )
            }
          >
            Cart
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )
              }
            >
              Orders
            </NavLink>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Cart icon with badge */}
        <Link
          to="/cart"
          aria-label="Cart"
          className="relative flex items-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <ShoppingCart className="size-5" />
          {itemCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center p-0 text-xs"
            >
              {itemCount}
            </Badge>
          )}
        </Link>

        {/* Auth area */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Link
            to="/auth/login"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <User className="size-4" />
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
