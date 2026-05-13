import { useQuery } from "@tanstack/react-query";
import { catalogApi, Product, Category, UpiSetting, ProductQueryParams, PaginatedResponse } from "@/lib/api";

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => catalogApi.getProducts(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => catalogApi.getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => catalogApi.getCategories(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useActiveUpi() {
  return useQuery({
    queryKey: ["activeUpi"],
    queryFn: () => catalogApi.getActiveUpi(),
    staleTime: 60 * 1000,
  });
}