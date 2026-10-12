export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  barcode?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
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

export type MenuPermission = 'pos' | 'products' | 'shifts' | 'staff' | 'sales' | 'reports';

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
