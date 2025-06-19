"use server"

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// post function to create a new payment for a monthly client
export async function POST(request, { params }) {
    try {
        const { clientId } = await params

        const client = await prisma.monthlyClient.findUnique({
            where: { id: parseInt(clientId, 10) },
        })

        const account = await prisma.account.findUnique({
            where: { name: "Ad-Duha" },
        })

        const newPayment = await prisma.payment.create({
            data: {
                amount: client.amount,
                monthlyClientId: parseInt(clientId, 10),
                accountId: account.id,
            },
        })

        return NextResponse.json({
            success: true,
            // data: newPayment,
        })
    } catch (error) {
        console.error("POST /api/monthly-clients/[clientId]/payments error:", error)
        return NextResponse.json({
            success: false,
            error: "Failed to create payment",
        }, { status: 500 })
    }
}