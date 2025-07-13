import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import type { Service, ApiResponse } from "@/lib/types"

// GET - Fetch single service
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const query = "SELECT * FROM services WHERE id = ?"
    const result = await executeQuery(query, [params.id])

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    const services = result.data as Service[]
    if (services.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Service not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json<ApiResponse<Service>>({
      success: true,
      data: services[0],
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch service",
      },
      { status: 500 },
    )
  }
}

// PUT - Update service
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, category, price, duration, description, warranty } = body

    const query = `
      UPDATE services 
      SET name = ?, category = ?, price = ?, duration = ?, description = ?, warranty = ?
      WHERE id = ?
    `

    const result = await executeQuery(query, [name, category, price, duration, description || null, warranty || null, params.id])

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
      message: "Service updated successfully",
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update service",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete service
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const query = "DELETE FROM services WHERE id = ?"
    const result = await executeQuery(query, [params.id])

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
      message: "Service deleted successfully",
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete service",
      },
      { status: 500 },
    )
  }
}
