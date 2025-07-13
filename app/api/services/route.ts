import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import type { Service, ApiResponse } from "@/lib/types"

// GET - Fetch all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = "SELECT * FROM services WHERE 1=1"
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

    return NextResponse.json<ApiResponse<Service[]>>({
      success: true,
      data: result.data as Service[],
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch services",
      },
      { status: 500 },
    )
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, price, duration, description, warranty } = body

    if (!name || !category || !price || !duration) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const id = `serv-${Date.now()}`
    const query = `
      INSERT INTO services (id, name, category, price, duration, description, warranty)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [id, name, category, price, duration, description || null, warranty || null])

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
        message: "Service created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create service",
      },
      { status: 500 },
    )
  }
}
