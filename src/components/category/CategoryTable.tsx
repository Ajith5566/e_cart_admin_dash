import { useEffect, useMemo, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel } from '@tanstack/react-table'
import type { ColumnDef } from "@tanstack/react-table";
import type { CategoryResponse } from '../../types/types';
import '../common/common_toggle.css'
import '../common/common_styels.css'

type Props = {
    data: CategoryResponse[];
    onEdit: (category: CategoryResponse) => void;
    onToggle: (id: string) => void;
    limit: number;
};
function CategoryTable({ data, onEdit, onToggle, limit }: Props) {

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: limit
    })

    //rendering table
    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,      // reset to first page (important)
            pageSize: limit,
        }));
    }, [limit]);

    const columns = useMemo<ColumnDef<CategoryResponse>[]>(() => [
        {
            header: 'Category',
            accessorKey: 'name'
        },
        {
            header: 'Parent Category',
            accessorKey: "parent_category"
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
        },
    ], [onEdit, onToggle])
    /*     [
      {
        adminId: "694a3c3be6be07cb5c80a762",
        name: "cars cat",
        parent_category: "toys",
        shortDescription: "toy car is good",
        description: "<p>qdqfqe <strong>dqwd</strong></p>",
        isActive: true,
        createdAt: "2026-03-17T05:29:07.583Z",
        updatedAt: "2026-03-20T10:53:24.804Z",
        _id: "69b8e6a355058e"
      }
    ] */

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { pagination },
        onPaginationChange: setPagination,
        pageCount: Math.ceil(data.length / pagination.pageSize)
    })
    return (
        <div className='container w-100'>
            <div className="card-body table-responsive" >
                <table className="table table-hover align-middle mb-0">
                    <thead>
                        {
                            table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {
                                        headerGroup.headers.map(header => (
                                            <th key={header.id}>
                                                {
                                                    flexRender(header.column.columnDef.header, header.getContext())
                                                }
                                            </th>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </thead>
                    <tbody>
                        {
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="tableRowHeight">
                                    {
                                        row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap">
                <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    ◀
                </button>
                <span>
                    page{table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    ▶
                </button>
            </div>
        </div>
    )
}

export default CategoryTable