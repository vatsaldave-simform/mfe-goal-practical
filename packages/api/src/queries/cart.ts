import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { CartResponse } from "@mfe/shared";
import type { AddToCartInput } from "@mfe/shared";
import { ROUTES } from "@mfe/shared";
import { apiClient } from "../client";
import { cartKeys } from "../keys";

export function useCart(
  options?: Omit<UseQueryOptions<CartResponse>, "queryKey" | "queryFn">,
): UseQueryResult<CartResponse> {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: async () => {
      const { data } = await apiClient.get<CartResponse>(ROUTES.CART.GET);
      return data;
    },
    ...options,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddToCartInput) => {
      const { data } = await apiClient.post<CartResponse>(
        ROUTES.CART.ITEMS,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data } = await apiClient.patch<CartResponse>(
        ROUTES.CART.ITEM(id),
        { quantity },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(ROUTES.CART.ITEM(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
