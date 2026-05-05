import React from "react";
import { useMe } from "@mfe/api";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Spinner,
} from "@mfe/ui";

export function ProfilePage() {
  const { data, isLoading, isError, error } = useMe();

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-sm">
          <AlertTitle>Failed to load profile</AlertTitle>
          <AlertDescription>
            {(error as Error).message ?? "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
