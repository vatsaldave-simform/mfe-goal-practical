import React, { useEffect } from "react";
import { useMe } from "@mfe/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Spinner,
  toast,
} from "@mfe/ui";

export function ProfilePage() {
  const { data, isLoading, isError, error } = useMe();

  useEffect(() => {
    if (isError) {
      toast.error((error as Error)?.message ?? "Failed to load profile.");
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) return null;

  const user = data!.user;

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Name
            </p>
            <p className="mt-1 text-sm">{user.name}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </p>
            <p className="mt-1 text-sm">{user.email}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Member since
            </p>
            <p className="mt-1 text-sm">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
