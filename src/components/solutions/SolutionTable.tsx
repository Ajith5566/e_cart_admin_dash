// components/caseStudy/SolutionTable.tsx — drag-and-drop row reorder
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft, faAngleRight,
  faAnglesLeft, faAnglesRight,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";

import type { SolutionResponse } from "../../types/solutionTypes";
import { updateSolutionOrderApi } from "../../services/allAPi";
import { toast } from "react-toastify";

type Props = {
  data: SolutionResponse[];
  onDataReorder: (reordered: SolutionResponse[]) => void;
  onEdit: (solution: SolutionResponse) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canToggle: boolean;
  canDelete: boolean;
  onBulkDelete: (ids: string[]) => Promise<void> | void;
  onBulkToggle: (ids: string[], isActive: boolean) => Promise<void> | void;
};

function IndeterminateCheckbox({
  indeterminate,
  ...rest
}: { indeterminate?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !rest.checked && !!indeterminate;
  }, [indeterminate, rest.checked]);
  return (
    <input type="checkbox" ref={ref} className="form-check-input"
      style={{ cursor: "pointer" }} {...rest} />
  );
}

// ── Sortable row — wraps each TR with dnd-kit ─────────────────
function SortableRow({
  id,
  isSelected,
  children,
}: {
  id: string;
  isSelected: boolean;
  children: (listeners: object, attributes: object) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <tr
      ref={setNodeRef}
      className="tableRowHeight"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? "#eef2ff" : isSelected ? "#f0f4ff" : undefined,
      }}
    >
      {children(listeners ?? {}, attributes)}
    </tr>
  );
}

