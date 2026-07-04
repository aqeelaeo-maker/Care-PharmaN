export type UserRole = 'Super Admin' | 'Admin' | 'Pharmacist' | 'Cashier' | 'Store Manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  branchId?: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  genericName: string;
  category: string;
  subcategory?: string;
  barcode: string;
  batchNumber: string;
  mfgDate: string;
  expDate: string;
  purchasePrice: number;
  salePrice: number;
  discountPrice?: number;
  stock: number;
  unit: 'tablet' | 'strip' | 'bottle' | 'box' | 'carton';
  minStockLevel: number;
  imageUrl?: string;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  outstandingBalance: number;
  createdAt: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  cashierId: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Mobile Wallet' | 'Credit Sale';
  status: 'Completed' | 'Refunded' | 'On Hold';
  createdAt: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}
