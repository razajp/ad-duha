"use server"

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// const accounts = [
//   {
//     name: "Ad-Duha",
//     phone: "0315-1111111",
//     earnings: [
//       {
//         id: 2,
//         date: "2005-08-06",
//         amount: 3000,
//         appointment: {
//           name: "Hassan"
//         }
//       }
//     ],
//     withdrawals: [
//       {
//         id: 5,
//         date: "2005-05-05",
//         amount: 500,
//         reason: "IDK"
//       }
//     ]
//   },
//   {
//     name: "Faizan",
//     phone: "0315-1111112",
//     earnings: [
//       {
//         id: 3,
//         date: "2006-01-15",
//         amount: 2000,
//         appointment: {
//           name: "Ali"
//         }
//       },
//       {
//         id: 4,
//         date: "2006-03-22",
//         amount: 1500,
//         appointment: {
//           name: "Adeel"
//         }
//       }
//     ],
//     withdrawals: [
//       {
//         id: 6,
//         date: "2006-04-01",
//         amount: 1000,
//         reason: "IDK"
//       }
//     ]
//   },
//   {
//     name: "Zuhaib",
//     phone: "0315-1111113",
//     earnings: [
//       {
//         id: 5,
//         date: "2007-07-19",
//         amount: 3500,
//         appointment: {
//           name: "Zaid"
//         }
//       }
//     ],
//     withdrawals: [
//       {
//         id: 7,
//         date: "2007-08-01",
//         amount: 1500,
//         reason: "IDK"
//       }
//     ]
//   },
//   {
//     name: "Moiz",
//     phone: "0315-1111114",
//     earnings: [
//       {
//         id: 6,
//         date: "2008-05-10",
//         amount: 4000,
//         appointment: {
//           name: "Usman"
//         }
//       },
//       {
//         id: 7,
//         date: "2008-05-15",
//         amount: 3000,
//         appointment: {
//           name: "Hamza"
//         }
//       }
//     ],
//     withdrawals: [
//       {
//         id: 8,
//         date: "2008-06-01",
//         amount: 2000,
//         reason: "IDK"
//       }
//     ]
//   },
//   {
//     name: "Hasnain",
//     phone: "0315-1111115",
//     earnings: [
//       {
//         id: 8,
//         date: "2009-09-09",
//         amount: 2500,
//         appointment: {
//           name: "Sami"
//         }
//       }
//     ],
//     withdrawals: [
//       {
//         id: 9,
//         date: "2009-10-01",
//         amount: 1000,
//         reason: "IDK"
//       }
//     ]
//   }
// ]

const prisma = new PrismaClient()

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        earnings: true,
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