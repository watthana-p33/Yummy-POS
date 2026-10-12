# 📊 Yummy POS — Universal Excel Export Guide

คู่มือการใช้งาน **`exportStyledExcel`** ไลบรารีกลางสำหรับตกแต่งสไตล์และส่งออกไฟล์ Excel (.xlsx) ประจำระบบ Yummy POS

---

## 🎯 ภาพรวมและจุดประสงค์

`exportStyledExcel` ถูกออกแบบมาเพื่อทำหน้าที่เป็น **Styling & Layout Engine กลาง** โดยที่:
- **ไม่ต้องเขียนโค้ดจัดสไตล์เซลล์ (Cell Styling), รวมเซลล์ (Merge), หรือคำนวณตำแหน่งเอง** ทุกครั้งที่ต้องการทำฟีเจอร์ Export Excel ใหม่
- **คงเอกลักษณ์ธีม Yummy POS อย่างสม่ำเสมอ**: หัวกระดาษสีเขียว Forest Sage, การจัดกึ่งกลาง/ชิดขวา, เส้นขอบตาราง (Borders), แถบสรุปภาพรวม (KPI Cards), แถวสลับสี (Zebra Striping) และแถวสรุปยอดรวม (Grand Total)
- **รองรับชุดข้อมูลทุกรูปแบบ**: ตั้งแต่ตารางข้อมูลแบบเรียบง่าย (Flat array) ไปจนถึงตารางที่มีการจัดกลุ่มตามช่วงเวลา/หมวดหมู่และรายการย่อยซ้อนกัน (Grouped & Hierarchical)

---

## 🚀 การใช้งานเบื้องต้น (Quick Start)

### 1. นำเข้าฟังก์ชัน (Import)
```typescript
import { exportStyledExcel, type ExcelColumn } from '@/utils/excelExport';
```

### 2. ตัวอย่างการส่งออกตารางทั่วไป (Simple Table)
```typescript
interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const handleExportProducts = (products: ProductItem[]) => {
  exportStyledExcel<ProductItem>({
    fileName: `YummyPOS_Products_${Date.now()}.xlsx`,
    sheetName: 'Products',
    title: '🛒 YUMMY POS — รายการสินค้าทั้งหมด',
    subtitle: 'ข้อมูลสินค้าและจำนวนคงเหลือ ณ วันที่ออกรายงาน',
    columns: [
      { key: 'id', header: 'รหัสสินค้า', width: 14, align: 'center' },
      { key: 'name', header: 'ชื่อสินค้า', width: 32, align: 'left' },
      { key: 'category', header: 'หมวดหมู่', width: 18, align: 'center' },
      { 
        key: 'price', 
        header: 'ราคา (บาท)', 
        width: 16, 
        align: 'right',
        formatter: (val) => `฿${Number(val).toLocaleString()}`,
      },
      { 
        key: 'stock', 
        header: 'คงเหลือ (ชิ้น)', 
        width: 16, 
        align: 'right',
        formatter: (val) => Number(val).toLocaleString(),
      },
    ],
    data: products, // ส่ง Array ข้อมูลเข้าไปได้ทันที
  });
};
```

---

## 📋 รายละเอียด Props และ Interface (API Reference)

### `StyledExcelExportOptions<T>`

| Prop | Type | Required | คำอธิบาย |
| :--- | :--- | :---: | :--- |
| `fileName` | `string` | ✅ | ชื่อไฟล์ที่จะดาวน์โหลด เช่น `'SalesReport_2026.xlsx'` |
| `title` | `string` | ✅ | ข้อความหัวข้อใหญ่ แถวที่ 1 (Title Banner) |
| `columns` | `ExcelColumn<T>[]` | ✅ | กำหนดรายละเอียดของแต่ละคอลัมน์ |
| `sheetName` | `string` | ❌ | ชื่อ Tab Sheet ใน Excel (ค่าเริ่มต้น: `'Report'`) |
| `subtitle` | `string` | ❌ | ข้อความแถบข้อมูลเสริม แถวที่ 2 (เช่น สาขา, วันที่, เงื่อนไขตัวกรอง) |
| `data` | `T[]` | ❌ | ชุดข้อมูลแบบ Flat Array (ระบบจะ map ตาม `col.key` ให้อัตโนมัติ) |
| `rows` | `ExcelRowItem<T>[]` | ❌ | ชุดข้อมูลแบบกำหนดแถวเอง รองรับประเภทแถว `group`, `subitem`, `data` |
| `kpiCards` | `ExcelKpiCard[]` | ❌ | กล่องสรุปสถิติด้านบนตาราง (เช่น ยอดขายรวม, จำนวนบิล) |
| `totalSummary`| `ExcelTotalSummary` | ❌ | แถวสรุปยอดรวมสุทธิ (Grand Total) ที่ท้ายตาราง |
| `theme` | `Partial<ExcelThemeConfig>` | ❌ | ปรับแต่งโทนสีเพิ่มเติมหากต้องการ |

