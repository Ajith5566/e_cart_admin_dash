/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState, useRef, useEffect } from 'react'
import {
  useReactTable, getCoreRowModel, flexRender,
  getSortedRowModel,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import '../common/common_toggle.css'
import '../common/common_styels.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { LoginHistoryEntry } from '../../types/login_history';

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Props = {
  data: LoginHistoryEntry[];
  pagination: PaginationMeta | null;
  limit: number;
  filters: {
    email: string;
    name: string;
    status: string;
    fromDate: string;
    toDate: string;
  };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
};

function LoginHistoryTable({
  data,
  pagination,
  limit,
  filters,
  onPageChange,
  onLimitChange,
  onFilterChange,
  onReset,
}: Props) {

  const [sorting, setSorting] = useState<SortingState>([]);

  // ---- Name typeahead state ----
  const [nameQuery, setNameQuery] = useState(filters.name || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameWrapperRef = useRef<HTMLDivElement>(null);
  const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // keep nameQuery in sync if parent resets filters
  useEffect(() => {
    if (!filters.name) setNameQuery('');
  }, [filters.name]);

  const uniqueNames = useMemo(() => {
    const names = new Set<string>();
    data.forEach((entry) => { if (entry.name) names.add(entry.name); });
    return Array.from(names).sort();
  }, [data]);

  const nameSuggestions = useMemo(() => {
    if (!nameQuery.trim()) return [];
    const q = nameQuery.toLowerCase();
    return uniqueNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 8);
  }, [nameQuery, uniqueNames]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nameWrapperRef.current && !nameWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectName = (name: string) => {
    setNameQuery(name);
    setShowSuggestions(false);
    onFilterChange('name', name);
  };

  const handleClearName = () => {
    setNameQuery('');
    setShowSuggestions(false);
    onFilterChange('name', '');
  };

  const handleNameInput = (value: string) => {
    setNameQuery(value);
    setShowSuggestions(true);
    if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current);
    nameDebounceRef.current = setTimeout(() => {
      onFilterChange('name', value);
    }, 400);
  };
  // ---- end name typeahead ----

  const columns = useMemo<ColumnDef<LoginHistoryEntry>[]>(() => [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => row.original.name || '-',
      enableSorting: false,
    },
    {
      header: 'Email',
      accessorKey: 'email',
      enableSorting: false,
    },
    {
      header: 'IP Address',
      accessorKey: 'ip',
      enableSorting: false,
    },
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
      enableSorting: true,
      sortingFn: 'datetime',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`badge ${row.original.status === "success" ? "bg-success" : "bg-danger"}`}>
          {row.original.status}
        </span>
      ),
      enableSorting: false,
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: ({ row }) => row.original.reason || '-',
      enableSorting: false,
    },
  ], []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    manualPagination: true,
    manualFiltering: true,
  });

  const startRow = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const endRow = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  return (
    <div className='container px-2 w-100'>

      {/* Filters — same layout as your screenshot */}
      <div className="d-flex flex-wrap justify-content-between gap-1 mb-3 mt-2 p-2">

        <div className='d-flex gap-md-1 flex-wrap'>

          {/* Per page */}
          <div>
            <label className="form-label d-block mb-1">per page</label>
            <select
              className="form-select"
              style={{ minWidth: "90px" }}
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Name typeahead */}
          <div ref={nameWrapperRef} style={{ position: 'relative', minWidth: "200px" }}>
            <label className="form-label d-block mb-1">Search name</label>
            <div className="d-flex position-relative">
              <input
                type="text"
                className="form-control"
                value={nameQuery}
                onChange={(e) => handleNameInput(e.target.value)}
                onFocus={() => { if (nameQuery) setShowSuggestions(true); }}
                placeholder="Type a name..."
              />
              {filters.name && (
                <button
                  className="btn btn-outline-secondary border-0 position-absolute"
                  style={{ right: 0, top: 0, height: '100%' }}
                  onClick={handleClearName}
                  title="Clear name filter"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

            {showSuggestions && nameSuggestions.length > 0 && (
              <ul className="list-group" style={{ position: 'absolute', zIndex: 1000, width: '100%', maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                {nameSuggestions.map((name) => (
                  <li key={name} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }} onClick={() => handleSelectName(name)}>
                    {name}
                  </li>
                ))}
              </ul>
            )}

            {showSuggestions && nameQuery.trim() && nameSuggestions.length === 0 && (
              <ul className="list-group" style={{ position: 'absolute', zIndex: 1000, width: '100%', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                <li className="list-group-item text-muted">No matching names</li>
              </ul>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="form-label d-block mb-1">status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Date range + Reset */}
          <div className='d-block d-md-flex gap-md-3'>
            <div>
              <label className="form-label d-block mb-1">From</label>
              <input
                type="date"
                className="form-control"
                value={filters.fromDate}
                onChange={(e) => onFilterChange('fromDate', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label d-block mb-1">To</label>
              <input
                type="date"
                className="form-control"
                value={filters.toDate}
                onChange={(e) => onFilterChange('toDate', e.target.value)}
              />
            </div>
            <button className="btn btn-secondary btn-md align-self-end" onClick={onReset}>
              Reset
            </button>
          </div>
        </div>

        {/* Email search */}
        <div>
          <label className="form-label d-block mb-1">Search email</label>
          <input
            type="text"
            className="form-control"
            style={{ minWidth: "200px" }}
            value={filters.email}
            placeholder="Search email..."
            onChange={(e) => onFilterChange('email', e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card-body table-responsive px-0" style={{ minHeight: "520px", overflowX: "auto" }}>
        <table className="table table-hover align-middle mb-0">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer" : ""}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="ms-1 fw-bold">
                        {{ asc: "▲", desc: "▼" }[header.column.getIsSorted() as string] ?? "⇅"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={row.original.status === "failed" ? "table-danger" : ""}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted">
                  No login history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — same style as your screenshot */}
      <div className='d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3'>
        <span>
          Showing {startRow} to {endRow} of {pagination?.total ?? 0} entries
        </span>
        <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(1)} disabled={!pagination?.hasPrev}>
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>
          <button className='btn btn-outline-secondary btn-sm' onClick={() => onPageChange((pagination?.page ?? 1) - 1)} disabled={!pagination?.hasPrev}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          <button className="btn btn-secondary btn-sm" style={{ minWidth: "36px" }}>
            {pagination?.page ?? 1}
          </button>
          <button className='btn btn-outline-secondary btn-sm' onClick={() => onPageChange((pagination?.page ?? 1) + 1)} disabled={!pagination?.hasNext}>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(pagination?.totalPages ?? 1)} disabled={!pagination?.hasNext}>
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginHistoryTable;