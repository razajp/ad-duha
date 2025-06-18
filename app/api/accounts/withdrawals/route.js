import { NextResponse } from "next/server"

// Sample withdrawal history data
const withdrawalHistory = [
  {
    id: 1,
    accountName: "Faizan",
    amount: 2000,
    date: "2024-06-10",
    reason: "Personal expenses",
    approvedBy: "Moiz",
  },
  {
    id: 2,
    accountName: "Zuhaib",
    amount: 1500,
    date: "2024-06-08",
    reason: "Equipment purchase",
    approvedBy: "Moiz",
  },
  {
    id: 3,
    accountName: "Hasnain",
    amount: 3000,
    date: "2024-06-05",
    reason: "Travel expenses",
    approvedBy: "Moiz",
  },
  {
    id: 4,
    accountName: "Faizan",
    amount: 1000,
    date: "2024-06-01",
    reason: "Office supplies",
    approvedBy: "Moiz",
  },
  {
    id: 5,
    accountName: "Moiz",
    amount: 5000,
    date: "2024-05-28",
    reason: "Studio equipment",
    approvedBy: "Faizan",
  },
  {
    id: 6,
    accountName: "Zuhaib",
    amount: 2500,
    date: "2024-05-25",
    reason: "Marketing materials",
    approvedBy: "Moiz",
  },
  {
    id: 7,
    accountName: "Hasnain",
    amount: 1800,
    date: "2024-05-20",
    reason: "Software subscription",
    approvedBy: "Moiz",
  },
  {
    id: 8,
    accountName: "Moiz",
    amount: 3500,
    date: "2024-05-15",
    reason: "Event expenses",
    approvedBy: "Faizan",
  },
  {
    id: 9,
    accountName: "Faizan",
    amount: 1200,
    date: "2024-05-10",
    reason: "Transportation",
    approvedBy: "Moiz",
  },
  {
    id: 10,
    accountName: "Zuhaib",
    amount: 2200,
    date: "2024-05-05",
    reason: "Client meeting expenses",
    approvedBy: "Moiz",
  },
]

export async function GET(request) {
  try {
    // Get the account name from query parameters if provided
    const { searchParams } = new URL(request.url)
    const accountName = searchParams.get("account")

    // Filter withdrawals by account name if provided
    let filteredWithdrawals = withdrawalHistory
    if (accountName) {
      filteredWithdrawals = withdrawalHistory.filter(
        (withdrawal) => withdrawal.accountName.toLowerCase() === accountName.toLowerCase(),
      )
    }

    // Simulate a small delay to mimic real API behavior
    await new Promise((resolve) => setTimeout(resolve, 100))

    return NextResponse.json({
      success: true,
      data: filteredWithdrawals,
      total: filteredWithdrawals.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch withdrawal history" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { accountName, amount, reason } = await request.json()

    if (!accountName || !amount || amount <= 0 || !reason) {
      return NextResponse.json({ success: false, error: "Invalid withdrawal data" }, { status: 400 })
    }

    // Create a new withdrawal record
    const newWithdrawal = {
      id: withdrawalHistory.length + 1,
      accountName,
      amount: Number(amount),
      date: new Date().toISOString().split("T")[0],
      reason,
      approvedBy: "Moiz", // Default approver
    }

    // Add to withdrawal history (in a real app, this would be saved to a database)
    withdrawalHistory.push(newWithdrawal)

    return NextResponse.json({
      success: true,
      data: newWithdrawal,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process withdrawal" }, { status: 500 })
  }
}
