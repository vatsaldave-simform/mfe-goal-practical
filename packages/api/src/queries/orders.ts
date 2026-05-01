import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { OrderSummary, OrderDetail } from "@mfe/shared";
import { ROUTES } from "@mfe/shared";
import { apiClient } from "../client";
import { orderKeys, cartKeys } from "../keys";

type OrdersResponse = { orders: OrderSummary[] };

export function useOrders(
  options?: Omit<UseQueryOptions<OrdersResponse>, "queryKey" | "queryFn">,
): UseQueryResult<OrdersResponse> {
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<OrdersResponse>(ROUTES.ORDERS.LIST);
      return data;
    },
    ...options,
  });
}

export function useOrder(
  id: string,
  options?: Omit<UseQueryOptions<OrderDetail>, "queryKey" | "queryFn">,
): UseQueryResult<OrderDetail> {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<OrderDetail>(
        ROUTES.ORDERS.DETAIL(id),
      );
      return data;
    },
    ...options,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<OrderDetail>(ROUTES.ORDERS.CREATE);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
