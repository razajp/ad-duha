"use server"

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        payments: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: appointments,
      total: appointments.length,
    })
  } catch (error) {
    console.error("GET /api/appointments error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch appointments",
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      address,
      amount,
      programDetails,
      date,
      time,
    } = body

    const newAppointment = await prisma.appointment.create({
      data: {
        name,
        phone,
        address,
        amount,
        programDetails,
        date: new Date(date),
        time,
        status: "pending",
      },
    })

    return NextResponse.json({
      success: true,
      data: newAppointment,
    })
  } catch (error) {
    console.error("POST /api/appointments error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create appointment",
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { id, status, payments } = await request.json()

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(payments && {
          payments: {
            deleteMany: {},
            create: payments.map(p => ({
              amount: p.amount,
              accountId: p.accountId,
            }))
          },
        }),
      },
      include: {
        payments: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedAppointment,
    })
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: "Failed to update appointment",
    }, { status: 500 })
  }
}
