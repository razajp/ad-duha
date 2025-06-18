"use client"

import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { User, Phone, DollarSign, CheckCircle, Clock, Edit, Save, X, AlertTriangle } from "lucide-react"
import { useState, useRef, useEffect } from "react"

// Get current month and year
const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

const fakeMonthlyClients = [
  {
    id: 1,
    name: "Ahmed Hassan",
    phone: "+92 300 1234567",
    amount: 5000,
    payments: [
      { month: "2024-01", paidDate: "2024-01-05" },
      { month: "2024-02", paidDate: "2024-02-03" },
      { month: "2024-03", paidDate: "2024-03-07" },
      { month: "2024-04", paidDate: "2024-04-02" },
      { month: "2024-05", paidDate: "2024-05-01" },
      { month: "2024-06", paidDate: "2024-06-04" },
    ],
  },
  {
    id: 2,
    name: "Fatima Khan",
    phone: "+92 301 2345678",
    amount: 3500,
    payments: [
      { month: "2024-01", paidDate: "2024-01-10" },
      { month: "2024-02", paidDate: "2024-02-08" },
      { month: "2024-03", paidDate: "2024-03-12" },
      { month: "2024-04", paidDate: "2024-04-05" },
      { month: "2024-05", paidDate: "2024-05-03" },
    ],
  },
  {
    id: 3,
    name: "Muhammad Ali",
    phone: "+92 302 3456789",
    amount: 7500,
    payments: [
      { month: "2024-01", paidDate: "2024-01-15" },
      { month: "2024-02", paidDate: "2024-02-12" },
      { month: "2024-03", paidDate: "2024-03-10" },
      { month: "2024-04", paidDate: "2024-04-08" },
      { month: "2024-05", paidDate: "2024-05-06" },
      { month: "2024-06", paidDate: "2024-06-02" },
    ],
  },
  {
    id: 4,
    name: "Aisha Malik",
    phone: "+92 303 4567890",
    amount: 4000,
    payments: [
      { month: "2024-01", paidDate: "2024-01-20" },
      { month: "2024-02", paidDate: "2024-02-18" },
      { month: "2024-03", paidDate: "2024-03-15" },
      { month: "2024-04", paidDate: "2024-04-12" },
    ],
  },
  {
    id: 5,
    name: "Omar Sheikh",
    phone: "+92 304 5678901",
    amount: 6000,
    payments: [
      { month: "2024-01", paidDate: "2024-01-25" },
      { month: "2024-02", paidDate: "2024-02-22" },
      { month: "2024-03", paidDate: "2024-03-20" },
      { month: "2024-04", paidDate: "2024-04-18" },
      { month: "2024-05", paidDate: "2024-05-15" },
      { month: "2024-06", paidDate: "2024-06-12" },
    ],
  },
  {
    id: 6,
    name: "Zainab Ahmed",
    phone: "+92 305 6789012",
    amount: 4500,
    payments: [
      { month: "2024-01", paidDate: "2024-01-30" },
      { month: "2024-02", paidDate: "2024-02-28" },
      { month: "2024-03", paidDate: "2024-03-25" },
    ],
  },
]

