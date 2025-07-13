import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import type { Product, ApiResponse } from "@/lib/types"

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = "SELECT * FROM products WHERE 1=1"
    const params: any[] = []

    if (category) {
      query += " AND category = ?"
      params.push(category)
    }

    if (search) {
      query += " AND (name LIKE ? OR description LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
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

    return NextResponse.json<ApiResponse<Product[]>>({
      success: true,
      data: result.data as Product[],
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 },
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, price, stock, description, image_url } = body

    if (!name || !category || !price || stock === undefined) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const id = `prod-${Date.now()}`
    const query = `
      INSERT INTO products (id, name, category, price, stock, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [id, name, category, price, stock, description || null, image_url || null])

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
        message: "Product created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create product",
      },
      { status: 500 },
    )
  }
}
