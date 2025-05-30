import React, { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";


// Mock table interface
const mockTable = {
  getState: () => ({ pagination: { pageIndex: 0, pageSize: 10 } }),
  setPageSize: () => { },
  setPageIndex: () => { },
};

interface DataTablePaginationProps {
  table?: any;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTablePagination({
  table = mockTable,
  pageNumber = 1,
  pageSize = 10,
  totalCount = 150,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const pageCount = Math.ceil(totalCount / pageSize);

  const handlePageSizeChange = (size: number) => {
    table.setPageSize(size);
    onPageSizeChange?.(size);
    setIsOpen(false);
  };

  const handlePageChange = (page: number) => {
    table.setPageIndex(page - 1);
    onPageChange?.(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (pageCount <= maxVisible) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      if (pageNumber <= 3) {
        pages.push(1, 2, 3, 4, '...', pageCount);
      } else if (pageNumber >= pageCount - 2) {
        pages.push(1, '...', pageCount - 3, pageCount - 2, pageCount - 1, pageCount);
      } else {
        pages.push(1, '...', pageNumber - 1, pageNumber, pageNumber + 1, '...', pageCount);
      }
    }

    return pages;
  };

  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // Define available page size options
  const pageSizeOptions = [10, 20, 30, 50, 100];


  return (
    <div className="bg-sidebar rounded-lg shadow-sm">
      {/* Header with summary info */}
      <div className="px-6 py-4 bg-sidebar">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* Left: Display rows */}
          <div className="inline-flex items-center gap-3 p-3 flex-wrap bg-dropdown-hover-bg rounded-lg border border-sidebar-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted">{t("taskboard-displayrows")}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-sidebar border border-sidebar-border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm transition-all cursor-pointer min-w-[80px] justify-between"
              >
                <span>{pageSize}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-sidebar border border-sidebar-border rounded-md shadow-lg z-10 min-w-full">
                  {pageSizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => handlePageSizeChange(size)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer first:rounded-t-md last:rounded-b-md ${size === pageSize
                        ? 'bg-dropdown-hover-bg text-sidebar-text'
                        : 'text-muted hover:bg-dropdown-hover-bg hover:text-sidebar-text'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Pagination */}
          <div className="flex flex-wrap items-center gap-1 overflow-x-auto sm:overflow-visible">

            {/* First page - hidden on mobile */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={pageNumber === 1}
              className="h-9 w-9 text-muted disabled:opacity-50 hidden sm:flex"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            {/* Previous */}
            <Button
              variant="outline"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber === 1}
              className="h-9 px-2 sm:px-3 text-muted disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline">{t("taskboard-previous")}</span>
            </Button>

            {/* Page numbers – visible on all screens */}
            <div className="flex items-center gap-1 mx-2">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <div className="flex items-center justify-center w-9 h-9 text-muted">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  ) : (
                    <Button
                      variant={page === pageNumber ? "default" : "ghost"}
                      size="icon"
                      onClick={() => handlePageChange(page as number)}
                      className={`h-9 w-9 ${page === pageNumber
                        ? "bg-sidebar-frameicon text-white"
                        : "text-sidebar-text hover:bg-dropdown-hover-bg"
                        }`}
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next */}
            <Button
              variant="outline"
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= pageCount}
              className="h-9 px-2 sm:px-3 text-muted disabled:opacity-50"
            >
              <span className="hidden sm:inline">{t("taskboard-after")}</span>
              <ChevronRight className="w-4 h-4 ml-0 sm:ml-1" />
            </Button>

            {/* Last page - hidden on mobile */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pageCount)}
              disabled={pageNumber >= pageCount}
              className="h-9 w-9 text-muted disabled:opacity-50 hidden sm:flex"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
