import { useEffect, useMemo, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type {  fetchedProducts } from '../../types/types';
import '../common/common_toggle.css';
import '../common/common_styels.css';
import styles from "./adminProduct.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../../services/baseURL';

type Props = {
    data: fetchedProducts[];
    onEdit: (product: fetchedProducts) => void;
    onDelete:(id:string)=>void;
};
function ProductTable({ data, onEdit ,onDelete}: Props) {


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

    const columns = useMemo<ColumnDef<fetchedProducts>[]>(() => [
         {
    header: "Image",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <img
          src={
            item.images?.length
              ? `${BASE_URL}/uploads/${item.images[0]}`
              : "/no-image.png"
          }
          className={styles.tableImg}
          alt={item.productName}
        />
      );
    },
    enableSorting: false,
  },
        {
            header: 'Name',
            accessorKey: 'productName',
            enableSorting: true,   // ✅ only this column sortable
        },
        {
            header: 'Quantity',
            accessorKey: "quantity",
            enableSorting: false,   // ✅ only this column sortable
        },
        {
            header: 'Quantity',
            accessorKey: "quantity",
            enableSorting: false,   // ✅ only this column sortable
        },
        {
            header: 'Price',
            accessorKey: "price",
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
    ], [onEdit,onDelete])
    /*  {
  {
  adminId: "...",
  createdAt: "...",
  description: "...",
  images: [...],
  price: "5004",
  productName: "car",
  quantity: "300",
  shortDescription: "...",
  updatedAt: "..."
}
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
        <div className='container w-100'>

            <div className="d-flex justify-content-between align-items-center mb-3 mt-3 p-3">
                {/*  <PaginationLimit limit={limit} onChange={(newLimit) => { setLimit(newLimit); setPage(1); }} /> */}
                <div className="d-flex align-items-center gap-2">

                    <select
                        className="form-select"
                        style={{ width: "100px" }}
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

                <div className="d-flex gap-2 justify-content-center align-items-center p-2">
                    <h6>Search:</h6>

                    <input type="text"
                        className="form-control"
                        style={{ maxWidth: 250 }}
                        value={filtering}
                        onChange={(e) => setFiltering(e.target.value)}
                        placeholder='searching...'
                    />
                </div>
            </div>
            <div className="card-body table-responsive" style={{ minHeight: "520px" }} >
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
                                    No Product found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className='d-flex justify-content-between'>
                <span>
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

export default ProductTable