function SolutionTable({
  data,
  onDataReorder,
  onEdit, onToggle, onDelete,
  canEdit, canToggle, canDelete,
  onBulkDelete, onBulkToggle,
}: Props) {
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: limit });
  const [filtering, setFiltering] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkBusy, setBulkBusy] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderedData, setOrderedData] = useState(data);

  useEffect(() => { setOrderedData(data); }, [data]);
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0, pageSize: limit }));
  }, [limit]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = orderedData.findIndex((d) => d._id === active.id);
      const newIndex = orderedData.findIndex((d) => d._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(orderedData, oldIndex, newIndex);
      setOrderedData(reordered);

      try {
        setSavingOrder(true);
        await updateSolutionOrderApi(
          reordered.map((s, index) => ({ id: s._id, displayOrder: index }))
        );
        onDataReorder(reordered);
        toast.success("Order saved");
      } catch {
        toast.error("Failed to save order");
        setOrderedData(data); // revert
      } finally {
        setSavingOrder(false);
      }
    },
    [orderedData, data, onDataReorder]
  );

  const columns = useMemo<ColumnDef<SolutionResponse>[]>(() => [
    // drag handle placeholder column — actual handle rendered in SortableRow render prop
    { id: "drag", enableSorting: false, header: () => <span style={{ color: "#bbb" }}><FontAwesomeIcon icon={faGripVertical} /></span>, cell: () => null },
    {
      id: "select",
      enableSorting: false,
      header: ({ table }) => (
        <div className="d-flex align-items-center gap-1">
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Select all"
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
    {
      header: "#",
      id: "serialNumber",
      enableSorting: false,
      cell: ({ row, table }) => {
        const i = table.getRowModel().rows.findIndex((r) => r.id === row.id);
        return table.getState().pagination.pageIndex * table.getState().pagination.pageSize + i + 1;
      },
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: false, // ⬅ drag order replaces column sort
    },
    {
      header: "Edit",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className="btn btn-sm btn-warning"
          onClick={() => onEdit(row.original)}
          disabled={!canEdit}
          title={!canEdit ? "No permission" : undefined}
        >
          Edit
        </button>
      ),
    },
    {
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <label className="toggle-switch">
          <input
            className="toggle-input"
            type="checkbox"
            checked={!!row.original.isActive}
            disabled={!canToggle}
            onChange={() => onToggle(row.original._id)}
          />
          <span className="toggle-slider"></span>
        </label>
      ),
    },
    {
      header: "Delete",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(row.original._id)}
          disabled={!canDelete}
          title={!canDelete ? "No permission" : undefined}
        >
          delete
        </button>
      ),
    },
  ], [onEdit, onToggle, onDelete, canEdit, canToggle, canDelete]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: orderedData,
    columns,
    getRowId: (row) => row._id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination, globalFilter: filtering, rowSelection },
    onPaginationChange: setPagination,
    pageCount: Math.ceil(orderedData.length / pagination.pageSize),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setFiltering,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    autoResetPageIndex: false,
  });

  useEffect(() => {
    setRowSelection((prev) => {
      const validIds = new Set(orderedData.map((d) => d._id));
      const next: RowSelectionState = {};
      for (const id of Object.keys(prev)) if (validIds.has(id)) next[id] = true;
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [orderedData]);

  const selectedIds = Object.keys(rowSelection);
  const selectedCount = selectedIds.length;
  const rowIds = table.getRowModel().rows.map((r) => r.id);

  const runBulk = async (fn: () => Promise<void> | void) => {
    try { setBulkBusy(true); await fn(); table.resetRowSelection(); }
    finally { setBulkBusy(false); }
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
            {[5, 10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>entries per page</span>
          {savingOrder && (
            <span className="text-muted ms-2" style={{ fontSize: "13px" }}>
              <span className="spinner-border spinner-border-sm me-1" role="status" />
              Saving order...
            </span>
          )}
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end align-items-start align-items-sm-center p-0 w-100 w-md-auto">
          <h6 className="mb-0">Search:</h6>
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

      {/* BULK BAR */}
      {selectedCount > 0 && (
        <div className="d-flex align-items-center gap-2 px-3 py-2 mb-2 flex-wrap"
          style={{ background: "#eef2ff", borderRadius: "10px" }}>
          <span className="fw-medium me-1" style={{ fontSize: "14px" }}>
            {selectedCount} selected
          </span>
          {canToggle && (
            <>
              <button className="btn btn-sm btn-outline-dark" disabled={bulkBusy}
                onClick={() => runBulk(() => onBulkToggle(selectedIds, false))}>
                Deactivate selected
              </button>
              <button className="btn btn-sm btn-outline-success" disabled={bulkBusy}
                onClick={() => runBulk(() => onBulkToggle(selectedIds, true))}>
                Activate selected
              </button>
            </>
          )}
          {canDelete && (
            <button className="btn btn-sm btn-danger" disabled={bulkBusy}
              onClick={() => runBulk(() => onBulkDelete(selectedIds))}>
              Delete selected
            </button>
          )}
          <button className="btn btn-sm btn-outline-secondary ms-auto" disabled={bulkBusy}
            onClick={() => table.resetRowSelection()}>
            Clear
          </button>
        </div>
      )}

      <p className="text-muted mb-2" style={{ fontSize: "12px" }}>
        <FontAwesomeIcon icon={faGripVertical} className="me-1" />
        Drag rows to reorder — saves automatically
      </p>

      <div className="card-body table-responsive px-0" style={{ minHeight: "400px", overflowX: "auto" }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
          <table className="table table-hover align-middle mb-0">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <SortableRow key={row.id} id={row.id} isSelected={row.getIsSelected()}>
                      {(listeners, attributes) => (
                        <>
                          <td style={{ width: "36px" }}>
                            <span {...(listeners as object)} {...(attributes as object)}
                              style={{ cursor: "grab", color: "#bbb", padding: "0 4px" }}>
                              <FontAwesomeIcon icon={faGripVertical} />
                            </span>
                          </td>
                          {row.getVisibleCells()
                            .filter((c) => c.column.id !== "drag")
                            .map((cell) => (
                              <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                        </>
                      )}
                    </SortableRow>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center text-muted">
                      No solutions found
                    </td>
                  </tr>
                )}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">
        <span className="text-center text-md-start">
          Showing {startRow} to {endRow} of {totalRows} entries
        </span>
        <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm"
            onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>
          <button className="btn btn-outline-secondary btn-sm"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          <button className="btn btn-secondary btn-sm">
            {table.getState().pagination.pageIndex + 1}
          </button>
          <button className="btn btn-outline-secondary btn-sm"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button className="btn btn-outline-secondary btn-sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}>
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SolutionTable;