"use client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { DollarSign, Calendar, User, Wallet, ArrowDownLeft, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

export default function AccountsPage() {
  const [selectedAccount, setSelectedAccount] = useState("Ad-Duha")
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("earnings")

  // Fetch accounts and withdrawal history
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch accounts data
        const accountsResponse = await fetch("/api/accounts")
        if (!accountsResponse.ok) {
          throw new Error("Failed to fetch accounts")
        }

        const accountsData = await accountsResponse.json()
        if (accountsData.success && accountsData.accounts) {
          setAccounts(accountsData.accounts)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const adDuhaAccount = accounts.find((acc) => acc.name === "Ad-Duha")
  const adDuhaEarnings = adDuhaAccount?.earnings?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const adDuhaWithdrawals = adDuhaAccount?.withdrawals?.reduce((sum, w) => sum + w.amount, 0) ?? 0;
  const adDuhaBalance = adDuhaEarnings - adDuhaWithdrawals;

  const currentAccount = accounts.find((acc) => acc.name === selectedAccount)
  const currentAccountEarnings = currentAccount?.earnings?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const currentAccountWithdrawals = currentAccount?.withdrawals?.reduce((sum, w) => sum + w.amount, 0) ?? 0;
  const currentAccountBalance = currentAccountEarnings - currentAccountWithdrawals;

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Show loading state
  if (loading) {
    return (
      <>
        <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
          <div className="w-full py-1.5 text-center bg-[#683223] rounded-md text-white text-sm font-medium mb-3">
            Account Balances
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
      {/* Form Content */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
        <div className="w-full py-1.5 text-center bg-[#683223] rounded-md text-white text-sm font-medium mb-3">
          Account Balances
        </div>

        <div className="flex-1 overflow-scroll scrollbar-hide space-y-4">
          {/* Ad-Duha Balance Card - Always on Top */}
          <Card className="bg-gray-900 border-gray-800 shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#683223]" />
                Ad-Duha Studio Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 px-5">
              <div className="text-center">
                <p className="text-gray-300 text-sm mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-[#683223]">Rs. {adDuhaBalance.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Selection */}
          <Card className="bg-gray-900 border-gray-800 shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-[#683223]" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 px-5 space-y-4">
              <div>
                <label className="text-gray-200 text-sm font-medium mb-2 block">Select Account</label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {accounts.map((account) => (
                      <SelectItem key={account.name} value={account.name} className="text-white hover:bg-gray-700">
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Account Balance */}
              {currentAccount && (
                <div className="p-4 bg-gray-800 rounded-md text-center">
                  <p className="text-gray-300 text-sm">Account Balance</p>
                  <p className="text-2xl font-bold text-white">Rs. {currentAccountBalance.toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Earnings and Withdrawals */}
          {currentAccount && (
            <Card className="bg-gray-900 border-gray-800 shadow-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#683223]" />
                  {currentAccount.name} - Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="earnings" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-gray-800">
                    <TabsList className="bg-transparent w-full justify-start">
                      <TabsTrigger
                        value="earnings"
                        className="data-[state=active]:bg-[#683223] data-[state=active]:text-white text-gray-300 rounded-none border-b-2 border-transparent data-[state=active]:border-[#683223]"
                      >
                        Earnings
                      </TabsTrigger>
                      <TabsTrigger
                        value="withdrawals"
                        className="data-[state=active]:bg-[#683223] data-[state=active]:text-white text-gray-300 rounded-none border-b-2 border-transparent data-[state=active]:border-[#683223]"
                      >
                        Withdrawals
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="earnings" className="mt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left p-3 text-gray-300 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Date
                              </div>
                            </th>
                            <th className="text-left p-3 text-gray-300 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Amount
                              </div>
                            </th>
                            <th className="text-left p-3 text-gray-300 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Client Name
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAccount.earnings.length > 0 ? currentAccount.earnings.map((earning, index) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="p-3 text-gray-100 text-sm">{formatDate(earning.date)}</td>
                              <td className="p-3 text-gray-100 text-sm">Rs. {earning.amount.toLocaleString()}</td>
                              <td className="p-3 text-gray-100 text-sm">{earning.appointment.name}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={3} className="p-4 text-center text-gray-400">
                                No earning history available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="withdrawals" className="mt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left p-3 text-gray-300 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Date
                              </div>
                            </th>
                            <th className="text-left p-3 text-gray-300 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <ArrowDownLeft className="h-4 w-4" />
                                Amount
                              </div>
                            </th>
                            <th className="text-left p-3 text-gray-300 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Reason
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAccount.withdrawals.length > 0 ? (
                            currentAccount.withdrawals.map((withdrawal) => (
                              <tr key={withdrawal.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-3 text-gray-100 text-sm">{formatDate(withdrawal.date)}</td>
                                <td className="p-3 text-gray-100 text-sm">Rs. {withdrawal.amount.toLocaleString()}</td>
                                <td className="p-3 text-gray-100 text-sm">{withdrawal.reason}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-gray-400">
                                No withdrawal history available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="bg-gray-900 px-6 py-3 flex justify-between items-center">
        <div className="text-gray-400 text-xs">
          {currentAccount &&
            activeTab === "earnings" &&
            currentAccount.earnings &&
            `Showing ${currentAccount.earnings.length} earnings for ${currentAccount.name}`}
          {currentAccount &&
            activeTab === "withdrawals" &&
            `Showing ${currentAccount.withdrawals.length} withdrawals for ${currentAccount.name}`}
        </div>
        <div className="text-gray-400 text-xs">
          Total Accounts: {accounts.length} | Total System Balance: Rs.{" "}
          {accounts
            .reduce((sum, acc) => {
              const totalEarnings = acc.earnings?.reduce((eSum, e) => eSum + e.amount, 0) || 0;
              const totalWithdrawals = acc.withdrawals?.reduce((wSum, w) => wSum + w.amount, 0) || 0;
              const balance = totalEarnings - totalWithdrawals;
              return sum + balance;
            }, 0)
            .toLocaleString()}
        </div>
      </div>
    </>
  )
}
