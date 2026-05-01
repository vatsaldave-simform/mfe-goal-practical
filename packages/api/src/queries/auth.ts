import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AuthResponse, LoginInput, RegisterInput } from "@mfe/shared";
import { ROUTES } from "@mfe/shared";
import { apiClient } from "../client";
import { authKeys } from "../keys";

export function useMe(
  options?: Omit<UseQueryOptions<AuthResponse>, "queryKey" | "queryFn">,
): UseQueryResult<AuthResponse> {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const { data } = await apiClient.get<AuthResponse>(ROUTES.AUTH.ME);
      return data;
    },
    ...options,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apiClient.post<AuthResponse>(
        ROUTES.AUTH.LOGIN,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await apiClient.post<AuthResponse>(
        ROUTES.AUTH.REGISTER,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post(ROUTES.AUTH.LOGOUT);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
