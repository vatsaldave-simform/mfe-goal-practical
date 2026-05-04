import React from "react";
import { Link } from "react-router";
import { Button } from "@mfe/ui";

export function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <div className="flex flex-col items-center gap-6 max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome to MFE Store
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover our curated collection of products. Shop with ease, pay with
          confidence.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
