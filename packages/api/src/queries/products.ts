import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Product, ProductListResponse } from "@mfe/shared";
import type { ProductFilterInput } from "@mfe/shared";
import { ROUTES } from "@mfe/shared";
import { apiClient } from "../client";
import { productKeys } from "../keys";

export function useProducts(
  filters?: Partial<ProductFilterInput>,
  options?: Omit<UseQueryOptions<ProductListResponse>, "queryKey" | "queryFn">,
): UseQueryResult<ProductListResponse> {
  return useQuery({
    queryKey: productKeys.list(filters ?? {}),
    queryFn: async () => {
      const { data } = await apiClient.get<ProductListResponse>(
        ROUTES.PRODUCTS.LIST,
        { params: filters },
      );
      return data;
    },
    ...options,
  });
}

export function useProduct(
  id: string,
  options?: Omit<UseQueryOptions<Product>, "queryKey" | "queryFn">,
): UseQueryResult<Product> {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Product>(ROUTES.PRODUCTS.DETAIL(id));
      return data;
    },
    ...options,
  });
}
