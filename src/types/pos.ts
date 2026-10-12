export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface ProductUnit {
  id: string; // e.g. 'pack', 'crate', etc.
  name: string; // e.g. 'แพ็ค', 'ลัง'
  multiplier: number; // จำนวนหน่วยหลักต่อหน่วยนี้ เช่น 6, 24
  price: number; // ราคาขายต่อหน่วยนี้
  barcode?: string; // บาร์โค้ดเฉพาะของแพ็คหรือลัง (ถ้ามี)
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // ราคาขายหน่วยหลัก (เช่น ต่อชิ้น/ขวด)
  stock: number; // จำนวนสต็อกคงเหลือในหน่วยหลัก
  image: string;
  barcode?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  baseUnit?: string; // หน่วยนับหลัก เช่น 'ชิ้น', 'ขวด', 'กระป๋อง' (default: 'ชิ้น')
  units?: ProductUnit[]; // หน่วยขายเพิ่มเติม เช่น แพ็ค, ลัง
}

export interface CartItem {
  id?: string; // cart item line id e.g. `${product.id}-${selectedUnit?.id || 'base'}`
  product: Product;
  quantity: number;
  selectedUnit?: ProductUnit;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  unitName?: string;
  unitMultiplier?: number;
}

export type PaymentMethod = 'cash' | 'promptpay' | 'credit_card';

export interface Order {
  id: string;
  receiptNumber: string;
  timestamp: string; // ISO date string
  cashierName: string;
  cashierId: string;
  customerId?: string;
  customerName?: string;
  shiftId?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percent';
  taxRate: number; // e.g. 7 for 7%
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  change?: number;
}

import type { FeatureId } from '../config/features';
export type { FeatureId };
export type MenuPermission = FeatureId;

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'cashier' | 'manager' | 'admin';
  avatar?: string;
  gender?: 'male' | 'female';
  permissions?: MenuPermission[];
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  endingCash?: number;
  expectedCash?: number;
  totalSales: number;
  totalOrders: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  points: number;
}
