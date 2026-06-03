import { useEffect, useMemo, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type {  PageType } from '../../types/types';
import '../common/common_toggle.css'
import '../common/common_styels.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';

type Props = {
    data: PageType[];
    onEdit: (page: PageType) => void;
    onToggle: (id: string) => void;
    onDelete:(id:string)=>void;
};
function PageTable({ data, onEdit, onToggle ,onDelete}: Props) {


    const [limit, setLimit] = useState(5)


    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: limit
    })

    const [sorting, setSorting] = useState<SortingState>([]);
    const [filtering, setFiltering] = useState('');

    //rendering table
    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,      // reset to first page (important)
            pageSize: limit,
        }));
    }, [limit]);

    const columns = useMemo<ColumnDef<PageType>[]>(() => [
        {
            header: 'Title',
            accessorKey: 'title',
            enableSorting: true,   // ✅ only this column sortable
        },
        {
            header: 'Slug',
            accessorKey: "slug",
            enableSorting: false,   // ✅ only this column sortable
        },
        {
            header: "Edit",
            cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-warning"
                    onClick={() => onEdit(row.original)}
                >
                    Edit
                </button>
            ),
            enableSorting: false,
        }, {
            header: "Status",
            cell: ({ row }) => (
                <label className="toggle-switch">
                    <input
                        className="toggle-input"
                        type="checkbox"
                        checked={!!row.original.isActive}
                        onChange={() => onToggle(row.original._id)}
                    />
                    <span className="toggle-slider"></span>
                </label>
            ),
            enableSorting: false,
        },{
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
    ], [onEdit, onToggle,onDelete])
    /*  {
  "_id": "696dc7a4caa9df61301b6686",
  "title": "Rental policy",
  "slug": "rental-policy",
  "shortDescription": "hai this is our rental policy",
  "description": "<p><span style=\"color: rgb(230, 0, 0);\">THE</span><strong style=\"color: rgb(230, 0, 0);\"> DAY</strong></p><ul><li><span style=\"color: rgb(0, 102, 204);\">dance</span></li><li>fight</li><li>do</li></ul>",
  "isActive": true,
  "createdAt": "2026-01-19T05:56:52.260Z",
  "updatedAt": "2026-02-10T12:17:31.687Z",
  "__v": 0
} */

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { pagination, sorting, globalFilter: filtering },
        onPaginationChange: setPagination,
        pageCount: Math.ceil(data.length / pagination.pageSize),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setFiltering,
        autoResetPageIndex: false,   // ⭐ THIS FIXES IT
    })

    //showing part
    const { pageIndex, pageSize } = table.getState().pagination;

    const totalRows = table.getFilteredRowModel().rows.length;

    const startRow = totalRows === 0
        ? 0
        : pageIndex * pageSize + 1;

    const endRow = Math.min(
        (pageIndex + 1) * pageSize,
        totalRows
    );
    return (
        <div className='container-fluid px-2 px-md-3 w-100'>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3 mt-3 p-2 p-md-3">
                {/*  <PaginationLimit limit={limit} onChange={(newLimit) => { setLimit(newLimit); setPage(1); }} /> */}
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

                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center align-items-start align-items-sm-center p-0 w-100 w-md-auto">
                    <h6>Search:</h6>

                    <input type="text"
                        className="form-control"
                        style={{
                            maxWidth: "250px",
                            width: "100%"
                        }}
                        value={filtering}
                        onChange={(e) => setFiltering(e.target.value)}
                        placeholder='searching...'
                    />
                </div>
            </div>
            <div className="card-body table-responsive px-0"
                style={{
                    minHeight: "520px",
                    overflowX: "auto"
                }} >
                <table className="table table-hover align-middle mb-0">
                    <thead>
                        {
                            table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} >
                                    {
                                        headerGroup.headers.map(header => (
                                            <th key={header.id} className={header.column.getCanSort() ? "cursor-pointer" : ""}
                                                onClick={
                                                    header.column.getCanSort()
                                                        ? header.column.getToggleSortingHandler()
                                                        : undefined
                                                }>
                                                {
                                                    flexRender(header.column.columnDef.header, header.getContext())
                                                }
                                                {header.column.getCanSort() && (
                                                    <span className="ms-1 fw-bold">
                                                        {{
                                                            asc: "▲",
                                                            desc: "▼",
                                                        }[header.column.getIsSorted() as string] ?? "⇅"}
                                                    </span>
                                                )}
                                            </th>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="tableRowHeight">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center text-muted">
                                    No Pages found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className='d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3'>
                <span  className="text-center text-md-start">
                    Showing {startRow} to {endRow} of {totalRows} entries
                </span>
                <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap">
                    {/* First */}
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <FontAwesomeIcon icon={faAnglesLeft} />
                    </button>
                    <button className='btn btn-outline-secondary btn-sm'
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </button>

                    {/* Page Numbers */}
                    <button className="btn btn-secondary btn-sm">
                        {table.getState().pagination.pageIndex + 1}
                    </button>


                    <button className='btn btn-outline-secondary btn-sm'
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                    {/* Last */}
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                    >
                        <FontAwesomeIcon icon={faAnglesRight} />
                    </button>

                </div>
            </div>
        </div>
    )
}

export default PageTable