export default function MonthlyClientsPage() {
  const [filter, setFilter] = useState("all")
  const [clients, setClients] = useState(fakeMonthlyClients)
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, clientId: null })
  const [editModal, setEditModal] = useState({ show: false, type: null, clientId: null, value: "" })
  const contextMenuRef = useRef(null)
  const currentMonth = getCurrentMonth()

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    actionText: "",
    clientId: null,
  })

  // Check if client has paid for current month
  const hasPaidThisMonth = (client) => {
    return client.payments.some((payment) => payment.month === currentMonth)
  }

  const filteredClients = clients.filter((client) => {
    if (filter === "all") return true
    if (filter === "paid") return hasPaidThisMonth(client)
    if (filter === "unpaid") return !hasPaidThisMonth(client)
    return true
  })

  const getStatusBadge = (client) => {
    const isPaid = hasPaidThisMonth(client)
    if (isPaid) {
      return <Badge className="bg-[#683223] hover:bg-[#52291d] text-white">Paid</Badge>
    } else {
      return <Badge className="bg-gray-700 text-gray-100">Unpaid</Badge>
    }
  }

  const handleMarkAsPaid = (clientId, event) => {
    event.stopPropagation()

    const client = clients.find((c) => c.id === clientId)
    if (!client) return

    // Check if already paid this month
    const alreadyPaid = client.payments.some((payment) => payment.month === currentMonth)
    if (alreadyPaid) return

    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      title: "Mark as Paid",
      message: `Are you sure you want to mark ${client.name}'s payment of Rs. ${client.amount.toLocaleString()} as paid for ${getMonthName(currentMonth)}?`,
      actionText: "Mark as Paid",
      clientId: clientId,
      action: () => {
        setClients((prev) =>
          prev.map((client) => {
            if (client.id === clientId) {
              return {
                ...client,
                payments: [
                  ...client.payments,
                  {
                    month: currentMonth,
                    paidDate: new Date().toISOString().split("T")[0],
                  },
                ],
              }
            }
            return client
          }),
        )
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
  }

  const handleContextMenu = (event, clientId) => {
    event.preventDefault()
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      clientId: clientId,
    })
  }

  const handleEditClick = (type, clientId) => {
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setEditModal({
        show: true,
        type: type,
        clientId: clientId,
        value: type === "phone" ? client.phone : client.amount.toString(),
      })
    }
    setContextMenu({ show: false, x: 0, y: 0, clientId: null })
  }

  const handleSaveEdit = () => {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id === editModal.clientId) {
          if (editModal.type === "phone") {
            return { ...client, phone: editModal.value }
          } else if (editModal.type === "amount") {
            return { ...client, amount: Number.parseFloat(editModal.value) || 0 }
          }
        }
        return client
      }),
    )
    setEditModal({ show: false, type: null, clientId: null, value: "" })
  }

  const closeEditModal = () => {
    setEditModal({ show: false, type: null, clientId: null, value: "" })
  }

  const getMonthName = (monthString) => {
    const [year, month] = monthString.split("-")
    const date = new Date(year, month - 1)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ show: false, x: 0, y: 0, clientId: null })
      }
    }

    if (contextMenu.show) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [contextMenu.show])

  return (
    <>
      {/* Form Content */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
        <div className="w-full py-1.5 text-center bg-[#683223] rounded-md text-white text-sm font-medium mb-3">
          Monthly Clients - {getMonthName(currentMonth)}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4 px-2">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={`text-xs h-8 ${filter === "all" ? "bg-[#683223] hover:bg-[#52291d] text-white" : "border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"}`}
          >
            All Clients
          </Button>
          <Button
            onClick={() => setFilter("paid")}
            variant={filter === "paid" ? "default" : "outline"}
            className={`text-xs h-8 ${filter === "paid" ? "bg-[#683223] hover:bg-[#52291d] text-white" : "border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"}`}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid This Month
          </Button>
          <Button
            onClick={() => setFilter("unpaid")}
            variant={filter === "unpaid" ? "default" : "outline"}
            className={`text-xs h-8 ${filter === "unpaid" ? "bg-[#683223] hover:bg-[#52291d] text-white" : "border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"}`}
          >
            <Clock className="h-3 w-3 mr-1" />
            Unpaid This Month
          </Button>
        </div>

        {/* Clients Table */}
        <div className="flex-1 overflow-scroll scrollbar-hide">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-2 text-gray-300 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Name
                        </div>
                      </th>
                      <th className="text-left p-2 text-gray-300 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </div>
                      </th>
                      <th className="text-left p-2 text-gray-300 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Monthly Amount
                        </div>
                      </th>
                      <th className="text-left p-2 text-gray-300 text-sm font-medium">Status</th>
                      <th className="text-left p-2 text-gray-300 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50"
                        onContextMenu={(e) => handleContextMenu(e, client.id)}
                      >
                        <td className="p-2 text-gray-100 text-sm">{client.name}</td>
                        <td className="p-2 text-gray-100 text-sm">{client.phone}</td>
                        <td className="p-2 text-gray-100 text-sm">Rs. {client.amount.toLocaleString()}</td>
                        <td className="p-2">{getStatusBadge(client)}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => handleMarkAsPaid(client.id, e)}
                              disabled={hasPaidThisMonth(client)}
                              className="h-6 px-2 text-xs bg-[#683223] hover:bg-[#52291d] text-white disabled:opacity-50 disabled:bg-gray-700"
                            >
                              {hasPaidThisMonth(client) ? "Paid" : "Mark as Paid"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleEditClick("phone", contextMenu.clientId)}
            className="w-full px-3 py-2 text-left text-sm text-gray-100 hover:bg-gray-700 flex items-center gap-2"
          >
            <Phone className="h-3 w-3" />
            Edit Phone Number
          </button>
          <button
            onClick={() => handleEditClick("amount", contextMenu.clientId)}
            className="w-full px-3 py-2 text-left text-sm text-gray-100 hover:bg-gray-700 flex items-center gap-2"
          >
            <DollarSign className="h-3 w-3" />
            Edit Monthly Amount
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editModal.show} onOpenChange={closeEditModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#683223]" />
              Edit {editModal.type === "phone" ? "Phone Number" : "Monthly Amount"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 text-sm">
                {editModal.type === "phone" ? "Phone Number" : "Monthly Amount"}
              </Label>
              {editModal.type === "phone" ? (
                <Input
                  type="tel"
                  value={editModal.value}
                  onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editModal.value}
                    onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white pl-8"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={closeEditModal}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-900 hover:text-gray-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-[#683223] hover:bg-[#52291d] text-white"
                disabled={!editModal.value.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
      <div className="bg-gray-900 px-6 py-3 flex justify-between items-center">
        <div className="text-gray-400 text-xs">
          Showing {filteredClients.length} of {clients.length} clients
        </div>
        <div className="text-gray-400 text-xs">
          Total: {clients.length} | Paid This Month: {clients.filter((c) => hasPaidThisMonth(c)).length} | Unpaid This
          Month: {clients.filter((c) => !hasPaidThisMonth(c)).length} | Monthly Revenue: Rs.{" "}
          {clients.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
        </div>
      </div>
    </>
  )
}
