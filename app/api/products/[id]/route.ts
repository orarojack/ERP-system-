import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import type { Product, ApiResponse } from "@/lib/types"

// GET - Fetch single product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const query = "SELECT * FROM products WHERE id = ?"
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

    const products = result.data as Product[]
    if (products.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json<ApiResponse<Product>>({
      success: true,
      data: products[0],
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch product",
      },
      { status: 500 },
    )
  }
}

// PUT - Update product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, category, price, stock, description, image_url } = body

    const query = `
      UPDATE products 
      SET name = ?, category = ?, price = ?, stock = ?, description = ?, image_url = ?
      WHERE id = ?
    `

    const result = await executeQuery(query, [name, category, price, stock, description || null, image_url || null, params.id])

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
      message: "Product updated successfully",
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update product",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const query = "DELETE FROM products WHERE id = ?"
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
      message: "Product deleted successfully",
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete product",
      },
      { status: 500 },
    )
  }
}
