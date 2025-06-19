"use server"

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        earnings: {
          include: {
            Appointment: true,
            MonthlyClient: true,
          },
        },
        withdrawals: true,
      },
    })

    return NextResponse.json({
      success: true,
      accounts: accounts,
      total: accounts.length,
    })
  } catch (error) {
    console.error("GET /api/accounts error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch accounts",
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, phone } = await request.json()

    const newAccount = await prisma.account.create({
      data: {
        name,
        phone,
      }
    });

    return NextResponse.json({
      success: true,
      data: newAccount,
    })
  } catch (error) {
    console.error("POST /api/accounts error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create account",
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { name, amount } = await request.json()

    // Find the account
    const accountIndex = accounts.findIndex((acc) => acc.name === name)

    if (accountIndex === -1) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 })
    }

    // Update the account balance
    accounts[accountIndex].balance -= Number(amount)

    return NextResponse.json({
      success: true,
      data: accounts[accountIndex],
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update account balance" }, { status: 500 })
  }
}