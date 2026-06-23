/* eslint-disable @typescript-eslint/no-unused-vars */
// LoginHistoryTable.tsx
import { useMemo, useState, useRef, useEffect } from 'react'
import {
  useReactTable, getCoreRowModel, flexRender,
  getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState, ColumnFiltersState } from "@tanstack/react-table";
import '../common/common_toggle.css'
import '../common/common_styels.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { LoginHistoryEntry } from '../../types/login_history';


type Props = {
  data: LoginHistoryEntry[];
};

function LoginHistoryTable({ data }: Props) {

  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: limit });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filtering, setFiltering] = useState('');           // global search (email)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ---- Name typeahead state ----
  const [nameQuery, setNameQuery] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameWrapperRef = useRef<HTMLDivElement>(null);

  const uniqueNames = useMemo(() => {
    const names = new Set<string>();
    data.forEach((entry) => {
      if (entry.name) names.add(entry.name);
    });
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
    setSelectedName(name);
    setNameQuery(name);
    setShowSuggestions(false);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearNameFilter = () => {
    setSelectedName(null);
    setNameQuery('');
    setShowSuggestions(false);
  };
  // ---- end name typeahead state ----

  const columns = useMemo<ColumnDef<LoginHistoryEntry>[]>(() => [
     {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => row.original.name || '-',
      enableSorting: false,
      // exact-match filter, driven by selectedName
      filterFn: (row, columnId, _filterValue) => {
        if (!selectedName) return true;
        return row.getValue(columnId) === selectedName;
      },
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
      // custom filter for date range, driven by fromDate/toDate state below
      filterFn: (row, columnId, _filterValue) => {
        const ts = new Date(row.getValue(columnId) as string).getTime();
        if (fromDate && ts < new Date(fromDate).getTime()) return false;
        if (toDate && ts > new Date(toDate).getTime() + 86400000) return false; // include full "to" day
        return true;
      },
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
      filterFn: 'equals',
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: ({ row }) => row.original.reason || '-',
      enableSorting: false,
    },
  ], [fromDate, toDate, selectedName]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination, sorting, globalFilter: filtering, columnFilters },
    onPaginationChange: setPagination,
    pageCount: Math.ceil(data.length / pagination.pageSize),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setFiltering,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _columnId, filterValue) => {
      // search across email only (case-insensitive)
      return row.original.email.toLowerCase().includes(filterValue.toLowerCase());
    },
    autoResetPageIndex: false,
  });

  // re-run the "name" column's filter whenever selectedName changes
  useEffect(() => {
    table.getColumn('name')?.setFilterValue(selectedName ?? undefined);
  }, [selectedName, table]);

  const statusColumn = table.getColumn('status');
  const timestampColumn = table.getColumn('timestamp');

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  const handleResetFilters = () => {
    setFiltering('');
    setFromDate('');
    setToDate('');
    handleClearNameFilter();
    statusColumn?.setFilterValue(undefined);
  };

  return (
    <div className='container px-2 w-100'>

      {/* Filters */}
      <div className="d-flex flex-wrap justify-content-between gap-1 mb-3 mt-2 p-2">

        <div className='d-flex gap-md-1 flex-wrap'>
          <div>
            <label className="form-label d-block mb-1">per page</label>
            <select
              className="form-select"
              style={{ minWidth: "90px" }}
              value={limit}
              onChange={(e) => {
                const v = Number(e.target.value);
                setLimit(v);
                setPagination((prev) => ({ ...prev, pageIndex: 0, pageSize: v }));
              }}
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
            <div className="d-flex">
              <input
                type="text"
                className="form-control "
                value={nameQuery}
                onChange={(e) => {
                  setNameQuery(e.target.value);
                  setShowSuggestions(true);
                  if (selectedName && e.target.value !== selectedName) {
                    setSelectedName(null); // typing again clears a locked-in filter
                  }
                }}
                onFocus={() => { if (nameQuery) setShowSuggestions(true); }}
                placeholder="Type a name..."
              />
              {selectedName && (
                <button
                  className="btn btn-outline-secondary border-0 position-absolute "
                  style={{ marginLeft: '4px' ,right:'0' }}
                  onClick={handleClearNameFilter}
                  title="Clear name filter"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

            {showSuggestions && nameSuggestions.length > 0 && (
              <ul
                className="list-group"
                style={{
                  position: 'absolute',
                  zIndex: 1000,
                  width: '100%',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                }}
              >
                {nameSuggestions.map((name) => (
                  <li
                    key={name}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSelectName(name)}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}

            {showSuggestions && nameQuery.trim() && nameSuggestions.length === 0 && (
              <ul
                className="list-group"
                style={{ position: 'absolute', zIndex: 1000, width: '100%', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
              >
                <li className="list-group-item text-muted">No matching names</li>
              </ul>
            )}
          </div>

          <div>
            <label className="form-label d-block mb-1">status</label>
            <select
              className="form-select"
              value={(statusColumn?.getFilterValue() as string) ?? ''}
              onChange={(e) => statusColumn?.setFilterValue(e.target.value || undefined)}
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

        <div className='d-block d-md-flex gap-md-3'>
            <div>
              <label className="form-label d-block mb-1">From</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  timestampColumn?.setFilterValue(e.target.value); // triggers re-filter
                }}
              />
            </div>
    
            <div>
              <label className="form-label d-block mb-1">To</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  timestampColumn?.setFilterValue(e.target.value);
                }}
              />
            </div>
    
            <button className="btn btn-secondary btn-md align-self-end" onClick={handleResetFilters}>
              Reset
            </button>
        </div>
        </div>

        <div>
          <label className="form-label d-block mb-1">Search email</label>
          <input
            type="text"
            className="form-control"
            style={{ minWidth: "200px" }}
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
            placeholder="Search email..."
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
                  <th key={header.id}
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
                <tr key={row.id}
                  className={row.original.status === "failed" ? "table-danger" : ""}
                >
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

      {/* Pagination */}
      <div className='d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3'>
        <span>Showing {startRow} to {endRow} of {totalRows} entries</span>
        <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>
          <button className='btn btn-outline-secondary btn-sm' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          <button className="btn btn-secondary btn-sm">
            {table.getState().pagination.pageIndex + 1}
          </button>
          <button className='btn btn-outline-secondary btn-sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginHistoryTable