import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, getConnection } from "@/lib/database"
import type { Transaction, TransactionItem, Customer, CartItem, ApiResponse } from "@/lib/types"

// GET - Fetch all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const customerId = searchParams.get("customer_id")

    let query = `
      SELECT t.*, c.name as customer_name, c.phone as customer_phone, 
             c.email as customer_email, c.address as customer_address
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    if (type) {
      query += " AND t.type = ?"
      params.push(type)
    }

    if (status) {
      query += " AND t.status = ?"
      params.push(status)
    }

    if (customerId) {
      query += " AND t.customer_id = ?"
      params.push(customerId)
    }

    query += " ORDER BY t.created_at DESC"

    const result = await executeQuery(query, params)

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    const transactions = (result.data as any[]).map((row) => ({
      id: row.id,
      customer_id: row.customer_id,
      customer: {
        id: row.customer_id,
        name: row.customer_name,
        phone: row.customer_phone,
        email: row.customer_email,
        address: row.customer_address,
      },
      total: Number.parseFloat(row.total),
      type: row.type,
      status: row.status,
      notes: row.notes,
      discount: Number.parseFloat(row.discount || 0), // Include discount
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    // Fetch items for each transaction
    for (const transaction of transactions) {
      const itemsQuery = "SELECT * FROM transaction_items WHERE transaction_id = ?"
      const itemsResult = await executeQuery(itemsQuery, [transaction.id])

      if (itemsResult.success) {
        transaction.items = (itemsResult.data as TransactionItem[]).map((item) => ({
          ...item,
          unit_price: Number.parseFloat(item.unit_price as any),
          total_price: Number.parseFloat(item.total_price as any),
        }))
      }
    }

    return NextResponse.json<ApiResponse<Transaction[]>>({
      success: true,
      data: transactions,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch transactions",
      },
      { status: 500 },
    )
  }
}

// POST - Create new transaction
export async function POST(request: NextRequest) {
  const connection = await getConnection()

  try {
    await connection.beginTransaction()

    const body = await request.json()
    const { customer, items, notes, discount } = body as {
      // Include discount
      customer: Customer
      items: CartItem[]
      notes?: string
      discount?: number // Include discount in body type
    }

    if (!customer.name || !customer.phone || !items || items.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Pre-check product stock before proceeding with transaction
    for (const item of items) {
      if (item.type === "product") {
        const [productRows] = await connection.execute("SELECT stock, name FROM products WHERE id = ?", [item.id])
        const product = (productRows as any[])[0]

        if (!product || product.stock < item.quantity) {
          await connection.rollback()
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: `Insufficient stock for product: ${product?.name || item.name}. Available: ${product?.stock || 0}, Requested: ${item.quantity}`,
            },
            { status: 400 },
          )
        }
      }
    }

    // Create or get customer
    let customerId = customer.id
    if (!customerId) {
      // Check if customer exists by phone
      const [existingCustomers] = await connection.execute("SELECT id FROM customers WHERE phone = ?", [customer.phone])

      if ((existingCustomers as any[]).length > 0) {
        customerId = (existingCustomers as any[])[0].id
      } else {
        // Create new customer
        customerId = `cust-${Date.now()}`
        await connection.execute(
          "INSERT INTO customers (id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)",
          [customerId, customer.name, customer.phone, customer.email ?? null, customer.address ?? null], // Ensure null for optional fields
        )
      }
    }

    // Calculate total (subtotal before discount)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    // Calculate final total after applying discount
    const finalTotal = discount ? subtotal * (1 - discount / 100) : subtotal

    // Determine transaction type
    const hasServices = items.some((item) => item.type === "service")
    const type = hasServices ? "service" : "sale"
    const status = hasServices ? "in-progress" : "completed"

    // Create transaction
    const transactionId = `txn-${Date.now()}`
    await connection.execute(
      "INSERT INTO transactions (id, customer_id, total, type, status, notes, discount) VALUES (?, ?, ?, ?, ?, ?, ?)", // Include discount
      [transactionId, customerId, finalTotal, type, status, notes ?? null, discount ?? 0], // Pass discount
    )

    // Create transaction items
    for (const item of items) {
      const totalPrice = item.price * item.quantity
      await connection.execute(
        `INSERT INTO transaction_items 
         (transaction_id, item_id, item_type, item_name, quantity, unit_price, total_price, warranty) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, item.id, item.type, item.name, item.quantity, item.price, totalPrice, item.warranty ?? null], // Ensure null for optional warranty
      )

      // Update product stock if it's a product
      if (item.type === "product") {
        await connection.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.id])
      }
    }

    await connection.commit()

    return NextResponse.json<ApiResponse<{ id: string; customer_id: string }>>(
      {
        success: true,
        data: { id: transactionId, customer_id: customerId },
        message: "Transaction created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    await connection.rollback()
    console.error("Transaction creation error:", error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: `Failed to create transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  } finally {
    connection.release()
  }
}
