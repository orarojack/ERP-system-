import type { Product, Service, Customer, Transaction, CartItem, ApiResponse } from "./types"

const API_BASE = "/api"

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Products API
  async getProducts(params?: { category?: string; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set("category", params.category)
    if (params?.search) searchParams.set("search", params.search)

    const query = searchParams.toString()
    return this.request<Product[]>(`/products${query ? `?${query}` : ""}`)
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`)
  }

  async createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
    return this.request<{ id: string }>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  }

  async updateProduct(id: string, product: Omit<Product, "id" | "created_at" | "updated_at">) {
    return this.request<void>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, {
      method: "DELETE",
    })
  }

  // Services API
  async getServices(params?: { category?: string; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set("category", params.category)
    if (params?.search) searchParams.set("search", params.search)

    const query = searchParams.toString()
    return this.request<Service[]>(`/services${query ? `?${query}` : ""}`)
  }

  async getService(id: string) {
    return this.request<Service>(`/services/${id}`)
  }

  async createService(service: Omit<Service, "id" | "created_at" | "updated_at">) {
    return this.request<{ id: string }>("/services", {
      method: "POST",
      body: JSON.stringify(service),
    })
  }

  async updateService(id: string, service: Omit<Service, "id" | "created_at" | "updated_at">) {
    return this.request<void>(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(service),
    })
  }

  async deleteService(id: string) {
    return this.request<void>(`/services/${id}`, {
      method: "DELETE",
    })
  }

  // Customers API
  async getCustomers(params?: { search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)

    const query = searchParams.toString()
    return this.request<Customer[]>(`/customers${query ? `?${query}` : ""}`)
  }

  async createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) {
    return this.request<{ id: string }>("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    })
  }

  // Transactions API
  async getTransactions(params?: { type?: string; status?: string; customer_id?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set("type", params.type)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.customer_id) searchParams.set("customer_id", params.customer_id)

    const query = searchParams.toString()
    return this.request<Transaction[]>(`/transactions${query ? `?${query}` : ""}`)
  }

  async getTransaction(id: string) {
    return this.request<Transaction>(`/transactions/${id}`)
  }

  async createTransaction(data: { customer: Customer; items: CartItem[]; notes?: string }) {
    return this.request<{ id: string; customer_id: string }>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTransaction(id: string, data: { status: string; notes?: string }) {
    return this.request<void>(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Dashboard API
  async getDashboardStats() {
    return this.request<{
      totalSales: number
      totalTransactions: number
      totalStock: number
      totalProducts: number
      totalServices: number
      uniqueCustomers: number
      lowStockProducts: Product[]
      recentTransactions: any[]
    }>("/dashboard/stats")
  }
}

export const apiClient = new ApiClient()
