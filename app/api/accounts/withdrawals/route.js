import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { accountName, amount, reason } = await request.json()

    const account = await prisma.account.findUnique({
      where: { name: accountName },
    })

    const newWithdrawal = await prisma.withdraw.create({
      data: {
        amount,
        reason,
        accountId: account.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: newWithdrawal,
    })
  } catch (error) {
    console.error("Bhand Hai:", error)
    return NextResponse.json({ success: false, error: "Failed to process withdrawal" }, { status: 500 })
  }
}