---

### `ExcelColumn<T>` (การกำหนดคอลัมน์)

```typescript
interface ExcelColumn<T = any> {
  key: string;                                           // ฟิลด์ใน object หรือ id ประจำคอลัมน์
  header: string;                                        // ข้อความหัวคอลัมน์
  width?: number;                                        // ความกว้างคอลัมน์ (ตัวอักษร) ค่าเริ่มต้นจะคำนวณให้อัตโนมัติ
  align?: 'left' | 'center' | 'right';                   // จัดแนวข้อความ (default: 'left')
  formatter?: (val: any, row: T, index: number) => string | number; // จัดรูปแบบการแสดงผล
  type?: 's' | 'n';                                      // ประเภทเซลล์: 's' (ข้อความ) หรือ 'n' (ตัวเลข)
}
```

---

### `ExcelKpiCard` (กล่องสรุปภาพรวม)

```typescript
interface ExcelKpiCard {
  title: string;          // ป้ายชื่อ เช่น '💰 ยอดขายสุทธิรวมทั้งสิ้น'
  value: string | number; // ค่าสถิติ เช่น '฿45,200.00' หรือ '150 บิล'
  colSpan?: number;       // จำนวนคอลัมน์ที่การ์ดนี้ขยาย (หากไม่ระบุจะแบ่งให้เท่ากันอัตโนมัติ)
}
```

---

### `ExcelTotalSummary` (แถวสรุปยอดรวมท้ายตาราง)

```typescript
interface ExcelTotalSummary {
  label: string;                                   // ข้อความแสดงในคอลัมน์แรก เช่น 'รวมทั้งสิ้น (GRAND TOTAL)'
  values: Record<string, string | number>;         // ค่าผลรวมของแต่ละคอลัมน์ (ระบุตาม column key)
}
```

---

## 💡 สูตรการใช้งานตามสถานการณ์จริง (Recipes)

### สูตรที่ 1: ตารางพร้อม KPI Cards และ Grand Total
ใช้สำหรับตารางสรุป เช่น ประวัติการขาย (Sales History)

```typescript
exportStyledExcel({
  fileName: `Sales_History_${Date.now()}.xlsx`,
  sheetName: 'Orders',
  title: '📜 YUMMY POS — รายงานประวัติการขาย',
  subtitle: 'สาขาหลัก Central Food Court | แคชเชียร์: ทุกคน | การชำระ: ทั้งหมด',
  
  // 1. กล่องสรุปภาพรวมด้านบน
  kpiCards: [
    { title: '💰 ยอดขายสุทธิรวม', value: '฿125,400.00' },
    { title: '🧾 จำนวนบิลทั้งหมด', value: '84 บิล' },
    { title: '📦 ชิ้นสินค้ารวม', value: '312 ชิ้น' },
  ],

  // 2. คอลัมน์
  columns: [
    { key: 'orderNo', header: 'เลขที่บิล', width: 16, align: 'center' },
    { key: 'time', header: 'วันเวลา', width: 20, align: 'center' },
    { key: 'cashier', header: 'พนักงานขาย', width: 20, align: 'left' },
    { key: 'payment', header: 'ช่องทางชำระ', width: 16, align: 'center' },
    { key: 'amount', header: 'ยอดสุทธิ (บาท)', width: 20, align: 'right' },
  ],

  // 3. ข้อมูลแถว
  data: [
    { orderNo: 'ORD-001', time: '12/10/2026 10:15', cashier: 'Somchai', payment: 'PromptPay', amount: '฿350.00' },
    { orderNo: 'ORD-002', time: '12/10/2026 10:22', cashier: 'Suda', payment: 'Cash', amount: '฿120.00' },
  ],

  // 4. แถวสรุปด้านล่าง
  totalSummary: {
    label: 'รวมยอดขายสุทธิทั้งหมด',
    values: {
      amount: '฿125,400.00',
    },
  },
});
```

