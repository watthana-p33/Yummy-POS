import XLSX from 'xlsx-js-style';

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export interface ExcelThemeConfig {
  headerBg: string; // Dark forest sage (Brand Hero)
  subHeaderBg: string; // Medium forest green
  tableHeaderBg: string; // Primary accent green
  tableHeaderBorder: string;
  groupRowBg: string; // Soft sage pill
  groupRowText: string; // Dark green text
  groupRowBorder: string; // Subtle green border
  zebraRowBg: string; // Subtle tint for alternating rows
  white: string;
  textDark: string; // Slate 800
  textMuted: string; // Slate 500
  textSubtle: string; // Slate 400
  borderLight: string; // Light gray border
  totalRowBg: string; // Deepest brand green for grand total
  cardBg: string; // KPI Card background
  cardBorder: string;
  goldText: string; // Accent text
}

export const DEFAULT_EXCEL_THEME: ExcelThemeConfig = {
  headerBg: '2D5542',
  subHeaderBg: '3D6852',
  tableHeaderBg: '387258',
  tableHeaderBorder: '264E3D',
  groupRowBg: 'EAF4EF',
  groupRowText: '1F382C',
  groupRowBorder: 'C5E2D4',
  zebraRowBg: 'F9FBFA',
  white: 'FFFFFF',
  textDark: '1E293B',
  textMuted: '64748B',
  textSubtle: '94A3B8',
  borderLight: 'E2E8F0',
  totalRowBg: '244636',
  cardBg: 'F0F7F3',
  cardBorder: 'CDE4D7',
  goldText: 'D97706',
};

// ============================================================================
// GENERIC EXCEL DATA TYPES
// ============================================================================

export interface ExcelColumn<T = any> {
  /** Unique key identifying the column or matching data property */
  key: string;
  /** Header label displayed in table header row */
  header: string;
  /** Column width in characters (wch). Defaults to auto-fit */
  width?: number;
  /** Text alignment (default: 'left') */
  align?: 'left' | 'center' | 'right';
  /** Optional custom formatter function */
  formatter?: (val: any, row: T, index: number) => string | number;
  /** Excel cell type: 's' for string, 'n' for number */
  type?: 's' | 'n';
}

export interface ExcelKpiCard {
  title: string;
  value: string | number;
  colSpan?: number;
}

export type ExcelRowType = 'data' | 'group' | 'subitem' | 'total';

export interface ExcelRowItem<T = any> {
  type?: ExcelRowType;
  /** Direct map of column key to display value */
  values?: Record<string, string | number>;
  /** Underlying data item (if using data mapping) */
  data?: T;
  /** Child breakdown or nested items */
  subRows?: ExcelRowItem<T>[];
}

export interface ExcelTotalSummary {
  /** Summary row title placed in the first column */
  label: string;
  /** Column key to total value mapping */
  values: Record<string, string | number>;
}

export interface StyledExcelExportOptions<T = any> {
  /** Target file download name (e.g. 'Products_20261012.xlsx') */
  fileName: string;
  /** Worksheet tab name (default: 'Report') */
  sheetName?: string;
  /** Main title banner displayed on row 1 */
  title: string;
  /** Optional subtitle or metadata line on row 2 */
  subtitle?: string;
  /** Optional KPI cards displayed above data table */
  kpiCards?: ExcelKpiCard[];
  /** Table column definitions */
  columns: ExcelColumn<T>[];
  /** Flat array of data records */
  data?: T[];
  /** Or custom formatted rows with support for group/subitem hierarchies */
  rows?: ExcelRowItem<T>[];
  /** Optional Grand Total footer row */
  totalSummary?: ExcelTotalSummary;
  /** Optional theme color overrides */
  theme?: Partial<ExcelThemeConfig>;
}

// ============================================================================
// CORE GENERIC STYLED EXCEL EXPORT ENGINE
// ============================================================================

/**
 * Universal Excel export engine that formats and exports ANY dataset
 * with the Yummy POS design theme and liquid aesthetic.
 */
