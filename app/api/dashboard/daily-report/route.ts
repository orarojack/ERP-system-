import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("start_date")
    const endDateParam = searchParams.get("end_date")

    let query = `
      SELECT 
        DATE(created_at) as report_date,
        SUM(total) as daily_sales,
        COUNT(id) as daily_transactions
      FROM transactions
      WHERE 1=1
    `
    const params: any[] = []

    if (startDateParam) {
      query += " AND created_at >= ?"
      params.push(startDateParam)
    }
    if (endDateParam) {
      query += " AND created_at <= ?"
      params.push(endDateParam)
    }

    query += `
      GROUP BY report_date
      ORDER BY report_date DESC
      LIMIT 30 -- Fetch data for the last 30 days by default
    `

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

    const dailyReport = (result.data as any[]).map((row) => ({
      reportDate: row.report_date,
      dailySales: Number.parseFloat(row.daily_sales || 0),
      dailyTransactions: row.daily_transactions || 0,
    }))

    return NextResponse.json<ApiResponse<typeof dailyReport>>({
      success: true,
      data: dailyReport,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch daily report",
      },
      { status: 500 },
    )
  }
}
