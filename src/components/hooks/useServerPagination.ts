/* eslint-disable react-hooks/set-state-in-effect */
// hooks/useServerPagination.ts
import { useState, useEffect, useCallback } from "react";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Options<F> = {
  fetchFn: (params: F & { page: number; limit: number }) => Promise<{ data: { data: unknown[]; pagination: PaginationMeta } }>;
  initialFilters: F;
  initialLimit?: number;
};

export function useServerPagination<T, F extends Record<string, unknown>>({
  fetchFn,
  initialFilters,
  initialLimit = 10,
}: Options<F>) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<F>(initialFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFn({ ...filters, page, limit });
      setData(res.data.data as T[]);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateFilter = (key: keyof F, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // reset to page 1 on filter change
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return {
    data, pagination, filters, page, limit, loading,
    setPage, updateFilter, resetFilters, changeLimit, refetch: fetch,
  };
}