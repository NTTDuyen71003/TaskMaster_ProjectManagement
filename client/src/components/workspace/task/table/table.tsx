import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Search } from "lucide-react";
import TableSkeleton from "@/components/skeleton-loaders/table-skeleton";
import { DataTablePagination } from "./table-pagination";
import { useTranslation } from "react-i18next";
import ProjectHeader from "../../project/project-header";

interface PaginationProps {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  filtersToolbar?: React.ReactNode;
  pagination?: PaginationProps;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  filtersToolbar,
  pagination,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const { totalCount = 0, pageNumber = 1, pageSize = 10 } = pagination || {};
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnSearchTerm, setColumnSearchTerm] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex: pageNumber - 1, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });


  return (
    <div>
      {/* Header table */}
      <div className="flex flex-wrap items-start gap-2">
        {filtersToolbar && (
          <div className="flex flex-wrap gap-2">
            {filtersToolbar}
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="column">
              <Filter className="h-4 w-4" />
              {t("taskboard-column")} <ChevronDown className="opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder={t("taskboard-search-column")}
                  value={columnSearchTerm}
                  onChange={(e) => setColumnSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .filter((column) =>
                  column.id.toLowerCase().includes(columnSearchTerm.toLowerCase())
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {t(`taskboard-column-${column.id.toLowerCase()}`)}
                    </DropdownMenuCheckboxItem>
                  );
                })}

              {/* No results message */}
              {columnSearchTerm &&
                table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .filter((column) =>
                    column.id.toLowerCase().includes(columnSearchTerm.toLowerCase())
                  ).length === 0 && (
                  <div className="p-2 text-sm text-muted text-center">
                    {t("taskboard-search-column-notfound")}
                  </div>
                )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task table */}
      <div className="row ">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body bg-sidebar">
              {/* Title and create task button */}
              <ProjectHeader/>

              <div className="table-responsive">
                {isLoading ? (
                  <TableSkeleton columns={7} rows={10} />
                ) : (
                  <table className="table">
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            return (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableHeader>

                    {<TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            {t("taskboard-noresult")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>}
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <DataTablePagination
        table={table}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

    </div>
  );
}