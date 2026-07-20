// pages/LoginHistory.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { getLoginHistoryApi } from "../../services/allAPi";
import { toast } from "react-toastify";
import type { LoginHistoryEntry } from "../../types/login_history";
import LoginHistoryTable from "./Login_historyTable";

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Filters = {
  email: string;
  name: string;
  status: string;
  fromDate: string;
  toDate: string;
};

const INITIAL_FILTERS: Filters = {
  email: "", name: "", status: "", fromDate: "", toDate: "",
};

export default function LoginHistory() {
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchHistory = useCallback(async (
    currentFilters: Filters,
    currentPage: number,
    currentLimit: number
  ) => {
    setLoading(true);
    try {
      const res = await getLoginHistoryApi({
        ...currentFilters,
        page: currentPage,
        limit: currentLimit,
      });
      setHistory(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load login history");
    } finally {
      setLoading(false);
    }
  }, []);

  // debounce text filters (name, email) — fire immediately for selects/dates
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchHistory(filters, page, limit);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, page, limit, fetchHistory]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Login History</h4>
      </div>

      <div className="card-body table-responsive">
        {loading && history.length === 0 ? (
          <p className="p-3 text-muted">Loading...</p>
        ) : (
          <LoginHistoryTable
            data={history}
            pagination={pagination}
            limit={limit}
            filters={filters}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}