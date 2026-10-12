import type { Product, Order, User, Shift, Customer } from '../types/pos';

const API_BASE = '/api';

export const apiService = {
  // Products API
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
    return res.json();
  },

  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Auth & Users API
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
    return res.json();
  },

  async registerUser(userData: {
    username: string;
    name: string;
    role: 'cashier' | 'manager' | 'admin';
    avatar?: string;
    gender?: 'male' | 'female';
    permissions?: string[];
  }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Failed to register user');
    const json = await res.json();
    return json.user || json;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  async deleteUser(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Shifts API
  async getShifts(): Promise<Shift[]> {
    const res = await fetch(`${API_BASE}/shifts`);
    if (!res.ok) throw new Error(`Failed to fetch shifts: ${res.statusText}`);
    return res.json();
  },

  async openShift(data: {
    cashierId: string;
    cashierName: string;
    startingCash: number;
    notes?: string;
  }): Promise<Shift> {
    const res = await fetch(`${API_BASE}/shifts/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to open shift');
    return res.json();
  },

  async closeShift(
    id: string,
    data: { endingCash: number; notes?: string }
  ): Promise<Shift> {
    const res = await fetch(`${API_BASE}/shifts/${id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to close shift');
    return res.json();
  },

  // Orders API
  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error(`Failed to fetch orders: ${res.statusText}`);
    return res.json();
  },

  async createOrder(data: any): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  // Customers API
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch(`${API_BASE}/customers`);
    if (!res.ok) throw new Error(`Failed to fetch customers: ${res.statusText}`);
    return res.json();
  },

  async createCustomer(data: { name: string; phone?: string; email?: string }): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  },
};