export function exportStyledExcel<T = any>(options: StyledExcelExportOptions<T>): void {
  const {
    fileName,
    sheetName = 'Report',
    title,
    subtitle,
    kpiCards,
    columns,
    data,
    rows: customRows,
    totalSummary,
    theme: customTheme,
  } = options;

  if (!columns || columns.length === 0) {
    console.error('exportStyledExcel requires at least one column definition.');
    return;
  }

  const theme: ExcelThemeConfig = { ...DEFAULT_EXCEL_THEME, ...customTheme };
  const colCount = columns.length;
  const lastColIndex = colCount - 1;

  const ws: XLSX.WorkSheet = {};
  const merges: XLSX.Range[] = [];
  const rowsConfig: { hpt: number }[] = [];

  let rowIndex = 0; // 0-indexed row position in worksheet

  // Cell builder helper with full styling
  const setCell = (
    c: number,
    r: number,
    val: string | number | undefined | null,
    type: 's' | 'n',
    style: any
  ) => {
    const cellRef = XLSX.utils.encode_cell({ c, r });
    ws[cellRef] = {
      v: val !== undefined && val !== null ? val : '',
      t: type,
      s: style,
    };
  };

  // --------------------------------------------------------------------------
  // 1. MAIN TITLE BANNER (Row 1)
  // --------------------------------------------------------------------------
  merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: lastColIndex } });
  rowsConfig.push({ hpt: 38 });
  setCell(0, rowIndex, title, 's', {
    fill: { fgColor: { rgb: theme.headerBg } },
    font: { name: 'Calibri', sz: 14.5, bold: true, color: { rgb: theme.white } },
    alignment: { horizontal: 'center', vertical: 'center' },
  });
  // Fill trailing cells across merged range for consistent background
  for (let c = 1; c <= lastColIndex; c++) {
    setCell(c, rowIndex, '', 's', { fill: { fgColor: { rgb: theme.headerBg } } });
  }
  rowIndex++;

  // --------------------------------------------------------------------------
  // 2. SUBTITLE / METADATA BANNER (Row 2, if provided)
  // --------------------------------------------------------------------------
  if (subtitle) {
    merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: lastColIndex } });
    rowsConfig.push({ hpt: 22 });
    setCell(0, rowIndex, subtitle, 's', {
      fill: { fgColor: { rgb: theme.subHeaderBg } },
      font: { name: 'Calibri', sz: 9.5, italic: true, color: { rgb: 'F1F5F9' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    });
    for (let c = 1; c <= lastColIndex; c++) {
      setCell(c, rowIndex, '', 's', { fill: { fgColor: { rgb: theme.subHeaderBg } } });
    }
    rowIndex++;
  }

  // --------------------------------------------------------------------------
  // 3. KPI CARDS (Row 3-4, if provided)
  // --------------------------------------------------------------------------
  if (kpiCards && kpiCards.length > 0) {
    // Spacer row before KPI cards
    rowsConfig.push({ hpt: 10 });
    rowIndex++;

    const numCards = kpiCards.length;
    let currentCol = 0;

    // Calculate colSpan allocation per card across total columns
    const cardSpans: { startCol: number; endCol: number }[] = [];
    kpiCards.forEach((card, idx) => {
      const remainingCards = numCards - idx;
      const remainingCols = colCount - currentCol;
      const span = card.colSpan ?? Math.max(1, Math.round(remainingCols / remainingCards));
      const endCol = Math.min(lastColIndex, currentCol + span - 1);
      cardSpans.push({ startCol: currentCol, endCol });
      currentCol = endCol + 1;
    });

    // Make sure the last card extends to lastColIndex
    if (cardSpans.length > 0) {
      cardSpans[cardSpans.length - 1].endCol = lastColIndex;
    }

    const cardTitleRow = rowIndex;
    const cardValueRow = rowIndex + 1;

    rowsConfig.push({ hpt: 18 }); // Title row height
    rowsConfig.push({ hpt: 28 }); // Value row height

    const kpiTitleStyle = {
      fill: { fgColor: { rgb: theme.cardBg } },
      font: { name: 'Calibri', sz: 9.5, bold: true, color: { rgb: theme.textMuted } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: theme.cardBorder } },
        left: { style: 'thin', color: { rgb: theme.cardBorder } },
        right: { style: 'thin', color: { rgb: theme.cardBorder } },
      },
    };

    const kpiValueStyle = {
      fill: { fgColor: { rgb: theme.cardBg } },
      font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: theme.headerBg } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: theme.cardBorder } },
        left: { style: 'thin', color: { rgb: theme.cardBorder } },
        right: { style: 'thin', color: { rgb: theme.cardBorder } },
      },
    };

    kpiCards.forEach((card, idx) => {
      const { startCol, endCol } = cardSpans[idx];
      merges.push({ s: { r: cardTitleRow, c: startCol }, e: { r: cardTitleRow, c: endCol } });
      merges.push({ s: { r: cardValueRow, c: startCol }, e: { r: cardValueRow, c: endCol } });

      for (let c = startCol; c <= endCol; c++) {
        setCell(c, cardTitleRow, c === startCol ? card.title : '', 's', kpiTitleStyle);
        setCell(c, cardValueRow, c === startCol ? String(card.value) : '', 's', kpiValueStyle);
      }
    });

    rowIndex += 2;
  }

  // --------------------------------------------------------------------------
  // 4. SPACER ROW BEFORE TABLE
  // --------------------------------------------------------------------------
  rowsConfig.push({ hpt: 12 });
  rowIndex++;

  // --------------------------------------------------------------------------
  // 5. TABLE COLUMN HEADERS
  // --------------------------------------------------------------------------
  rowsConfig.push({ hpt: 26 });
  const tableHeaderStyle = (align: 'left' | 'center' | 'right') => ({
    fill: { fgColor: { rgb: theme.tableHeaderBg } },
    font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: theme.white } },
    alignment: { horizontal: align, vertical: 'center' },
    border: {
      top: { style: 'medium', color: { rgb: theme.tableHeaderBorder } },
      bottom: { style: 'medium', color: { rgb: theme.tableHeaderBorder } },
      left: { style: 'thin', color: { rgb: '4D8469' } },
      right: { style: 'thin', color: { rgb: '4D8469' } },
    },
  });

  columns.forEach((col, cIdx) => {
    setCell(cIdx, rowIndex, col.header, 's', tableHeaderStyle(col.align || 'left'));
  });
  rowIndex++;

  // --------------------------------------------------------------------------
  // 6. TABLE DATA ROWS
  // --------------------------------------------------------------------------
  // Prepare row list: either custom formatted rows or generated from data array
  const finalRows: ExcelRowItem<T>[] = [];

  if (customRows && customRows.length > 0) {
    // Flatten rows and subRows recursively
    const flattenRow = (r: ExcelRowItem<T>) => {
      finalRows.push(r);
      if (r.subRows && r.subRows.length > 0) {
        r.subRows.forEach(flattenRow);
      }
    };
    customRows.forEach(flattenRow);
  } else if (data && data.length > 0) {
    data.forEach((item, index) => {
      const values: Record<string, string | number> = {};
      columns.forEach((col) => {
        const rawVal = (item as any)[col.key];
        const formatted = col.formatter ? col.formatter(rawVal, item, index) : rawVal;
        values[col.key] = formatted !== undefined && formatted !== null ? formatted : '';
      });
      finalRows.push({ type: 'data', values, data: item });
    });
  }

  let isZebra = false;

  finalRows.forEach((rowItem) => {
    const rowType = rowItem.type || 'data';

    if (rowType === 'group') {
      // Group header row (e.g. Period or Category highlight)
      rowsConfig.push({ hpt: 24 });
      const groupStyle = (align: 'left' | 'center' | 'right') => ({
        fill: { fgColor: { rgb: theme.groupRowBg } },
        font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: theme.groupRowText } },
        alignment: { horizontal: align, vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: theme.groupRowBorder } },
          bottom: { style: 'thin', color: { rgb: theme.groupRowBorder } },
          left: { style: 'thin', color: { rgb: theme.groupRowBorder } },
          right: { style: 'thin', color: { rgb: theme.groupRowBorder } },
        },
      });

      columns.forEach((col, cIdx) => {
        const val = rowItem.values?.[col.key] ?? '';
        setCell(cIdx, rowIndex, val, typeof val === 'number' ? 'n' : 's', groupStyle(col.align || 'left'));
      });
      rowIndex++;
    } else if (rowType === 'subitem') {
      // Indented sub-row (e.g. product breakdown)
      rowsConfig.push({ hpt: 20 });
      const rowBg = isZebra ? theme.zebraRowBg : theme.white;
      isZebra = !isZebra;

      const subItemStyle = (align: 'left' | 'center' | 'right', isFirstCol = false) => ({
        fill: { fgColor: { rgb: rowBg } },
        font: {
          name: 'Calibri',
          sz: 9.5,
          color: isFirstCol ? { rgb: theme.textDark } : { rgb: theme.textMuted },
        },
        alignment: { horizontal: align, vertical: 'center' },
        border: {
          bottom: { style: 'thin', color: { rgb: theme.borderLight } },
          left: { style: 'thin', color: { rgb: theme.borderLight } },
          right: { style: 'thin', color: { rgb: theme.borderLight } },
        },
      });

      columns.forEach((col, cIdx) => {
        let val = rowItem.values?.[col.key] ?? '';
        if (cIdx === 0 && typeof val === 'string' && !val.startsWith('   ↳')) {
          val = `   ↳ ${val}`;
        }
        setCell(cIdx, rowIndex, val, typeof val === 'number' ? 'n' : 's', subItemStyle(col.align || 'left', cIdx === 0));
      });
      rowIndex++;
    } else {
      // Standard data row
      rowsConfig.push({ hpt: 21 });
      const rowBg = isZebra ? theme.zebraRowBg : theme.white;
      isZebra = !isZebra;

      const dataRowStyle = (align: 'left' | 'center' | 'right') => ({
        fill: { fgColor: { rgb: rowBg } },
        font: { name: 'Calibri', sz: 9.5, color: { rgb: theme.textDark } },
        alignment: { horizontal: align, vertical: 'center' },
        border: {
          bottom: { style: 'thin', color: { rgb: theme.borderLight } },
          left: { style: 'thin', color: { rgb: theme.borderLight } },
          right: { style: 'thin', color: { rgb: theme.borderLight } },
        },
      });

      columns.forEach((col, cIdx) => {
        let val: string | number = '';
        if (rowItem.values && col.key in rowItem.values) {
          val = rowItem.values[col.key];
        } else if (rowItem.data) {
          const raw = (rowItem.data as any)[col.key];
          val = col.formatter ? col.formatter(raw, rowItem.data, rowIndex) : (raw ?? '');
        }

        const cellType = col.type || (typeof val === 'number' ? 'n' : 's');
        setCell(cIdx, rowIndex, val, cellType, dataRowStyle(col.align || 'left'));
      });
      rowIndex++;
    }
  });

  // --------------------------------------------------------------------------
  // 7. GRAND TOTAL SUMMARY ROW (At bottom, if provided)
  // --------------------------------------------------------------------------
  if (totalSummary) {
    rowsConfig.push({ hpt: 30 });
    const grandTotalStyle = (align: 'left' | 'center' | 'right') => ({
      fill: { fgColor: { rgb: theme.totalRowBg } },
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: theme.white } },
      alignment: { horizontal: align, vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: theme.headerBg } },
        bottom: { style: 'double', color: { rgb: theme.headerBg } },
        left: { style: 'thin', color: { rgb: '3A6350' } },
        right: { style: 'thin', color: { rgb: '3A6350' } },
      },
    });

    columns.forEach((col, cIdx) => {
      let val: string | number = '';
      if (cIdx === 0) {
        val = totalSummary.label;
      } else if (col.key in totalSummary.values) {
        val = totalSummary.values[col.key];
      }
      setCell(cIdx, rowIndex, val, typeof val === 'number' ? 'n' : 's', grandTotalStyle(col.align || 'left'));
    });
    rowIndex++;
  }

  // --------------------------------------------------------------------------
  // 8. WORKSHEET METADATA, COLUMN WIDTHS & EXPORT
  // --------------------------------------------------------------------------
  const maxRef = XLSX.utils.encode_cell({ c: lastColIndex, r: Math.max(0, rowIndex - 1) });
  ws['!ref'] = `A1:${maxRef}`;
  ws['!merges'] = merges;
  ws['!rows'] = rowsConfig;

  // Auto-calculate or apply column widths
  ws['!cols'] = columns.map((col) => {
    if (col.width) {
      return { wch: col.width };
    }
    // Default sensible fallback based on header text length
    const headerLen = (col.header || '').length;
    return { wch: Math.max(16, headerLen + 4) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

// ============================================================================
// SALES REPORT EXPORT SPECIALIZATION (Maintains backwards compatibility)
// ============================================================================

export interface ProductBreakdownItem {
  name: string;
  qty: number;
  revenue: number;
}

export interface ReportPeriodSummary {
  period: string;
  orderCount: number;
  totalQty: number;
  revenue: number;
  productBreakdown: Record<string, ProductBreakdownItem>;
}

export interface ExportSalesReportOptions {
  periodType: 'monthly' | 'yearly';
  reportData: ReportPeriodSummary[];
  totalFilteredRevenue: number;
  totalFilteredUnits: number;
  totalOrdersCount: number;
  storeName?: string;
  branchName?: string;
  currency?: string;
  filterYear?: string;
  filterMonth?: string;
}

/**
 * Specialized helper for exporting Sales Summary Reports,
 * implemented on top of the generic `exportStyledExcel` engine.
 */
export const exportSalesReportToExcel = ({
  periodType,
  reportData,
  totalFilteredRevenue,
  totalFilteredUnits,
  totalOrdersCount,
  storeName = 'Yummy POS',
  branchName = 'สาขาหลัก Central Food Court',
  currency = '฿',
  filterYear,
  filterMonth,
}: ExportSalesReportOptions) => {
  const periodTypeName = periodType === 'monthly' ? 'สรุปรายเดือน (Monthly)' : 'สรุปรายปี (Yearly)';
  const now = new Date();
  const exportDateStr = `${now.toLocaleDateString('th-TH')} ${now.toLocaleTimeString('th-TH')}`;

  const filterDescParts: string[] = [];
  if (filterYear && filterYear !== 'all') {
    filterDescParts.push(`ปี: ${filterYear}`);
  }
  if (periodType === 'monthly' && filterMonth && filterMonth !== 'all') {
    filterDescParts.push(`เดือน: ${filterMonth}`);
  }
  const filterDesc = filterDescParts.length > 0 ? `   |   ตัวกรอง: ${filterDescParts.join(', ')}` : '';

  const columns: ExcelColumn[] = [
    { key: 'periodOrName', header: 'ช่วงเวลา / รายการสินค้า (Period / Menu Items)', width: 44, align: 'left' },
    { key: 'orders', header: 'จำนวนบิล (Orders)', width: 18, align: 'center' },
    { key: 'units', header: 'จำนวนชิ้น (Units)', width: 18, align: 'center' },
    { key: 'revenue', header: `ยอดขายสุทธิ (${currency} Revenue)`, width: 26, align: 'right' },
  ];

  const rows: ExcelRowItem[] = [];

  reportData.forEach((r) => {
    // Period group header row
    rows.push({
      type: 'group',
      values: {
        periodOrName: `📅 ช่วงเวลา: ${r.period}`,
        orders: `${r.orderCount} บิล`,
        units: `${r.totalQty.toLocaleString()} ชิ้น`,
        revenue: `${currency} ${r.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      },
    });

    // Nested product breakdown sub-items
    Object.values(r.productBreakdown).forEach((item) => {
      rows.push({
        type: 'subitem',
        values: {
          periodOrName: item.name,
          orders: '—',
          units: item.qty.toLocaleString(),
          revenue: `${currency} ${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        },
      });
    });
  });

  const fileNameDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const yearSuffix = filterYear && filterYear !== 'all' ? `_${filterYear}` : '';
  const monthSuffix = periodType === 'monthly' && filterMonth && filterMonth !== 'all' ? `_M${filterMonth}` : '';
  const fileName = `YummyPOS_Sales_Report_${periodType}${yearSuffix}${monthSuffix}_${fileNameDate}.xlsx`;

  exportStyledExcel({
    fileName,
    sheetName: 'SalesSummary',
    title: `🍽️ ${storeName.toUpperCase()} — รายงานสรุปยอดขาย (${periodTypeName.toUpperCase()})`,
    subtitle: `สาขา: ${branchName}   |   วันที่ออกรายงาน: ${exportDateStr}   |   สกุลเงิน: THB (${currency})${filterDesc}`,
    kpiCards: [
      {
        title: '💰 ยอดขายสุทธิรวมทั้งสิ้น (TOTAL REVENUE)',
        value: `${currency} ${totalFilteredRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      },
      {
        title: '📦 จำนวนสินค้าที่ขายได้ (TOTAL UNITS SOLD)',
        value: `${totalFilteredUnits.toLocaleString()} ชิ้น (${totalOrdersCount} บิล)`,
      },
    ],
    columns,
    rows,
    totalSummary: {
      label: 'รวมยอดขายสุทธิทั้งหมด (GRAND TOTAL)',
      values: {
        orders: `${totalOrdersCount} บิล`,
        units: `${totalFilteredUnits.toLocaleString()} ชิ้น`,
        revenue: `${currency} ${totalFilteredRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      },
    },
  });
};
