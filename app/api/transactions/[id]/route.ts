import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import type { Transaction, TransactionItem, ApiResponse } from "@/lib/types"

// GET - Fetch single transaction
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get transaction with customer details
    const transactionQuery = `
      SELECT t.*, c.name as customer_name, c.phone as customer_phone, 
             c.email as customer_email, c.address as customer_address
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.id = ?
    `

    const transactionResult = await executeQuery(transactionQuery, [params.id])

    if (!transactionResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: transactionResult.error,
        },
        { status: 500 },
      )
    }

    const transactionRows = transactionResult.data as any[]
    if (transactionRows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Transaction not found",
        },
        { status: 404 },
      )
    }

    const row = transactionRows[0]
    const transaction: Transaction = {
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
      created_at: row.created_at,
      updated_at: row.updated_at,
    }

    // Get transaction items
    const itemsQuery = "SELECT * FROM transaction_items WHERE transaction_id = ?"
    const itemsResult = await executeQuery(itemsQuery, [params.id])

    if (itemsResult.success) {
      transaction.items = (itemsResult.data as TransactionItem[]).map((item) => ({
        ...item,
        unit_price: Number.parseFloat(item.unit_price as any),
        total_price: Number.parseFloat(item.total_price as any),
      }))
    }

    return NextResponse.json<ApiResponse<Transaction>>({
      success: true,
      data: transaction,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch transaction",
      },
      { status: 500 },
    )
  }
}

// PUT - Update transaction status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Status is required",
        },
        { status: 400 },
      )
    }

    const query = "UPDATE transactions SET status = ?, notes = ? WHERE id = ?"
    const result = await executeQuery(query, [status, notes, params.id])

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Transaction updated successfully",
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update transaction",
      },
      { status: 500 },
    )
  }
}
