"use client"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { Textarea } from "../../../components/ui/textarea"
import { DollarSign, User, Wallet, Minus, X, AlertTriangle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

export default function WithdrawPage() {
  const [selectedAccount, setSelectedAccount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawReason, setWithdrawReason] = useState("")
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    actionText: "",
  })

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/accounts")

        if (!response.ok) {
          throw new Error("Failed to fetch accounts")
        }

        const data = await response.json()
        if (data.success && data.accounts) {
          setAccounts(data.accounts)
        }
      } catch (error) {
        console.error("Error fetching accounts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const currentAccount = accounts.find((acc) => acc.name === selectedAccount)
  const currentAccountEarnings = currentAccount?.earnings?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const currentAccountWithdrawals = currentAccount?.withdrawals?.reduce((sum, w) => sum + w.amount, 0) ?? 0;
  const currentAccountBalance = currentAccountEarnings - currentAccountWithdrawals;

  const handleWithdraw = async (e) => {
    e.preventDefault()

    if (!selectedAccount || !withdrawAmount || Number.parseFloat(withdrawAmount) <= 0 || !withdrawReason) {
      alert("Please select an account, enter a valid amount, and provide a reason")
      return
    }

    const amount = Number.parseFloat(withdrawAmount)

    if (!currentAccount) {
      alert("Please select a valid account")
      return
    }

    if (amount > currentAccountBalance) {
      alert(`Insufficient balance. Available balance: Rs. ${currentAccountBalance.toLocaleString()}`)
      return
    }

    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Withdrawal",
      message: `Are you sure you want to withdraw Rs. ${amount.toLocaleString()} from ${selectedAccount}'s account?`,
      actionText: "Withdraw",
      action: async () => {
        try {
          // Record withdrawal
          // const withdrawalResponse = await fetch("/api/accounts/withdrawals", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify({
          //     accountName: selectedAccount,
          //     amount: amount,
          //     reason: withdrawReason,
          //   }),
          // })

          // if (!withdrawalResponse.ok) {
          //   throw new Error("Failed to record withdrawal")
          // }

          // Update local state
          // setAccounts((prev) =>
          //   prev.map((acc) => (acc.name === selectedAccount ? { ...acc, balance: acc.balance - amount } : acc)),
          // )

          // Reset form
          setWithdrawAmount("")
          setWithdrawReason("")
          setConfirmDialog({ ...confirmDialog, isOpen: false })
          alert(`Successfully withdrew Rs. ${amount.toLocaleString()} from ${selectedAccount}'s account`)
        } catch (error) {
          console.error("Error processing withdrawal:", error)
          alert("Failed to process withdrawal. Please try again.")
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      },
    })
  }

  const isValidAmount = withdrawAmount && Number.parseFloat(withdrawAmount) > 0
  const hasInsufficientFunds =
    currentAccount && isValidAmount && Number.parseFloat(withdrawAmount) > currentAccountBalance

  // Show loading state
  if (loading) {
    return (
      <>
        <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
          <div className="w-full py-1.5 text-center bg-[#683223] rounded-md text-white text-sm font-medium mb-3">
            Withdraw Money
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#683223] mx-auto mb-2" />
              <p className="text-gray-400">Loading account data...</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 px-6 py-3 flex justify-center items-center">
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Form Content - Scrollable without visible scrollbar */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
        <div className="w-full py-1.5 text-center bg-[#683223] rounded-md text-white text-sm font-medium mb-3">
          Withdraw Money
        </div>
        <div className="flex-1 overflow-scroll scrollbar-hide">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleWithdraw} className="space-y-5">
              {/* Account Selection Section */}
              <Card className="bg-gray-900 border-gray-800 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-[#683223]" />
                    Select Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4 px-5 space-y-5">
                  <div>
                    <Label htmlFor="account" className="text-gray-200 text-sm font-medium mb-2 block">
                      Account *
                    </Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-10">
                        <SelectValue placeholder="Select an account to withdraw from" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {accounts.map((account) => {
                          const totalEarnings = account.earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;
                          const totalWithdrawals = account.withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;
                          const balance = totalEarnings - totalWithdrawals;

                          return (
                            <SelectItem
                              key={account.name}
                              value={account.name}
                              className="text-white hover:bg-gray-700"
                            >
                              {account.name} - Rs. {balance.toLocaleString()}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Account Balance Display */}
                  {currentAccount && (
                    <div className="p-4 bg-gray-800 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-[#683223]" />
                          <span className="text-gray-300 text-sm">Current Balance</span>
                        </div>
                        <span className="text-xl font-bold text-white">
                          Rs. {currentAccountBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Withdrawal Amount Section */}
              {selectedAccount && (
                <Card className="bg-gray-900 border-gray-800 shadow-sm">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-[#683223]" />
                      Withdrawal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-4 px-5 space-y-5">
                    <div>
                      <Label htmlFor="amount" className="text-gray-200 text-sm font-medium mb-1 block">
                        Withdrawal Amount *
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                          Rs.
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          step="1"
                          min="0"
                          max={currentAccount?.balance}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          required
                          className={`border-gray-600 bg-gray-800 h-10 text-base pl-8 text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223] ${hasInsufficientFunds ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                            }`}
                        />
                      </div>
                      {hasInsufficientFunds && (
                        <p className="text-red-400 text-xs mt-1">
                          Insufficient balance. Maximum withdrawal: Rs. {currentAccountBalance.toLocaleString()}
                        </p>
                      )}
                      {currentAccount && (
                        <p className="text-gray-400 text-xs mt-1">
                          Available balance: Rs. {currentAccountBalance.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="reason" className="text-gray-200 text-sm font-medium mb-1 block">
                        Reason for Withdrawal *
                      </Label>
                      <Textarea
                        id="reason"
                        value={withdrawReason}
                        onChange={(e) => setWithdrawReason(e.target.value)}
                        placeholder="Enter reason for withdrawal"
                        required
                        className="border-gray-600 bg-gray-800 min-h-[80px] text-base text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223] resize-none"
                      />
                    </div>

                    {/* Withdrawal Summary */}
                    {isValidAmount && !hasInsufficientFunds && (
                      <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                        <h4 className="text-white text-sm font-medium mb-2">Withdrawal Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Account:</span>
                            <span className="text-white">{selectedAccount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Withdrawal Amount:</span>
                            <span className="text-white">Rs. {Number.parseFloat(withdrawAmount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-600 pt-1">
                            <span className="text-gray-300">Remaining Balance:</span>
                            <span className="text-white font-medium">
                              Rs. {(currentAccountBalance - Number.parseFloat(withdrawAmount)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, isOpen: open })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {confirmDialog.title}
            </DialogTitle>
          </DialogHeader>

          <div className="py-3">
            <p className="text-gray-300">{confirmDialog.message}</p>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
              className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-900 hover:text-gray-200"
            >
              Cancel
            </Button>
            <Button onClick={confirmDialog.action} className="bg-[#683223] hover:bg-[#52291d] text-white">
              {confirmDialog.actionText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fixed Footer */}
      <div className="bg-gray-900 px-6 py-3 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="px-4 h-8 text-xs border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-900 hover:text-gray-200 flex items-center gap-1"
        >
          <X className="h-3 w-3" />
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleWithdraw}
          disabled={!selectedAccount || !isValidAmount || hasInsufficientFunds || !withdrawReason}
          className="px-6 h-8 text-xs font-medium bg-[#683223] hover:bg-[#52291d] text-white shadow-md flex items-center gap-1 disabled:opacity-50 disabled:bg-gray-700"
        >
          <Minus className="h-3 w-3" />
          Withdraw Money
        </Button>
      </div>
    </>
  )
}
