import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import type { Customer, ApiResponse } from "@/lib/types"

// GET - Fetch all customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = "SELECT * FROM customers WHERE 1=1"
    const params: any[] = []

    if (search) {
      query += " AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += " ORDER BY created_at DESC"

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

    return NextResponse.json<ApiResponse<Customer[]>>({
      success: true,
      data: result.data as Customer[],
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch customers",
      },
      { status: 500 },
    )
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, address } = body

    if (!name || !phone) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Name and phone are required",
        },
        { status: 400 },
      )
    }

    // Check if customer with phone already exists
    const existingQuery = "SELECT id FROM customers WHERE phone = ?"
    const existingResult = await executeQuery(existingQuery, [phone])

    if (existingResult.success && (existingResult.data as any[]).length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Customer with this phone number already exists",
        },
        { status: 409 },
      )
    }

    const id = `cust-${Date.now()}`
    const query = `
      INSERT INTO customers (id, name, phone, email, address)
      VALUES (?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [id, name, phone, email || null, address || null])

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json<ApiResponse<{ id: string }>>(
      {
        success: true,
        data: { id },
        message: "Customer created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create customer",
      },
      { status: 500 },
    )
  }
}
