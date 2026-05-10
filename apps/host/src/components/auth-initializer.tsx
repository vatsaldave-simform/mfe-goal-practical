import React, { useEffect } from "react";
import { useMe } from "@mfe/api";
import { useStore } from "@mfe/store";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const setAuth = useStore((s) => s.setAuth);
  const clearAuth = useStore((s) => s.clearAuth);

  const { data, isError, isPending } = useMe({
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.user) {
      setAuth(data.user);
    }
  }, [data, setAuth]);

  useEffect(() => {
    if (isError) {
      clearAuth();
    }
  }, [isError, clearAuth]);

  if (isPending) {
    return null;
  }

  return <>{children}</>;
}
