// components/careers/CareerTable.tsx — selection + bulk delete + fixed # column
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState, RowSelectionState } from "@tanstack/react-table";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import type { CareerResponse, CareerStatus } from "../../types/careerTypes";

type Props = {
  data: CareerResponse[];
  onView: (application: CareerResponse) => void;
  onDelete: (id: string) => void;
  // ✅ bulk delete — receives the selected ids
  onBulkDelete: (ids: string[]) => Promise<void> | void;
};

const STATUS_BADGE: Record<CareerStatus, string> = {
  new: "bg-primary",
  shortlisted: "bg-warning text-dark",
  hired: "bg-success",
  rejected: "bg-secondary",
};

function IndeterminateCheckbox({
  indeterminate,
  ...rest
}: { indeterminate?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = !rest.checked && !!indeterminate;
    }
  }, [indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className="form-check-input"
      style={{ cursor: "pointer" }}
      {...rest}
    />
  );
}

function CareerTable({ data, onView, onDelete, onBulkDelete }: Props) {
  const [limit, setLimit] = useState(5);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: limit,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [filtering, setFiltering] = useState("");

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
      pageSize: limit,
    }));
  }, [limit]);

  const columns = useMemo<ColumnDef<CareerResponse>[]>(
    () => [
      // ✅ SELECTION COLUMN
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <div className="d-flex align-items-center gap-1">
            <IndeterminateCheckbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              aria-label="Select all applications"
            />
            <span>All</span>
          </div>
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select ${row.original.name}`}
          />
        ),
      },
      // ✅ FIXED serial column — position in the DISPLAYED order,
      // not row.index (which is the original data order and goes
      // 3,1,5,4,10 after sorting)
      {
        header: "#",
        id: "serialNumber",
        enableSorting: false,
        cell: ({ row, table }) => {
          const visibleRows = table.getRowModel().rows;
          const indexOnPage = visibleRows.findIndex((r) => r.id === row.id);
          return (
            table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
            indexOnPage +
            1
          );
        },
      },
      {
        header: "Name",
        accessorKey: "name",
        enableSorting: true,
        cell: ({ row }) => (
          <span className={row.original.isRead ? "" : "fw-bold"}>
            {row.original.name}
          </span>
        ),
      },
      {
        header: "Position",
        accessorKey: "jobTitle",
        enableSorting: true,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableSorting: false,
      },
      {
        header: "Status",
        accessorKey: "status",
        enableSorting: true,
        cell: ({ row }) => (
          <span
            className={`badge ${STATUS_BADGE[row.original.status] ?? "bg-secondary"}`}
            style={{ textTransform: "capitalize" }}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        header: "View",
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-warning"
            onClick={() => onView(row.original)}
          >
            view
          </button>
        ),
        enableSorting: false,
      },
      {
        header: "Delete",
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(row.original._id)}
          >
            delete
          </button>
        ),
        enableSorting: false,
      },
    ],
    [onView, onDelete]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row._id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination, sorting, globalFilter: filtering, rowSelection },
    onPaginationChange: setPagination,
    pageCount: Math.ceil(data.length / pagination.pageSize),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setFiltering,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    autoResetPageIndex: false,
  });

  // drop selections whose rows no longer exist
  useEffect(() => {
    setRowSelection((prev) => {
      const validIds = new Set(data.map((d) => d._id));
      const next: RowSelectionState = {};
      for (const id of Object.keys(prev)) {
        if (validIds.has(id)) next[id] = true;
      }
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [data]);

  const selectedIds = Object.keys(rowSelection);
  const selectedCount = selectedIds.length;

  const runBulk = async (fn: () => Promise<void> | void) => {
    try {
      setBulkBusy(true);
      await fn();
      table.resetRowSelection();
    } finally {
      setBulkBusy(false);
    }
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="container px-2 w-100">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3 mt-2 p-2">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100 w-md-auto">
          <select
            className="form-select"
            style={{ minWidth: "90px", maxWidth: "120px" }}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries per page</span>
        </div>

        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end align-items-start align-items-sm-center p-0 w-100 w-md-auto">
          <h6>Search:</h6>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "250px", width: "100%" }}
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
            placeholder="searching..."
          />
        </div>
      </div>

      {/* ✅ BULK ACTION BAR */}
      {selectedCount > 0 && (
        <div
          className="d-flex align-items-center gap-2 px-3 py-2 mb-2 flex-wrap"
          style={{ background: "#eef2ff", borderRadius: "10px" }}
        >
          <span className="fw-medium me-1" style={{ fontSize: "14px" }}>
            {selectedCount} selected
          </span>

          <button
            className="btn btn-sm btn-danger"
            disabled={bulkBusy}
            onClick={() => runBulk(() => onBulkDelete(selectedIds))}
          >
            Delete selected
          </button>

          <button
            className="btn btn-sm btn-outline-secondary ms-auto"
            disabled={bulkBusy}
            onClick={() => table.resetRowSelection()}
          >
            Clear
          </button>
        </div>
      )}

      <div
        className="card-body table-responsive px-0"
        style={{ minHeight: "520px", overflowX: "auto" }}
      >
        <table className="table table-hover align-middle mb-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer" : ""}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="ms-1 fw-bold">
                        {{
                          asc: "▲",
                          desc: "▼",
                        }[header.column.getIsSorted() as string] ?? "⇅"}
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
                <tr
                  key={row.id}
                  className="tableRowHeight"
                  style={row.getIsSelected() ? { background: "#f0f4ff" } : undefined}
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
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">
        <span className="text-center text-md-start">
          Showing {startRow} to {endRow} of {totalRows} entries
        </span>
        <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>

          <button className="btn btn-secondary btn-sm">
            {table.getState().pagination.pageIndex + 1}
          </button>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CareerTable;