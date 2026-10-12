import React, { useState, useMemo, useCallback } from 'react';
import {
  TableContainer as MuiTableContainer,
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  Popover,
  type TableContainerProps,
} from '@mui/material';
import {
  Search,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
  RotateCcw,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { usePos } from '../../context/PosContext';

export interface PosTableColumn<T = any> {
  id: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  render?: (row: T, index: number) => React.ReactNode;
  /**
   * Whether this column can be sorted.
   * If not specified, defaults to `true` when enableSorting is true (unless column id is 'actions' or 'manage').
   */
  sortable?: boolean;
  /**
   * Custom value extractor or property name for sorting and filtering.
   * E.g. (row) => row.user.name or 'price'
   */
  sortKey?: keyof T | ((row: T) => any);
  /**
   * Whether this column participates in filtering.
   * Defaults to `true` (unless column id is 'actions' or 'manage').
   */
  filterable?: boolean;
  /**
   * Custom filter function for this column.
   */
  filterFn?: (row: T, filterValue: any) => boolean;
  /**
   * Preset filter options for column-level filter dropdown.
   * If not provided, PosTable auto-extracts distinct values from the table data.
   */
  filterOptions?: Array<{ label: string; value: any }>;
  /**
   * Filter UI type for this column: 'select' (checklist) | 'text' (search input) | 'auto' (default)
   */
  filterType?: 'select' | 'text' | 'auto';
}

export interface PosTableContainerProps extends TableContainerProps {
  children: React.ReactNode;
  variant?: 'panel' | 'embedded';
  className?: string;
}

/**
 * Styled TableContainer component configured for yummy-pos theme.
 * - 'panel': Standalone floating liquid-glass card (used in Product / Sales history screens)
 * - 'embedded': Bordered transparent container (used when inside PosCard or Dialog)
 */
export const PosTableContainer: React.FC<PosTableContainerProps> = ({
  children,
  variant = 'embedded',
  className = '',
  sx,
  ...props
}) => {
  const { themeMode } = usePos();
  const isDark = themeMode === 'dark';

  const baseStyles =
    variant === 'panel'
      ? {
          backgroundColor: isDark ? 'rgba(21, 25, 34, 0.75)' : 'rgba(255, 255, 255, 0.82)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(235, 231, 223, 0.8)',
          borderRadius: '12px 12px 0 0',
          boxShadow: isDark
            ? '0 12px 36px -8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.08)'
            : '0 12px 36px -8px rgba(45, 55, 72, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
        }
      : {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          borderRadius: '0px !important',
          border: isDark ? '0px solid rgba(255, 255, 255, 0.08)' : '0px solid rgba(235, 231, 223, 0.9)',
        };

  return (
    <MuiTableContainer
      className={`${variant === 'panel' ? 'liquid-glass-panel' : ''} ${className}`.trim()}
      sx={{
        overflow: 'hidden',
        ...baseStyles,
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiTableContainer>
  );
};

export interface PosTableProps<T = any> {
  columns?: PosTableColumn<T>[];
  data?: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: React.ReactNode;
  minWidth?: number | string;
  variant?: 'panel' | 'embedded';
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string;
  className?: string;
  children?: React.ReactNode;

  // Sorting features
  enableSorting?: boolean;
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc' | null;
  onSortChange?: (columnId: string, direction: 'asc' | 'desc' | null) => void;

  // Filtering features
  enableFilter?: boolean;
  filterable?: boolean;
  enableColumnFilters?: boolean;
  enableColumnFilterRow?: boolean;
  filterPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (query: string) => void;
  customFilterFn?: (row: T, query: string, columns: PosTableColumn<T>[]) => boolean;
  filterExtraContent?: React.ReactNode;
  showFilterCount?: boolean;
  columnFilters?: Record<string, any>;
  onColumnFiltersChange?: (filters: Record<string, any>) => void;

  // Pagination features
  enablePagination?: boolean;
  pagination?: boolean;
  pageSize?: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;

  // Height & Fixed Layout configuration
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  fixedHeight?: boolean | number | string;
  sx?: any;
}

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
};

/**
 * Reusable full POS Table component with built-in Sorting, Advanced Column Filtering, and Pagination.
 * Supports Excel-style distinct value filtering, in-column text search, global search toolbar, and pagination.
 */
export function PosTable<T = any>({
  columns,
  data,
  keyExtractor = (_, idx) => idx,
  emptyMessage,
  minWidth = 650,
  variant = 'embedded',
  onRowClick,
  rowClassName,
  className = '',
  children,

  // Sorting
  enableSorting = true,
  defaultSortColumn,
  defaultSortDirection,
  sortColumn,
  sortDirection,
  onSortChange,

  // Filtering
  enableFilter = false,
  filterable,
  enableColumnFilters = true,
  enableColumnFilterRow = false,
  filterPlaceholder,
  filterValue,
  onFilterChange,
  customFilterFn,
  filterExtraContent,
  showFilterCount = true,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,

  // Pagination
  enablePagination = false,
  pagination,
  pageSize,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  page,
  defaultPage = 1,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,

  // Height & Layout
  height,
  minHeight,
  maxHeight,
  fixedHeight,
  sx,
}: PosTableProps<T>) {
  const { themeMode, t } = usePos();
  const isDark = themeMode === 'dark';
  const resolvedEmptyMessage = emptyMessage || t.common.emptyData;

  const resolvedHeight =
    height !== undefined
      ? height
      : typeof fixedHeight === 'number' || typeof fixedHeight === 'string'
      ? fixedHeight
      : fixedHeight === true
      ? 640
      : undefined;

  const resolvedMinHeight = minHeight;
  const isFixedLayout = Boolean(resolvedHeight || resolvedMinHeight || maxHeight);

  const tableColumns = useMemo(() => columns || [], [columns]);
  const tableData = useMemo(() => data || [], [data]);

  // Global Filter toolbar active state
  const isFilterToolbarActive = enableFilter || filterable || filterValue !== undefined;

  // In-line column filter row toggle state
  const [showFilterRow, setShowFilterRow] = useState(enableColumnFilterRow);

  // Internal Filter & Sort state
  const [internalFilter, setInternalFilter] = useState('');
  const [internalSortCol, setInternalSortCol] = useState<string | null>(defaultSortColumn || null);
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc' | null>(
    defaultSortDirection || null
  );

  // Column-level filters: { [columnId]: selectedValue[] | string }
  const [internalColumnFilters, setInternalColumnFilters] = useState<Record<string, any>>({});
  const activeColumnFilters = controlledColumnFilters !== undefined ? controlledColumnFilters : internalColumnFilters;

  // Column Filter Popover State
  const [filterAnchorEl, setFilterAnchorEl] = useState<{
    el: HTMLElement;
    colId: string;
  } | null>(null);
  const [popoverSearch, setPopoverSearch] = useState('');
  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>([]);

  // Resolve active filter & sort
  const activeFilter = filterValue !== undefined ? filterValue : internalFilter;
  const activeSortCol = sortColumn !== undefined ? sortColumn : internalSortCol;
  const activeSortDir = sortDirection !== undefined ? sortDirection : internalSortDir;

  const handleFilterChange = useCallback(
    (val: string) => {
      if (filterValue === undefined) {
        setInternalFilter(val);
      }
      onFilterChange?.(val);
    },
    [filterValue, onFilterChange]
  );

  const updateColumnFilters = useCallback(
    (newFilters: Record<string, any>) => {
      if (controlledColumnFilters === undefined) {
        setInternalColumnFilters(newFilters);
      }
      onColumnFiltersChange?.(newFilters);
    },
    [controlledColumnFilters, onColumnFiltersChange]
  );

  const handleSort = (columnId: string) => {
    let nextDir: 'asc' | 'desc' | null = 'asc';
    let nextCol: string | null = columnId;

    if (activeSortCol === columnId) {
      if (activeSortDir === 'asc') {
        nextDir = 'desc';
      } else if (activeSortDir === 'desc') {
        nextDir = null;
        nextCol = null;
      } else {
        nextDir = 'asc';
      }
    }

    if (sortColumn === undefined) {
      setInternalSortCol(nextCol);
      setInternalSortDir(nextDir);
    }
    onSortChange?.(columnId, nextDir);
  };

  const handleResetAll = useCallback(() => {
    handleFilterChange('');
    updateColumnFilters({});
    if (sortColumn === undefined) {
      setInternalSortCol(null);
      setInternalSortDir(null);
    }
    if (onSortChange && activeSortCol) {
      onSortChange(activeSortCol, null);
    }
  }, [activeSortCol, handleFilterChange, onSortChange, sortColumn, updateColumnFilters]);

  // Extract sorting / filter value from row
  const getSortValue = useCallback((row: T, col: PosTableColumn<T>) => {
    if (col.sortKey) {
      return typeof col.sortKey === 'function' ? col.sortKey(row) : row[col.sortKey];
    }
    if ((row as any)[col.id] !== undefined) {
      return (row as any)[col.id];
    }
    // Smart fallbacks for common naming patterns
    if (col.id === 'cashier' && (row as any).cashierName !== undefined) {
      return (row as any).cashierName;
    }
    if (col.id === 'date' && (row as any).startTime !== undefined) {
      return (row as any).startTime;
    }
    if (col.id === 'date' && (row as any).timestamp !== undefined) {
      return (row as any).timestamp;
    }
    return undefined;
  }, []);

  // Distinct values extractor for column filter popover
  const getColumnDistinctValues = useCallback(
    (col: PosTableColumn<T>) => {
      if (col.filterOptions && col.filterOptions.length > 0) {
        return col.filterOptions.map((opt) => ({
          label: opt.label,
          value: String(opt.value),
          count: tableData.filter((row) => {
            const val = getSortValue(row, col);
            return String(val) === String(opt.value);
          }).length,
        }));
      }

      // Auto-generate unique distinct values from table data
      const countsMap = new Map<string, { label: string; value: string; count: number }>();
      tableData.forEach((row) => {
        const val = getSortValue(row, col);
        let key = val == null ? '' : String(val);
        let label = val == null ? `(${t.common.emptyData || 'ว่าง'})` : String(val);

        if (val instanceof Date) {
          key = val.toLocaleDateString();
          label = val.toLocaleDateString();
        }

        if (countsMap.has(key)) {
          countsMap.get(key)!.count += 1;
        } else {
          countsMap.set(key, { label, value: key, count: 1 });
        }
      });

      return Array.from(countsMap.values()).sort((a, b) => b.count - a.count);
    },
    [tableData, getSortValue, t.common.emptyData]
  );

  // Open column filter popover
  const handleOpenColumnFilter = (e: React.MouseEvent<HTMLElement>, colId: string) => {
    e.stopPropagation();
    const currentFilter = activeColumnFilters[colId];
    if (Array.isArray(currentFilter)) {
      setTempSelectedValues([...currentFilter]);
    } else if (currentFilter !== undefined && currentFilter !== null && currentFilter !== '') {
      setTempSelectedValues([String(currentFilter)]);
    } else {
      setTempSelectedValues([]);
    }
    setPopoverSearch('');
    setFilterAnchorEl({ el: e.currentTarget, colId });
  };

  // Apply column filter from popover
  const handleApplyColumnFilter = () => {
    if (!filterAnchorEl) return;
    const colId = filterAnchorEl.colId;
    const nextFilters = { ...activeColumnFilters };

    if (tempSelectedValues.length === 0) {
      delete nextFilters[colId];
    } else {
      nextFilters[colId] = tempSelectedValues;
    }

    updateColumnFilters(nextFilters);
    setFilterAnchorEl(null);
  };

  // Clear single column filter
  const handleClearSingleColumnFilter = (colId: string) => {
    const nextFilters = { ...activeColumnFilters };
    delete nextFilters[colId];
    updateColumnFilters(nextFilters);
    if (filterAnchorEl && filterAnchorEl.colId === colId) {
      setTempSelectedValues([]);
      setFilterAnchorEl(null);
    }
  };

  // Filter Data
  const filteredData = useMemo(() => {
    let result = tableData;

    // 1. Apply column filters
    const activeColFilterKeys = Object.keys(activeColumnFilters);
    if (activeColFilterKeys.length > 0) {
      result = result.filter((row) => {
        return activeColFilterKeys.every((colId) => {
          const filterVal = activeColumnFilters[colId];
          if (filterVal === undefined || filterVal === null || filterVal === '__all__') {
            return true;
          }
          const col = tableColumns.find((c) => c.id === colId);
          if (!col) return true;

          // Custom column filterFn
          if (col.filterFn) {
            return col.filterFn(row, filterVal);
          }

          const rawVal = getSortValue(row, col);
          const cellStr = rawVal instanceof Date ? rawVal.toLocaleDateString() : String(rawVal ?? '');

          // Multi-value array selection (from popover checklist)
          if (Array.isArray(filterVal)) {
            if (filterVal.length === 0) return true;
            return filterVal.some((v) => String(v).toLowerCase() === cellStr.toLowerCase());
          }

          // Single string search (from in-line filter input)
          return cellStr.toLowerCase().includes(String(filterVal).trim().toLowerCase());
        });
      });
    }

    // 2. Apply global text search
    const query = activeFilter.trim().toLowerCase();
    if (!query) return result;

    if (customFilterFn) {
      return result.filter((row) => customFilterFn(row, query, tableColumns));
    }

    return result.filter((row) => {
      return tableColumns.some((col) => {
        if (col.filterable === false) return false;
        if (col.id === 'actions' || col.id === 'manage') return false;

        if (col.filterFn) {
          return col.filterFn(row, query);
        }

        const val = getSortValue(row, col);
        if (val != null) {
          if (typeof val === 'object' && !(val instanceof Date)) {
            return JSON.stringify(val).toLowerCase().includes(query);
          }
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [tableData, activeColumnFilters, activeFilter, customFilterFn, tableColumns, getSortValue]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!activeSortCol || !activeSortDir) return filteredData;

    const col = tableColumns.find((c) => c.id === activeSortCol);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = getSortValue(a, col);
      let valB = getSortValue(b, col);

      // Null / undefined handling
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      // Date comparison
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();

      // Number comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return activeSortDir === 'asc' ? valA - valB : valB - valA;
      }

      // Boolean comparison
      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        const numA = valA ? 1 : 0;
        const numB = valB ? 1 : 0;
        return activeSortDir === 'asc' ? numA - numB : numB - numA;
      }

      // String comparison
      const strA = String(valA);
      const strB = String(valB);
      const cmp = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
      return activeSortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, activeSortCol, activeSortDir, tableColumns, getSortValue]);

  const activeColFilterCount = Object.keys(activeColumnFilters).length;
  const hasActiveFiltersOrSort =
    Boolean(activeFilter) ||
    Boolean(activeSortCol) ||
    activeColFilterCount > 0;

  // Pagination State & Logic
  const isPaginationActive = Boolean(enablePagination || pagination);
  const [internalPage, setInternalPage] = useState(defaultPage || 1);
  const [internalPageSize, setInternalPageSize] = useState(pageSize || defaultPageSize || 10);

  const activePageSize = pageSize !== undefined ? pageSize : internalPageSize;
  const totalRows = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / activePageSize));
  const rawPage = page !== undefined ? page : internalPage;
  const activePage = Math.max(1, Math.min(rawPage, totalPages));

  const handlePageChange = useCallback(
    (newPage: number) => {
      const clamped = Math.max(1, Math.min(newPage, totalPages));
      if (page === undefined) {
        setInternalPage(clamped);
      }
      onPageChange?.(clamped);
    },
    [page, totalPages, onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      if (pageSize === undefined) {
        setInternalPageSize(newSize);
        setInternalPage(1);
      }
      onPageSizeChange?.(newSize);
      onPageChange?.(1);
    },
    [pageSize, onPageSizeChange, onPageChange]
  );

  const paginatedData = useMemo(() => {
    if (!isPaginationActive) return sortedData;
    const startIndex = (activePage - 1) * activePageSize;
    return sortedData.slice(startIndex, startIndex + activePageSize);
  }, [sortedData, isPaginationActive, activePage, activePageSize]);

  if (children) {
    return (
      <PosTableContainer variant={variant} className={className} sx={sx}>
        {children}
      </PosTableContainer>
    );
  }

  return (
    <PosTableContainer
      variant={variant}
      className={className}
      sx={{
        ...(isFixedLayout
          ? {
              display: 'flex',
              flexDirection: 'column',
              ...(resolvedHeight ? { height: resolvedHeight } : {}),
              ...(resolvedMinHeight ? { minHeight: resolvedMinHeight } : {}),
              ...(maxHeight ? { maxHeight } : {}),
            }
          : {}),
        ...sx,
      }}
    >
      {/* Top Search & Filter Bar */}
      {(isFilterToolbarActive || activeColFilterCount > 0) && (
        <div
          className={`px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark
              ? 'border-white/[0.08] bg-white/[0.02]'
              : 'border-[#ebe7df]/80 bg-black/[0.015]'
          }`}
        >
          {/* Search Box & Column Filter Row Toggle */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            {isFilterToolbarActive && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={activeFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  placeholder={filterPlaceholder || t.common.filterTable}
                  className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border transition-all outline-none ${
                    isDark
                      ? 'bg-white/[0.05] border-white/10 text-white placeholder-slate-500 focus:border-primary focus:bg-white/[0.08]'
                      : 'bg-white/80 border-[#ebe7df] text-slate-800 placeholder-slate-400 focus:border-primary focus:bg-white shadow-2xs'
                  }`}
                />
                {activeFilter && (
                  <button
                    type="button"
                    onClick={() => handleFilterChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                    title={t.common.clearFilter}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* In-line Filter Row Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilterRow((prev) => !prev)}
              className={`p-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 flex-shrink-0 active:scale-95 ${
                showFilterRow
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-[#ebe7df] dark:border-white/10 hover:border-primary/50'
              }`}
              title={t.common.filterColumn}
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          {/* Right side stats, active filter tags & reset */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Active column filter tags */}
            {Object.keys(activeColumnFilters).map((colId) => {
              const col = tableColumns.find((c) => c.id === colId);
              if (!col) return null;
              const val = activeColumnFilters[colId];
              const summary = Array.isArray(val) ? `${val.length} ${t.common.items}` : String(val);

              return (
                <span
                  key={colId}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-light/80 text-primary-text border border-primary-border/80"
                >
                  <span>{typeof col.header === 'string' ? col.header : col.id}: {summary}</span>
                  <button
                    type="button"
                    onClick={() => handleClearSingleColumnFilter(colId)}
                    className="hover:text-rose-500 rounded-full p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {showFilterCount && (
              <span className="text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
                {t.common.showingRows
                  ? t.common.showingRows
                      .replace('{count}', String(sortedData.length))
                      .replace('{total}', String(tableData.length))
                  : `${sortedData.length} / ${tableData.length}`}
              </span>
            )}

            {/* Reset all button */}
            {hasActiveFiltersOrSort && (
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer active:scale-95"
                title={t.common.resetTable}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.common.resetTable}</span>
              </button>
            )}

            {filterExtraContent}
          </div>
        </div>
      )}

      {/* Main Table Container Area */}
      <div className={isFixedLayout ? 'flex-1 overflow-auto min-h-0 w-full' : 'w-full overflow-x-auto'}>
        <MuiTable sx={{ minWidth }}>
          <MuiTableHead>
            {/* Header Row */}
            <MuiTableRow
              sx={{
                backgroundColor: 'transparent',
                '& th': {
                  backgroundColor: 'transparent',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'var(--theme-primary-border)',
                  color: isDark ? 'rgba(255, 255, 255, 0.75)' : 'var(--theme-primary-text)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 1.85,
                  px: 2.5,
                },
              }}
            >
            {tableColumns.map((col) => {
              const isColSortable =
                enableSorting &&
                (col.sortable !== undefined
                  ? col.sortable
                  : col.id !== 'actions' && col.id !== 'manage');

              const isColFilterable =
                enableColumnFilters &&
                (col.filterable !== undefined
                  ? col.filterable
                  : col.id !== 'actions' && col.id !== 'manage');

              const isSorted = activeSortCol === col.id;
              const colFilterValue = activeColumnFilters[col.id];
              const isColFiltered =
                Array.isArray(colFilterValue)
                  ? colFilterValue.length > 0
                  : colFilterValue !== undefined && colFilterValue !== null && colFilterValue !== '';

              return (
                <MuiTableCell
                  key={col.id}
                  align={col.align || 'left'}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div
                    className={`inline-flex items-center gap-1.5 ${
                      col.align === 'right'
                        ? 'justify-end w-full'
                        : col.align === 'center'
                        ? 'justify-center w-full'
                        : 'justify-start'
                    }`}
                  >
                    {/* Sortable Header Button or Plain Text */}
                    {isColSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className={`inline-flex items-center gap-1.5 group py-1 px-1.5 -mx-1.5 rounded-lg transition-all cursor-pointer ${
                          isSorted
                            ? 'text-primary font-bold bg-primary-light/60 dark:bg-primary-light/20 shadow-2xs'
                            : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-inherit'
                        }`}
                        title={`${t.common.sortedBy}: ${typeof col.header === 'string' ? col.header : col.id}`}
                      >
                        <span className="truncate">{col.header}</span>
                        <span className="flex-shrink-0 transition-transform">
                          {isSorted ? (
                            activeSortDir === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-35 group-hover:opacity-80 transition-opacity" />
                          )}
                        </span>
                      </button>
                    ) : (
                      <span className="truncate">{col.header}</span>
                    )}

                    {/* Column Dropdown Filter Button */}
                    {isColFilterable && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenColumnFilter(e, col.id)}
                        className={`p-1 rounded-lg transition-all cursor-pointer relative flex-shrink-0 ${
                          isColFiltered
                            ? 'text-primary bg-primary-light dark:bg-primary-light/30 border border-primary-border font-bold shadow-2xs'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                        title={`${t.common.filterColumn}: ${typeof col.header === 'string' ? col.header : col.id}`}
                      >
                        <Filter className="w-3 h-3" />
                        {isColFiltered && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </button>
                    )}
                  </div>
                </MuiTableCell>
              );
            })}
          </MuiTableRow>

          {/* Optional In-line Column Filter Row */}
          {showFilterRow && (
            <MuiTableRow
              sx={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                '& th': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(235, 231, 223, 0.6)',
                  py: 1,
                  px: 2,
                },
              }}
            >
              {tableColumns.map((col) => {
                const isColFilterable =
                  enableColumnFilters &&
                  (col.filterable !== undefined
                    ? col.filterable
                    : col.id !== 'actions' && col.id !== 'manage');

                const currentVal = activeColumnFilters[col.id];
                const displayVal = Array.isArray(currentVal) ? currentVal.join(', ') : currentVal || '';

                if (!isColFilterable) {
                  return <MuiTableCell key={`filter-${col.id}`} />;
                }

                return (
                  <MuiTableCell key={`filter-${col.id}`}>
                    <div className="relative">
                      <input
                        type="text"
                        value={displayVal}
                        onChange={(e) => {
                          const nextFilters = { ...activeColumnFilters };
                          if (!e.target.value) {
                            delete nextFilters[col.id];
                          } else {
                            nextFilters[col.id] = e.target.value;
                          }
                          updateColumnFilters(nextFilters);
                        }}
                        placeholder={t.common.filterColumnPlaceholder}
                        className={`w-full px-2 py-1 text-[11px] rounded-lg border outline-none transition-all ${
                          isDark
                            ? 'bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-primary'
                            : 'bg-white border-[#ebe7df] text-slate-800 placeholder-slate-400 focus:border-primary'
                        }`}
                      />
                      {displayVal && (
                        <button
                          type="button"
                          onClick={() => handleClearSingleColumnFilter(col.id)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </MuiTableCell>
                );
              })}
            </MuiTableRow>
          )}
        </MuiTableHead>

        <MuiTableBody>
          {sortedData.length === 0 ? (
            <MuiTableRow>
              <MuiTableCell
                colSpan={tableColumns.length || 1}
                align="center"
                sx={{
                  py: 6,
                  color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#a0aec0',
                  border: 0,
                }}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <p>{resolvedEmptyMessage}</p>
                  {hasActiveFiltersOrSort && (
                    <button
                      type="button"
                      onClick={handleResetAll}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t.common.clearFilters}</span>
                    </button>
                  )}
                </div>
              </MuiTableCell>
            </MuiTableRow>
          ) : (
            paginatedData.map((row, idx) => (
              <MuiTableRow
                key={keyExtractor(row, idx)}
                onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                className={rowClassName ? rowClassName(row, idx) : ''}
                sx={{
                  transition: 'background-color 0.2s ease',
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(0, 0, 0, 0.02)',
                  },
                  '& td': {
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(235, 231, 223, 0.8)',
                    py: 1.75,
                    px: 2.5,
                    color: isDark ? '#f7fafc' : '#2d3748',
                  },
                }}
              >
                {tableColumns.map((col) => (
                  <MuiTableCell key={col.id} align={col.align || 'left'}>
                    {col.render ? col.render(row, idx) : (row as any)[col.id]}
                  </MuiTableCell>
                ))}
              </MuiTableRow>
            ))
          )}
        </MuiTableBody>
      </MuiTable>
    </div>

      {/* Pagination Footer */}
      {isPaginationActive && (
        <div
          className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs select-none backdrop-blur-md flex-shrink-0 mt-auto ${
            isDark
              ? 'border-white/[0.08] bg-white/[0.02]'
              : 'border-[#ebe7df]/80 bg-black/[0.015]'
          }`}
        >
          {/* Left: Range and Page Size selector */}
          <div className="flex items-center gap-3 flex-wrap">
            {showPageSizeSelector && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span>{t.common.rowsPerPage}:</span>
                <select
                  value={activePageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className={`px-2 py-1 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition-all ${
                    isDark
                      ? 'bg-slate-850 border-white/10 text-slate-200 focus:border-primary'
                      : 'bg-white border-[#ebe7df] text-slate-700 focus:border-primary shadow-2xs'
                  }`}
                >
                  {(pageSizeOptions || [5, 10, 20, 50]).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <span className="text-slate-500 dark:text-slate-400 font-mono">
              {totalRows === 0
                ? '0'
                : t.common.showingRange
                ? t.common.showingRange
                    .replace('{from}', String((activePage - 1) * activePageSize + 1))
                    .replace('{to}', String(Math.min(activePage * activePageSize, totalRows)))
                    .replace('{total}', String(totalRows))
                : `${(activePage - 1) * activePageSize + 1} - ${Math.min(
                    activePage * activePageSize,
                    totalRows
                  )} / ${totalRows}`}
            </span>
          </div>

          {/* Right: Page Navigation buttons with active page pills */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={activePage <= 1}
              className="p-1.5 rounded-xl border border-transparent hover:border-black/10 dark:hover:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-95 text-slate-600 dark:text-slate-300"
              title={t.common.firstPage}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage <= 1}
              className="p-1.5 rounded-xl border border-transparent hover:border-black/10 dark:hover:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-95 text-slate-600 dark:text-slate-300"
              title={t.common.previousPage}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons (sliding window) */}
            <div className="flex items-center gap-1 px-1">
              {getPageNumbers(activePage, totalPages).map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-1 text-slate-400 text-xs">
                      ...
                    </span>
                  );
                }
                const pageNum = p as number;
                const isActive = pageNum === activePage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-7 h-7 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage >= totalPages}
              className="p-1.5 rounded-xl border border-transparent hover:border-black/10 dark:hover:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-95 text-slate-600 dark:text-slate-300"
              title={t.common.nextPage}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={activePage >= totalPages}
              className="p-1.5 rounded-xl border border-transparent hover:border-black/10 dark:hover:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-95 text-slate-600 dark:text-slate-300"
              title={t.common.lastPage}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Advanced Column Filter Popover (Excel / Google Sheets style) */}
      {filterAnchorEl && (
        <Popover
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl.el}
          onClose={() => setFilterAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '20px',
                p: 2,
                width: 250,
                maxWidth: '90vw',
                backgroundColor: isDark ? 'rgba(21, 25, 34, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(20px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(235, 231, 223, 0.9)',
                boxShadow: isDark
                  ? '0 16px 40px rgba(0, 0, 0, 0.6)'
                  : '0 16px 40px rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        >
          {(() => {
            const activeCol = tableColumns.find((c) => c.id === filterAnchorEl.colId);
            if (!activeCol) return null;

            const distinctValues = getColumnDistinctValues(activeCol);
            const filteredDistinctValues = distinctValues.filter((item) =>
              item.label.toLowerCase().includes(popoverSearch.toLowerCase())
            );

            const isAllSelected =
              distinctValues.length > 0 &&
              distinctValues.every((item) => tempSelectedValues.includes(item.value));

            return (
              <div className="space-y-3 text-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <Filter className="w-3.5 h-3.5 text-primary" />
                    <span>{typeof activeCol.header === 'string' ? activeCol.header : activeCol.id}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilterAnchorEl(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Popover In-filter Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={popoverSearch}
                    onChange={(e) => setPopoverSearch(e.target.value)}
                    placeholder={t.common.filterColumnPlaceholder}
                    className={`w-full pl-8 pr-7 py-1 text-xs rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-white placeholder-slate-500 focus:border-primary'
                        : 'bg-white border-[#ebe7df] text-slate-800 placeholder-slate-400 focus:border-primary'
                    }`}
                  />
                  {popoverSearch && (
                    <button
                      type="button"
                      onClick={() => setPopoverSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Select All / Deselect All Bar */}
                <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAllSelected) {
                        setTempSelectedValues([]);
                      } else {
                        setTempSelectedValues(distinctValues.map((v) => v.value));
                      }
                    }}
                    className="text-primary hover:underline font-semibold cursor-pointer"
                  >
                    {isAllSelected ? t.common.deselectAll : t.common.selectAll}
                  </button>
                  <span>
                    {tempSelectedValues.length} / {distinctValues.length}
                  </span>
                </div>

                {/* Distinct Values Checklist (Scrollable) */}
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {filteredDistinctValues.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 text-xs">
                      {t.common.emptyData}
                    </div>
                  ) : (
                    filteredDistinctValues.map((item) => {
                      const isChecked = tempSelectedValues.includes(item.value);
                      return (
                        <label
                          key={item.value}
                          className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer select-none ${
                            isChecked
                              ? 'bg-primary-light/70 dark:bg-primary-light/20 text-primary-text font-semibold'
                              : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setTempSelectedValues((prev) => prev.filter((v) => v !== item.value));
                                } else {
                                  setTempSelectedValues((prev) => [...prev, item.value]);
                                }
                              }}
                              className="accent-primary rounded cursor-pointer w-3.5 h-3.5"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-slate-500 dark:text-slate-400 font-mono flex-shrink-0">
                            {item.count}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08] gap-2">
                  <button
                    type="button"
                    onClick={() => handleClearSingleColumnFilter(activeCol.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors"
                  >
                    {t.common.clear}
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyColumnFilter}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    {t.common.applyFilter}
                  </button>
                </div>
              </div>
            );
          })()}
        </Popover>
      )}
    </PosTableContainer>
  );
}
