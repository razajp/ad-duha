"use server"

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const monthlyClients = await prisma.monthlyClient.findMany({
      include: {
        payments: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: monthlyClients,
      total: monthlyClients.length,
    })
  } catch (error) {
    console.error("GET /api/monthlyClients error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch monthlyClients",
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, phone, amount } = await request.json()

    if (!name || !phone || !amount) {
      return NextResponse.json({
        success: false,
        error: "All fields are required",
      }, { status: 400 })
    }

    const newMonthlyClient = await prisma.monthlyClient.create({
      data: {
        name,
        phone,
        amount,
      },
    })

    return NextResponse.json({
      success: true,
      data: newMonthlyClient,
    })
  } catch (error) {
    console.error("POST /api/monthlyClients error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create monthly client",
    }, { status: 500 })
  }
}