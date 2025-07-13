import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Get total sales
    const salesQuery = "SELECT SUM(total) as total_sales, COUNT(*) as total_transactions FROM transactions"
    const salesResult = await executeQuery(salesQuery)

    // Get total products in stock
    const stockQuery = "SELECT SUM(stock) as total_stock, COUNT(*) as total_products FROM products"
    const stockResult = await executeQuery(stockQuery)

    // Get total services
    const servicesQuery = "SELECT COUNT(*) as total_services FROM services"
    const servicesResult = await executeQuery(servicesQuery)

    // Get unique customers
    const customersQuery = "SELECT COUNT(DISTINCT customer_id) as unique_customers FROM transactions"
    const customersResult = await executeQuery(customersQuery)

    // Get low stock products
    const lowStockQuery = "SELECT * FROM products WHERE stock <= 10 ORDER BY stock ASC"
    const lowStockResult = await executeQuery(lowStockQuery)

    // Get recent transactions
    const recentQuery = `
      SELECT t.*, c.name as customer_name, c.phone as customer_phone
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `
    const recentResult = await executeQuery(recentQuery)

    const stats = {
      totalSales: salesResult.success ? Number.parseFloat((salesResult.data as any[])[0]?.total_sales || 0) : 0,
      totalTransactions: salesResult.success ? (salesResult.data as any[])[0]?.total_transactions || 0 : 0,
      totalStock: stockResult.success ? (stockResult.data as any[])[0]?.total_stock || 0 : 0,
      totalProducts: stockResult.success ? (stockResult.data as any[])[0]?.total_products || 0 : 0,
      totalServices: servicesResult.success ? (servicesResult.data as any[])[0]?.total_services || 0 : 0,
      uniqueCustomers: customersResult.success ? (customersResult.data as any[])[0]?.unique_customers || 0 : 0,
      lowStockProducts: lowStockResult.success ? lowStockResult.data : [],
      recentTransactions: recentResult.success
        ? (recentResult.data as any[]).map((row) => ({
            id: row.id,
            customer_name: row.customer_name,
            customer_phone: row.customer_phone,
            total: Number.parseFloat(row.total),
            type: row.type,
            status: row.status,
            created_at: row.created_at,
          }))
        : [],
    }

    return NextResponse.json<ApiResponse<typeof stats>>({
      success: true,
      data: stats,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch dashboard stats",
      },
      { status: 500 },
    )
  }
}
