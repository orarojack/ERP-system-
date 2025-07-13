"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ShoppingCart,
  Wrench,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Printer,
  Search,
  FileText,
  Smartphone,
  Zap,
  Monitor,
  Settings,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react"

import { apiClient } from "@/lib/api-client"
import type { Product, Service, CartItem, Customer, Transaction } from "@/lib/types"

export default function ElectronicShopSystem() {
  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    totalStock: 0,
    totalProducts: 0,
    totalServices: 0,
    uniqueCustomers: 0,
    lowStockProducts: [],
    recentTransactions: [],
  })
  const [dailyReportData, setDailyReportData] = useState<
    { reportDate: string; dailySales: number; dailyTransactions: number }[]
  >([])

  // UI states
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<Customer>({ id: "", name: "", phone: "", email: "", address: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pos")
  const [discountPercentage, setDiscountPercentage] = useState(0) // New state for discount

  // Loading states
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [isLoadingDailyReport, setIsLoadingDailyReport] = useState(true)
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Form states
  const [productForm, setProductForm] = useState<Omit<Product, "id" | "created_at" | "updated_at">>({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
  })

  const [serviceForm, setServiceForm] = useState<Omit<Service, "id" | "created_at" | "updated_at">>({
    name: "",
    category: "",
    price: 0,
    duration: "",
    description: "",
    warranty: "",
  })

  // Categories
  const productCategories = ["Phones", "Chargers", "Screens", "Accessories", "Cases", "Cables"]
  const serviceCategories = ["Repair", "Software", "Data", "Maintenance", "Consultation"]

  // Fetch data functions
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true)
    const response = await apiClient.getProducts({ search: searchTerm })
    if (response.success && response.data) {
      setProducts(response.data)
    } else {
      console.error("Failed to fetch products:", response.error)
    }
    setIsLoadingProducts(false)
  }, [searchTerm])

  const fetchServices = useCallback(async () => {
    setIsLoadingServices(true)
    const response = await apiClient.getServices({ search: searchTerm })
    if (response.success && response.data) {
      setServices(response.data)
    } else {
      console.error("Failed to fetch services:", response.error)
    }
    setIsLoadingServices(false)
  }, [searchTerm])

  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true)
    const response = await apiClient.getTransactions()
    if (response.success && response.data) {
      setTransactions(response.data)
    } else {
      console.error("Failed to fetch transactions:", response.error)
    }
    setIsLoadingTransactions(false)
  }, [])

  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingDashboard(true)
    const response = await apiClient.getDashboardStats()
    if (response.success && response.data) {
      setDashboardStats(response.data)
    } else {
      console.error("Failed to fetch dashboard stats:", response.error)
    }
    setIsLoadingDashboard(false)
  }, [])

  const fetchDailyReport = useCallback(async () => {
    setIsLoadingDailyReport(true)
    const response = await apiClient.getDailyReport()
    if (response.success && response.data) {
      setDailyReportData(response.data)
    } else {
      console.error("Failed to fetch daily report:", response.error)
    }
    setIsLoadingDailyReport(false)
  }, [])

  // Initial data load
  useEffect(() => {
    fetchProducts()
    fetchServices()
  }, [fetchProducts, fetchServices])

  // Refetch data when tab changes
  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts()
    } else if (activeTab === "services") {
      fetchServices()
    } else if (activeTab === "transactions") {
      fetchTransactions()
    } else if (activeTab === "dashboard") {
      fetchDashboardStats()
      fetchDailyReport() // Fetch daily report when dashboard tab is active
    }
  }, [activeTab, fetchProducts, fetchServices, fetchTransactions, fetchDashboardStats, fetchDailyReport])

  // CRUD Operations for Products
  const createProduct = async () => {
    const response = await apiClient.createProduct(productForm)
    if (response.success) {
      alert("Product created successfully!")
      fetchProducts()
      setIsProductModalOpen(false)
    } else {
      alert(`Failed to create product: ${response.error}`)
    }
  }

  const updateProduct = async () => {
    if (!editingProduct) return
    const response = await apiClient.updateProduct(editingProduct.id, productForm)
    if (response.success) {
      alert("Product updated successfully!")
      fetchProducts()
      setIsProductModalOpen(false)
      setEditingProduct(null)
    } else {
      alert(`Failed to update product: ${response.error}`)
    }
  }

  const deleteProduct = async (id: string) => {
    const response = await apiClient.deleteProduct(id)
    if (response.success) {
      alert("Product deleted successfully!")
      fetchProducts()
    } else {
      alert(`Failed to delete product: ${response.error}`)
    }
  }

  // CRUD Operations for Services
  const createService = async () => {
    const response = await apiClient.createService(serviceForm)
    if (response.success) {
      alert("Service created successfully!")
      fetchServices()
      setIsServiceModalOpen(false)
    } else {
      alert(`Failed to create service: ${response.error}`)
    }
  }

  const updateService = async () => {
    if (!editingService) return
    const response = await apiClient.updateService(editingService.id, serviceForm)
    if (response.success) {
      alert("Service updated successfully!")
      fetchServices()
      setIsServiceModalOpen(false)
      setEditingService(null)
    } else {
      alert(`Failed to update service: ${response.error}`)
    }
  }

  const deleteService = async (id: string) => {
    const response = await apiClient.deleteService(id)
    if (response.success) {
      alert("Service deleted successfully!")
      fetchServices()
    } else {
      alert(`Failed to delete service: ${response.error}`)
    }
  }

  // Modal handlers
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description,
        image_url: product.image_url,
      })
    } else {
      setEditingProduct(null)
      setProductForm({ name: "", category: "", price: 0, stock: 0, description: "" })
    }
    setIsProductModalOpen(true)
  }

  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setServiceForm({
        name: service.name,
        category: service.category,
        price: service.price,
        duration: service.duration,
        description: service.description,
        warranty: service.warranty,
      })
    } else {
      setEditingService(null)
      setServiceForm({ name: "", category: "", price: 0, duration: "", description: "", warranty: "" })
    }
    setIsServiceModalOpen(true)
  }

  // Add to cart function
  const addToCart = (item: Product | Service, type: "product" | "service") => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id && cartItem.type === type)
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id && cartItem.type === type
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        ),
      )
    } else {
      const cartItem: CartItem = {
        id: item.id,
        name: item.name,
        type,
        price: item.price,
        quantity: 1,
      }

      if (type === "service" && "warranty" in item) {
        cartItem.warranty = item.warranty
      }

      setCart([...cart, cartItem])
    }
  }

  // Remove from cart
  const removeFromCart = (id: string, type: "product" | "service") => {
    setCart(cart.filter((item) => !(item.id === id && item.type === type)))
  }

  // Update cart quantity
  const updateCartQuantity = (id: string, type: "product" | "service", quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, type)
      return
    }
    setCart(cart.map((item) => (item.id === id && item.type === type ? { ...item, quantity } : item)))
  }

  // Calculate subtotal (before discount)
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Calculate grand total (after discount)
  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = subtotal * (discountPercentage / 100)
    return subtotal - discountAmount
  }

  // Generate invoice content for services
  const generateInvoiceContent = (transaction: Transaction) => {
    const subtotal = transaction.items?.reduce((sum, item) => sum + item.total_price, 0) || 0
    const discountAmount = transaction.discount ? subtotal * (transaction.discount / 100) : 0
    const grandTotal = subtotal - discountAmount

    const invoiceContent = `
    <div style="font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.5; color: #333; max-width: 800px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Header -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
                <td style="width: 50%; vertical-align: top;">
                    <img src="/images/luifix-logo.png" alt="LuiFix Logo" style="max-width: 180px; height: auto; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">Micro-soldering and Data recovery</div>
                </td>
                <td style="width: 50%; text-align: right; vertical-align: top;">
                    <div style="font-weight: bold; font-size: 24px; color: #1a202c; margin-bottom: 5px;">Repair experts</div>
                    <div style="font-size: 12px; color: #555;">KISUMU, MASENO</div>
                    <div style="font-size: 12px; color: #555;">+254714679084</div>
                    <div style="font-size: 12px; color: #555;">briankanyoro2002@gmail.com</div>
                    <div style="font-size: 12px; color: #555;">https://repairexperts.net</div>
                </td>
            </tr>
        </table>
        <hr style="border: none; border-top: 2px solid #e0e0e0; margin-bottom: 30px;">

        <!-- INVOICE Title -->
        <div style="text-align: center; font-size: 32px; font-weight: 800; color: #1a202c; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 40px;">INVOICE</div>

        <!-- Invoice Details & Bill To -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #777; margin-bottom: 8px;">Bill To</div>
                    <div style="font-size: 16px; font-weight: bold; color: #1a202c; margin-bottom: 4px;">${transaction.customer?.name.toUpperCase() || "N/A"}</div>
                    <div style="font-size: 12px; color: #555;">${transaction.customer?.address || "N/A"}</div>
                    <div style="font-size: 12px; color: #555;">${transaction.customer?.phone || "N/A"}</div>
                    ${transaction.customer?.email ? `<div style="font-size: 12px; color: #555;">${transaction.customer.email}</div>` : ""}
                </td>
                <td style="width: 50%; text-align: right; vertical-align: top;">
                    <div style="font-size: 20px; font-weight: bold; color: #3b82f6; background-color: #e0f2fe; padding: 8px 15px; display: inline-block; border-radius: 8px; margin-bottom: 10px; letter-spacing: 1px;">
                        INVCE${transaction.id.split("-")[1] || "00"}
                    </div>
                    <div style="font-size: 14px; color: #555; margin-top: 5px;">Date: ${new Date(transaction.created_at || "").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
                    <div style="font-size: 14px; color: #555;">Status: <span style="font-weight: bold; color: ${transaction.status === "completed" ? "#22c55e" : transaction.status === "in-progress" ? "#f59e0b" : "#ef4444"};">${transaction.status.toUpperCase()}</span></div>
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <thead>
                <tr style="background-color: #3b82f6; color: white; text-transform: uppercase; font-size: 11px;">
                    <th style="padding: 12px 8px; text-align: left; width: 8%;">Sr no.</th>
                    <th style="padding: 12px 8px; text-align: left; width: 42%;">Description</th>
                    <th style="padding: 12px 8px; text-align: center; width: 10%;">Qty</th>
                    <th style="padding: 12px 8px; text-align: right; width: 20%;">Unit Price</th>
                    <th style="padding: 12px 8px; text-align: right; width: 20%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${transaction.items
                  ?.map(
                    (item, index) => `
                    <tr style="background-color: ${index % 2 === 0 ? "#f9f9f9" : "#ffffff"};">
                        <td style="padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top;">${index + 1}</td>
                        <td style="padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top;">
                            <div style="font-weight: bold; color: #1a202c;">${item.item_name}</div>
                            ${item.item_id ? `<div style="font-size: 10px; color: #666;">ID: ${item.item_id}</div>` : ""}
                            ${item.item_type === "service" ? `<div style="font-size: 10px; color: #666;">Type: Service</div>` : ""}
                            ${item.warranty ? `<div style="font-size: 10px; color: #666;">Warranty: ${item.warranty}</div>` : ""}
                        </td>
                        <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: center; vertical-align: top;">${item.quantity}</td>
                        <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">KSh ${item.unit_price.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top; font-weight: bold; color: #22c55e;">KSh ${item.total_price.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>

        <!-- Notes and Totals -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
                <td style="width: 60%; vertical-align: top; padding-right: 20px;">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #1a202c;">Payment Instructions</div>
                    <div style="font-size: 11px; line-height: 1.6; color: #555;">
                        <div style="margin-bottom: 5px;">1. All payments should be made to our official Accounts:</div>
                        <div style="margin-left: 15px; font-weight: bold; color: #000;">Lipa na Mpesa Buy goods</div>
                        <div style="margin-left: 15px; font-weight: bold; color: #000;">Till: 4351338</div>
                        <div style="margin-top: 10px; text-align: center; font-weight: bold; color: #000;">OR</div>
                        <div style="margin-left: 15px; margin-top: 10px; font-weight: bold; color: #000;">Send Money: +254714679084</div>
                    </div>
                    <div style="font-weight: bold; font-size: 14px; margin-top: 25px; color: #ef4444;">Total Outstanding Payment : KSh ${grandTotal.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </td>
                <td style="width: 40%; vertical-align: top; text-align: right;">
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                        <tr>
                            <td style="padding: 10px 15px; border-bottom: 1px solid #eee; font-weight: bold; text-align: left; background-color: #f9f9f9;">Subtotal</td>
                            <td style="padding: 10px 15px; border-bottom: 1px solid #eee; text-align: right; background-color: #f9f9f9;">KSh ${subtotal.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        ${
                          transaction.discount && transaction.discount > 0
                            ? `
                        <tr>
                            <td style="padding: 10px 15px; border-bottom: 1px solid #eee; font-weight: bold; text-align: left; color: #ef4444;">Discount (${transaction.discount}%)</td>
                            <td style="padding: 10px 15px; border-bottom: 1px solid #eee; text-align: right; color: #ef4444;">- KSh ${discountAmount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        `
                            : ""
                        }
                        <tr style="background-color: #3b82f6; color: white; font-size: 16px;">
                            <td style="padding: 12px 15px; font-weight: bold; text-align: left;">Grand Total</td>
                            <td style="padding: 12px 15px; text-align: right; font-weight: bold;">KSh ${grandTotal.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 15px; border-top: 1px solid #eee; font-weight: bold; text-align: left; background-color: #f9f9f9;">Balance Due</td>
                            <td style="padding: 10px 15px; border-top: 1px solid #eee; text-align: right; font-weight: bold; color: #ef4444; background-color: #f9f9f9;">KSh ${grandTotal.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Signature -->
        <div style="text-align: right; margin-top: 50px; margin-bottom: 20px;">
            <img src="/placeholder.svg?height=80&width=150" alt="Signature" style="max-width: 150px; height: auto; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            <div style="font-weight: bold; font-size: 14px; color: #1a202c;">Luis Wanderi</div>
            <div style="font-size: 11px; color: #555;">Authorized Signature</div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #777;">
            <p style="margin-bottom: 5px;">Thank you for your business! We appreciate your prompt payment.</p>
            <p>&copy; ${new Date().getFullYear()} Repair experts. All rights reserved.</p>
        </div>
    </div>
    `
    return invoiceContent
  }

  // Generate receipt content for thermal printer (58mm width)
  const generateReceiptContent = (transaction: Transaction) => {
    const subtotal = transaction.items?.reduce((sum, item) => sum + item.total_price, 0) || 0
    const discountAmount = transaction.discount ? subtotal * (transaction.discount / 100) : 0
    const grandTotal = subtotal - discountAmount

    const receiptContent = `
    <div style="width: 58mm; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.3; color: #000;">
      <!-- Header Section -->
      <div style="text-align: center; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 6px;">
          <div style="width: 24px; height: 24px; background: #000; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 6px;">
            <span style="color: white; font-size: 10px; font-weight: bold;">TR</span>
          </div>
          <div>
            <div style="font-size: 14px; font-weight: bold; margin: 0;">TechRepair</div>
          </div>
        </div>
        <div style="font-size: 9px; color: #666; margin: 1px 0;">Micro-soldering and Data recovery</div>
        <div style="font-size: 9px; margin: 1px 0;">KIMATHI STREET, NAIROBI</div>
        <div style="font-size: 9px; margin: 1px 0;">+254792472328</div>
        <div style="font-size: 9px; margin: 1px 0;">techrepair@gmail.com</div>
        <div style="font-size: 9px; margin: 1px 0;">https://techrepair.net</div>
      </div>

      <!-- Invoice Title -->
      <div style="text-align: center; margin: 8px 0;">
        <div style="font-size: 16px; font-weight: bold; letter-spacing: 1px;">INVOICE</div>
      </div>

      <!-- Bill To and Invoice Details -->
      <div style="margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 6px;">
        <div style="font-size: 10px; font-weight: bold; text-decoration: underline; margin-bottom: 3px;">Bill To</div>
        <div style="font-size: 10px; font-weight: bold; text-decoration: underline;">${transaction.customer?.name.toUpperCase() || "N/A"}</div>
        <div style="font-size: 9px; margin: 1px 0;">${transaction.customer?.name || "N/A"}</div>
        <div style="font-size: 9px; margin: 1px 0;">${transaction.customer?.phone || "N/A"}</div>
        ${transaction.customer?.email ? `<div style="font-size: 9px; margin: 1px 0;">${transaction.customer.email}</div>` : ""}
        
        <div style="text-align: right; margin-top: 4px;">
          <div style="font-size: 12px; font-weight: bold;">${transaction.id}</div>
          <div style="font-size: 9px;">${new Date(transaction.created_at || transaction.date).toLocaleDateString("en-GB")}</div>
        </div>
      </div>

      <!-- Items Table Header -->
      <div style="margin-bottom: 4px;">
        <div style="display: flex; font-size: 9px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px;">
          <div style="width: 8%; text-align: left;">Sr</div>
          <div style="width: 42%; text-align: left;">Product</div>
          <div style="width: 12%; text-align: center;">Qty</div>
          <div style="width: 18%; text-align: right;">Rate</div>
          <div style="width: 20%; text-align: right;">Amount</div>
        </div>
      </div>

      <!-- Items -->
      <div style="margin-bottom: 8px;">
        ${transaction.items
          ?.map(
            (item, index) => `
          <div style="margin-bottom: 4px; border-bottom: 1px dotted #ccc; padding-bottom: 3px;">
            <div style="display: flex; font-size: 9px;">
              <div style="width: 8%; text-align: left;">${index + 1}</div>
              <div style="width: 42%; text-align: left;">
                <div style="font-weight: 500; line-height: 1.2;">${item.item_name}</div>
                ${
                  item.item_type === "service"
                    ? `
                  <div style="font-size: 8px; color: #666;">SR${item.item_id}</div>
                  <div style="font-size: 8px; color: #666;">Priority: ${item.item_type.toUpperCase()}</div>
                  ${item.warranty ? `<div style="font-size: 8px; color: #666;">${item.warranty}</div>` : ""}
                `
                    : `
                  <div style="font-size: 8px; color: #666;">PR${item.item_id}</div>
                `
                }
              </div>
              <div style="width: 12%; text-align: center;">${item.quantity.toFixed(2)}</div>
              <div style="width: 18%; text-align: right;">${item.unit_price.toFixed(2)}</div>
              <div style="width: 20%; text-align: right; font-weight: bold;">${(item.total_price).toFixed(2)}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>

      <!-- Totals Section -->
      <div style="border-top: 1px solid #000; padding-top: 4px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0;">
          <span style="font-weight: bold;">Subtotal</span>
          <span style="font-weight: bold;">KSh ${subtotal.toFixed(2)}</span>
        </div>
        ${
          transaction.discount && transaction.discount > 0
            ? `
        <div style="display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0; color: #ef4444;">
          <span style="font-weight: bold;">Discount (${transaction.discount}%)</span>
          <span style="font-weight: bold;">- KSh ${discountAmount.toFixed(2)}</span>
        </div>
        `
            : ""
        }
        <div style="display: flex; justify-content: space-between; font-size: 11px; background: #000; color: white; padding: 3px; margin: 2px 0;">
          <span style="font-weight: bold;">Grand Total</span>
          <span style="font-weight: bold;">KSh ${grandTotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0;">
          <span style="font-weight: bold;">Balance</span>
          <span style="font-weight: bold;">KSh ${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <!-- Payment Instructions -->
      <div style="border-top: 1px dashed #000; padding-top: 6px; margin-bottom: 8px;">
        <div style="font-size: 9px; font-weight: bold; margin-bottom: 3px;">Please Note</div>
        <div style="font-size: 8px; line-height: 1.3;">
          <div style="margin: 1px 0;">1. All payments should be made to our</div>
          <div style="margin: 1px 0;">   official Accounts:</div>
          <div style="margin: 2px 0; font-weight: bold;">   Lipa na Mpesa Buy goods</div>
          <div style="margin: 1px 0;">   PAYBILL: 542542</div>
          <div style="margin: 1px 0;">   ACC NO: 542542</div>
          <div style="margin: 2px 0; text-align: center; font-weight: bold;">OR</div>
          <div style="margin: 1px 0;">   Send Money: +254714679084</div>
          <div style="margin: 3px 0; font-weight: bold; border-top: 1px dotted #000; padding-top: 2px;">
            Total Outstanding Payment: KSh ${grandTotal.toFixed(2)}
          </div>
        </div>
      </div>

      <!-- Signature Section -->
      <div style="text-align: right; margin: 8px 0; border-top: 1px dashed #000; padding-top: 6px;">
        <div style="display: inline-block; text-align: center;">
          <div style="width: 80px; height: 20px; border-bottom: 1px solid #000; margin-bottom: 2px; position: relative;">
            <div style="position: absolute; bottom: 1px; right: 8px; font-family: cursive; font-size: 8px;">TechRepair</div>
          </div>
          <div style="font-size: 8px; font-weight: bold;">Tech Repair Manager</div>
          <div style="font-size: 8px;">Signature</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="display: flex; justify-content: space-between; border-top: 1px solid #000; padding-top: 4px; font-size: 8px;">
        <div>
          <div style="font-weight: bold; margin-bottom: 2px;">Payable To</div>
          <div>Tech Repair Manager</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: bold; margin-bottom: 2px;">Banking Details</div>
          <div>TILL: 4351338</div>
        </div>
      </div>

      <!-- Thank you message -->
      <div style="text-align: center; margin-top: 8px; border-top: 1px dashed #000; padding-top: 6px;">
        <div style="font-size: 9px; font-weight: bold;">Thank you for your business!</div>
        <div style="font-size: 8px; margin: 1px 0;">Warranty applies as specified</div>
        <div style="font-size: 8px; margin: 1px 0;">Visit us again!</div>
      </div>
    </div>
  `
    return receiptContent
  }

  // Print receipt function optimized for thermal printer
  const printReceipt = (transaction: Transaction) => {
    const receiptContent = generateReceiptContent(transaction)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            @media print {
              @page { 
                size: 58mm auto; 
                margin: 0mm;
                padding: 0mm;
              }
              body { 
                margin: 0; 
                padding: 2mm;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                line-height: 1.3;
                color: #000;
                background: white;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            @media screen {
              body {
                width: 58mm;
                margin: 20px auto;
                padding: 10px;
                border: 1px solid #ccc;
                font-family: 'Courier New', monospace;
                background: white;
              }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
          <script>
            window.onload = function() {
              // Auto print after a short delay
              setTimeout(function() {
                window.print();
                // Close window after printing (optional)
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
            }
          </script>
        </body>
      </html>
    `)
      printWindow.document.close()
    }
  }

  // Print invoice function
  const printInvoice = (transaction: Transaction) => {
    const invoiceContent = generateInvoiceContent(transaction)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${transaction.id}</title>
            <style>
              @media print {
                @page { 
                  size: A4; 
                  margin: 20mm; 
                }
                body { 
                  margin: 0; 
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${invoiceContent}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Process transaction
  const processTransaction = async () => {
    if (cart.length === 0 || !customer.name || !customer.phone) {
      alert("Please add items to cart and fill customer information")
      return
    }

    setIsProcessingTransaction(true)
    const response = await apiClient.createTransaction({ customer, items: cart, discount: discountPercentage }) // Pass discount

    if (response.success && response.data) {
      alert("Transaction completed successfully!")
      // Fetch the newly created transaction with all its details for printing
      const newTransactionResponse = await apiClient.getTransaction(response.data.id)
      if (newTransactionResponse.success && newTransactionResponse.data) {
        printReceipt(newTransactionResponse.data)
      } else {
        console.error("Failed to fetch new transaction for printing:", newTransactionResponse.error)
        alert("Transaction created, but failed to fetch details for printing.")
      }

      // Clear cart and customer
      setCart([])
      setCustomer({ id: "", name: "", phone: "", email: "", address: "" })
      setDiscountPercentage(0) // Reset discount
      fetchTransactions() // Refresh transactions list
      fetchProducts() // Refresh product stock levels
      fetchDashboardStats() // Refresh dashboard stats
      fetchDailyReport() // Refresh daily report
    } else {
      alert(`Failed to complete transaction: ${response.error}`)
    }
    setIsProcessingTransaction(false)
  }

  // Filter products and services based on search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts()
      fetchServices()
    }, 300) // Debounce search input

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, fetchProducts, fetchServices])

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "phones":
        return <Smartphone className="h-4 w-4" />
      case "chargers":
        return <Zap className="h-4 w-4" />
      case "screens":
        return <Monitor className="h-4 w-4" />
      case "repair":
        return <Wrench className="h-4 w-4" />
      case "software":
        return <Settings className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  // Filter products based on search term
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Filter services based on search term
  const filteredServices = services.filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Send invoice via WhatsApp
  const sendWhatsAppInvoice = (transaction: Transaction) => {
    const whatsappNumber = "+254714679084" // The specified WhatsApp number
    const subtotal = transaction.items?.reduce((sum, item) => sum + item.total_price, 0) || 0
    const discountAmount = transaction.discount ? subtotal * (transaction.discount / 100) : 0
    const grandTotal = subtotal - discountAmount

    const invoiceSummary = `
*Repair experts Invoice*
Invoice #: INVCE${transaction.id.split("-")[1] || "00"}
Date: ${new Date(transaction.created_at || "").toLocaleDateString("en-GB")}

*Bill To:*
${transaction.customer?.name || "N/A"}
${transaction.customer?.phone || "N/A"}

*Items:*
${transaction.items?.map((item) => `- ${item.item_name} (Qty: ${item.quantity}, Price: KSh ${item.unit_price.toLocaleString()})`).join("\n")}

*Subtotal: KSh ${subtotal.toLocaleString()}*
${transaction.discount && transaction.discount > 0 ? `*Discount (${transaction.discount}%): - KSh ${discountAmount.toLocaleString()}*\n` : ""}
*Grand Total: KSh ${grandTotal.toLocaleString()}*
Balance: KSh ${grandTotal.toLocaleString()}

*Payment Instructions:*
Lipa na Mpesa Buy goods
Pay Bill: 542542
Account Number: 16645
OR
Send Money: 0714679084

Total Outstanding Payment: KSh ${grandTotal.toLocaleString()}

Thank you for your business!
    `.trim()

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(invoiceSummary)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/25 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            <Smartphone className="h-10 w-10 text-white relative z-10" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tight">
            Repair Experts
          </h1>
          <p className="text-gray-600 text-xl font-medium">Advanced Electronics & Repair Management System</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10 rounded-2xl p-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-2xl"></div>
            {[
              { value: "pos", icon: ShoppingCart, label: "Point of Sale" },
              { value: "products", icon: Package, label: "Products" },
              { value: "services", icon: Wrench, label: "Services" },
              { value: "transactions", icon: DollarSign, label: "Transactions" },
              { value: "dashboard", icon: TrendingUp, label: "Dashboard" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 rounded-xl transition-all duration-300 relative z-10 font-medium"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Point of Sale Tab */}
          <TabsContent value="pos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Products and Services */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products and services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/70 backdrop-blur-sm border-white/20 shadow-lg"
                    />
                  </div>
                </div>

                {/* Products Section */}
                <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10 rounded-2xl relative overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-t-2xl relative overflow-hidden">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isLoadingProducts ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">Loading products...</span>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No products found.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="group border border-white/30 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-300/50 transition-all duration-500 bg-white/70 backdrop-blur-sm relative overflow-hidden hover:scale-[1.02]"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {product.name}
                              </h3>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                {getCategoryIcon(product.category)}
                                {product.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-lg font-bold text-green-600">
                                  KSH {product.price.toLocaleString()}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Package className="h-3 w-3" />
                                  Stock: {product.stock}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addToCart(product, "product")}
                                disabled={product.stock === 0}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Services Section */}
                <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10 rounded-2xl relative overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-2xl relative overflow-hidden">
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isLoadingServices ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        <span className="ml-2 text-gray-600">Loading services...</span>
                      </div>
                    ) : services.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No services found.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredServices.map((service) => (
                          <div
                            key={service.id}
                            className="group border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 bg-white/50"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {service.name}
                              </h3>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getCategoryIcon(service.category)}
                                {service.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-lg font-bold text-blue-600">
                                  KSH {service.price.toLocaleString()}
                                </span>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {service.duration}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {service.warranty}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(service, "service")}
                                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                Add Service
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Cart and Customer Info */}
              <div className="space-y-6">
                {/* Customer Information */}
                <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10 rounded-2xl relative overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl relative overflow-hidden">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                        Name *
                      </Label>
                      <Input
                        id="customerName"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        placeholder="Customer name"
                        className="mt-1 bg-white/70"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-700">
                        Phone *
                      </Label>
                      <Input
                        id="customerPhone"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        placeholder="Phone number"
                        className="mt-1 bg-white/70"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        placeholder="Email address"
                        className="mt-1 bg-white/70"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerAddress" className="text-sm font-medium text-gray-700">
                        Address
                      </Label>
                      <Textarea
                        id="customerAddress"
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        placeholder="Customer address"
                        className="mt-1 bg-white/70"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shopping Cart */}
                <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10 rounded-2xl relative overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-2xl relative overflow-hidden">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Cart ({cart.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map((item, index) => (
                          <div
                            key={`${item.id}-${item.type}-${index}`}
                            className="flex items-center justify-between p-4 border border-white/30 rounded-xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Badge variant={item.type === "product" ? "default" : "secondary"} className="text-xs">
                                  {item.type}
                                </Badge>
                                <span>KSH {item.price.toLocaleString()}</span>
                                {item.warranty && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.warranty} warranty
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCartQuantity(item.id, item.type, item.quantity - 1)}
                                  className="h-6 w-6 p-0"
                                >
                                  -
                                </Button>
                                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCartQuantity(item.id, item.type, item.quantity + 1)}
                                  className="h-6 w-6 p-0"
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-green-600">
                                KSH {(item.price * item.quantity).toLocaleString()}
                              </span>
                              <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id, item.type)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <Separator />

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Subtotal:</span>
                            <span className="text-green-600">KSH {calculateSubtotal().toLocaleString()}</span>
                          </div>
                          <div className="mt-2">
                            <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
                              Discount (%)
                            </Label>
                            <Input
                              id="discount"
                              type="number"
                              min="0"
                              max="100"
                              value={discountPercentage}
                              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                              placeholder="0"
                              className="mt-1 bg-white/70"
                            />
                          </div>
                          {discountPercentage > 0 && (
                            <div className="flex justify-between items-center text-sm text-red-600 mt-1">
                              <span>Discount Amount:</span>
                              <span>- KSH {(calculateSubtotal() * (discountPercentage / 100)).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-lg font-bold text-blue-600 mt-2">
                            <span>Grand Total:</span>
                            <span>KSH {calculateGrandTotal().toLocaleString()}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3"
                          onClick={processTransaction}
                          disabled={cart.length === 0 || !customer.name || !customer.phone || isProcessingTransaction}
                        >
                          {isProcessingTransaction ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {isProcessingTransaction ? "Processing..." : "Complete Sale & Print Receipt"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Products Management Tab */}
          <TabsContent value="products">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10 rounded-2xl relative overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-t-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Management
                  </CardTitle>
                  <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => openProductModal()} className="bg-white text-blue-600 hover:bg-blue-50">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                          {editingProduct ? "Update product information" : "Enter product details to add to inventory"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="category" className="text-right">
                            Category
                          </Label>
                          <Select
                            value={productForm.category}
                            onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {productCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="price" className="text-right">
                            Price (KSH)
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="stock" className="text-right">
                            Stock
                          </Label>
                          <Input
                            id="stock"
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={editingProduct ? updateProduct : createProduct}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500"
                        >
                          {editingProduct ? "Update Product" : "Add Product"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingProducts ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">Loading products...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No products found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className="hover:bg-blue-50/50">
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              {getCategoryIcon(product.category)}
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">KSH {product.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                            >
                              {product.stock > 0 ? product.stock : "Out of Stock"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProductModal(product)}
                                className="hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-red-50 hover:border-red-300 bg-transparent"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteProduct(product.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Management Tab */}
          <TabsContent value="services">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10 rounded-2xl relative overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Service Management
                  </CardTitle>
                  <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => openServiceModal()}
                        className="bg-white text-indigo-600 hover:bg-indigo-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                        <DialogDescription>
                          {editingService ? "Update service information" : "Enter service details to add to offerings"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="serviceName" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="serviceName"
                            value={serviceForm.name}
                            onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="serviceCategory" className="text-right">
                            Category
                          </Label>
                          <Select
                            value={serviceForm.category}
                            onValueChange={(value) => setServiceForm({ ...serviceForm, category: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="servicePrice" className="text-right">
                            Price (KSH)
                          </Label>
                          <Input
                            id="servicePrice"
                            type="number"
                            value={serviceForm.price}
                            onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="serviceDuration" className="text-right">
                            Duration
                          </Label>
                          <Input
                            id="serviceDuration"
                            value={serviceForm.duration}
                            onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                            placeholder="e.g., 1-2 hours"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="serviceWarranty" className="text-right">
                            Warranty
                          </Label>
                          <Input
                            id="serviceWarranty"
                            value={serviceForm.warranty}
                            onChange={(e) => setServiceForm({ ...serviceForm, warranty: e.target.value })}
                            placeholder="e.g., 3 months"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="serviceDescription" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="serviceDescription"
                            value={serviceForm.description}
                            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={editingService ? updateService : createService}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500"
                        >
                          {editingService ? "Update Service" : "Add Service"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingServices ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <span className="ml-2 text-gray-600">Loading services...</span>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No services found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Warranty</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id} className="hover:bg-indigo-50/50">
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              {getCategoryIcon(service.category)}
                              {service.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">KSH {service.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-500" />
                              {service.duration}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {service.warranty}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openServiceModal(service)}
                                className="hover:bg-indigo-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-red-50 hover:border-red-300 bg-transparent"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{service.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteService(service.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10 rounded-2xl relative overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-2xl relative overflow-hidden">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription className="text-green-100">
                  View and manage all sales and service transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingTransactions ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                    <span className="ml-2 text-gray-600">Loading transactions...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No transactions yet</p>
                    <p className="text-gray-400">Start making sales to see transaction history</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-green-50/50">
                          <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{transaction.customer?.name || "N/A"}</div>
                              <div className="text-sm text-gray-500">{transaction.customer?.phone || "N/A"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.type === "service" ? "secondary" : "default"}
                              className="flex items-center gap-1 w-fit"
                            >
                              {transaction.type === "service" ? (
                                <Wrench className="h-3 w-3" />
                              ) : (
                                <Package className="h-3 w-3" />
                              )}
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.status === "completed"
                                  ? "default"
                                  : transaction.status === "in-progress"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="flex items-center gap-1 w-fit"
                            >
                              {transaction.status === "completed" ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : transaction.status === "in-progress" ? (
                                <Clock className="h-3 w-3" />
                              ) : (
                                <AlertTriangle className="h-3 w-3" />
                              )}
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            KSH {transaction.total.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(transaction.created_at || "").toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => printReceipt(transaction)}
                                className="hover:bg-blue-50"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => printInvoice(transaction)}
                                className="hover:bg-green-50"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendWhatsAppInvoice(transaction)}
                                className="hover:bg-green-50"
                              >
                                <img
                                  src="/placeholder.svg?height=16&width=16"
                                  alt="WhatsApp Icon"
                                  className="h-4 w-4"
                                />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {isLoadingDashboard || isLoadingDailyReport ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <span className="ml-4 text-lg text-gray-600">Loading dashboard...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                      <DollarSign className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">KSH {dashboardStats.totalSales.toLocaleString()}</div>
                      <p className="text-xs text-green-100">From {dashboardStats.totalTransactions} transactions</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
                      <Package className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.totalStock}</div>
                      <p className="text-xs text-blue-100">Across {dashboardStats.totalProducts} products</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Services Offered</CardTitle>
                      <Wrench className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.totalServices}</div>
                      <p className="text-xs text-purple-100">Active repair services</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Customers Served</CardTitle>
                      <Users className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.uniqueCustomers}</div>
                      <p className="text-xs text-orange-100">Unique customers</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Low Stock Alert
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {dashboardStats.lowStockProducts.length === 0 ? (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <p className="text-gray-500">All products are well stocked!</p>
                          </div>
                        ) : (
                          dashboardStats.lowStockProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900">{product.name}</h4>
                                <p className="text-sm text-gray-600">{product.category}</p>
                              </div>
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {product.stock} left
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {dashboardStats.recentTransactions.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No recent transactions</p>
                          </div>
                        ) : (
                          dashboardStats.recentTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white/50 hover:shadow-md transition-shadow"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900">{transaction.customer_name}</h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(transaction.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-600">
                                  KSH {transaction.total.toLocaleString()}
                                </div>
                                <Badge
                                  variant={transaction.type === "service" ? "secondary" : "default"}
                                  className="text-xs"
                                >
                                  {transaction.type}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daily Sales Report */}
                  <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Daily Sales Report (Last 30 Days)
                      </CardTitle>
                      <CardDescription className="text-purple-100">
                        Total revenue and transactions per day. (Note: True profit requires product cost data.)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {isLoadingDailyReport ? (
                        <div className="flex justify-center items-center h-32">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                          <span className="ml-2 text-gray-600">Loading daily report...</span>
                        </div>
                      ) : dailyReportData.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No daily sales data available.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Daily Sales (KSH)</TableHead>
                                <TableHead className="text-right">Transactions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dailyReportData.map((day) => (
                                <TableRow key={day.reportDate} className="hover:bg-purple-50/50">
                                  <TableCell className="font-medium">
                                    {new Date(day.reportDate).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold text-green-600">
                                    {day.dailySales.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right">{day.dailyTransactions}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