---

### สูตรที่ 2: ตารางที่มีการจัดกลุ่มตามหัวข้อและรายการย่อย (Grouped & Sub-items)
ใช้สำหรับกรณีแบบ [ReportsScreen.tsx](file:///d:/work-space/POS/yummy-pos/src/components/screens/ReportsScreen.tsx) ที่มีทั้ง **หัวข้อช่วงเวลา (Group)** และ **รายการสินค้าย่อยแจกแจง (Subitem)**:

```typescript
exportStyledExcel({
  fileName: 'SalesReport_Grouped.xlsx',
  title: '🍽️ YUMMY POS — สรุปยอดขายรายเดือน',
  subtitle: 'แสดงแยกตามช่วงเวลาและรายการเมนูสินค้า',
  columns: [
    { key: 'item', header: 'ช่วงเวลา / เมนูสินค้า', width: 40, align: 'left' },
    { key: 'orders', header: 'จำนวนบิล', width: 16, align: 'center' },
    { key: 'units', header: 'จำนวนชิ้น', width: 16, align: 'center' },
    { key: 'revenue', header: 'ยอดขาย (บาท)', width: 22, align: 'right' },
  ],
  rows: [
    // แถวหัวข้อกลุ่ม (type: 'group') จะไฮไลต์สีพื้นหลังและตัวหนา
    {
      type: 'group',
      values: {
        item: '📅 ช่วงเวลา: 2026-10',
        orders: '42 บิล',
        units: '180 ชิ้น',
        revenue: '฿24,500.00',
      },
    },
    // แถวรายการย่อย (type: 'subitem') จะเยื้องให้อัตโนมัติด้วย ↳
    {
      type: 'subitem',
      values: {
        item: 'ชานมไข่มุก',
        orders: '—',
        units: '120',
        revenue: '฿6,000.00',
      },
    },
    {
      type: 'subitem',
      values: {
        item: 'ข้าวกะเพราหมูกรอบ',
        orders: '—',
        units: '60',
        revenue: '฿18,500.00',
      },
    },
  ],
  totalSummary: {
    label: 'รวมยอดขายสุทธิทั้งหมด (GRAND TOTAL)',
    values: {
      orders: '42 บิล',
      units: '180 ชิ้น',
      revenue: '฿24,500.00',
    },
  },
});
```

---

## 🎨 สี Theme เริ่มต้น (Yummy POS Palette)

หากต้องการปรับแต่งสี สามารถส่ง `theme: { ... }` เข้าไปทับสีเริ่มต้นได้ (ระบุเป็นรหัส Hex โดยไม่ต้องมีเครื่องหมาย `#`):

```typescript
export const DEFAULT_EXCEL_THEME = {
  headerBg: '2D5542',       // สีเขียวเข้มพรีเมียม (Title แถวที่ 1)
  subHeaderBg: '3D6852',    // สีเขียวเข้มรอง (Subtitle แถวที่ 2)
  tableHeaderBg: '387258',  // สีเขียวหัวตาราง (Table Header)
  groupRowBg: 'EAF4EF',     // สีเขียวอ่อนสำหรับแถว Group
  groupRowText: '1F382C',   // สีข้อความแถว Group
  zebraRowBg: 'F9FBFA',     // สีสลับแถวคู่-คี่ (Zebra)
  totalRowBg: '244636',     // สีแถว Grand Total ล่างสุด
  cardBg: 'F0F7F3',         // สีพื้นหลังกล่อง KPI Card
  cardBorder: 'CDE4D7',     // เส้นขอบกล่อง KPI Card
  white: 'FFFFFF',
  textDark: '1E293B',
  textMuted: '64748B',
};
```

---

## 📌 สรุปข้อดีของการใช้งาน

1. **DRY (Don't Repeat Yourself)**: ไม่ต้องเขียนตรรกะคำนวณตำแหน่ง `rowIndex`, `setCell`, `ws['!merges']` ซ้ำซ้อนในแต่ละหน้า
2. **Consistency**: ไฟล์ Excel ทุกไฟล์ที่ออกจากระบบจะมีมาตรฐานความสวยงาม สีสัน และสัดส่วนที่ตรงกันทั้งหมด
3. **Type-Safe**: มี TypeScript Interface ครบถ้วน ช่วยแนะนำ props และดักจับความผิดพลาดตั้งแต่ตอนเขียนโค้ด
