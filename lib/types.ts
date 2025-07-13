export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  description: string
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface Service {
  id: string
  name: string
  category: string
  price: number
  duration: string
  description: string
  warranty: string
  created_at?: string
  updated_at?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  created_at?: string
  updated_at?: string
}

export interface Transaction {
  id: string
  customer_id: string
  customer?: Customer
  total: number
  type: "sale" | "service"
  status: "completed" | "pending" | "in-progress"
  notes?: string
  items?: TransactionItem[]
  created_at?: string
  updated_at?: string
}

export interface TransactionItem {
  id?: number
  transaction_id: string
  item_id: string
  item_type: "product" | "service"
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  warranty?: string
  created_at?: string
}

export interface CartItem {
  id: string
  name: string
  type: "product" | "service"
  price: number
  quantity: number
  warranty?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
