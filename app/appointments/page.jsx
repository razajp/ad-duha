"use client"

import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import Image from "next/image"
import {
  Calendar,
  User,
  Phone,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  MapPin,
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  Receipt,
  ArrowLeft,
  ArrowRight,
  Facebook,
  MessageCircle,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function AppointmentsPage() {
  const [filter, setFilter] = useState("all")
  const [appointments, setAppointments] = useState([])
  const [accountNames, setAccountNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentAppointment, setPaymentAppointment] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [tempPayments, setTempPayments] = useState([])
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [billAppointment, setBillAppointment] = useState(null)
  const [serviceItems, setServiceItems] = useState([])
  const [newService, setNewService] = useState({ description: "", price: "" })
  const [billStep, setBillStep] = useState(1) // 1 for service entry, 2 for preview

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    actionText: "",
    appointmentId: null,
    status: null,
  })

  // Fetch appointments and account names on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch appointments and account names in parallel
        const [appointmentsResponse, accountsResponse] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/accounts"),
        ])

        if (!appointmentsResponse.ok || !accountsResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const appointmentsData = await appointmentsResponse.json()
        const accountsData = await accountsResponse.json()

        if (appointmentsData.success) {
          setAppointments(appointmentsData.data)
        }

        if (accountsData.success) {
          setAccountNames(accountsData.accounts.map((account => account.name)))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // You could add a toast notification here
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true
    if (filter === "upcoming") return appointment.status === "pending"
    return appointment.status === filter
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-gray-700 text-gray-100" },
      done: { label: "Done", className: "bg-gray-700 text-gray-100" },
      paid: { label: "Paid", className: "bg-[#683223] hover:bg-[#52291d] text-white" },
      cancelled: { label: "Cancelled", className: "bg-gray-700 text-gray-100" },
    }

    const config = statusConfig[status]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const updateAppointmentStatus = async (id, status, payments = null) => {
    try {
      const response = await fetch("/api/appointments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status, payments }),
      })

      if (!response.ok) {
        throw new Error("Failed to update appointment")
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment.id === id ? { ...appointment, status, ...(payments && { payments }) } : appointment,
          ),
        )
        return true
      }

      return false
    } catch (error) {
      console.error("Error updating appointment:", error)
      return false
    }
  }

  const handleStatusChange = (id, newStatus, event) => {
    event.stopPropagation()

    const appointment = appointments.find((a) => a.id === id)
    if (!appointment) return

    if (newStatus === "paid") {
      setPaymentAppointment(appointment)
      setTempPayments([...appointment.payments])
      setIsPaymentModalOpen(true)
      return
    }

    // Show confirmation dialog
    let title = ""
    let message = ""
    let actionText = ""

    if (newStatus === "cancelled") {
      title = "Cancel Appointment"
      message = `Are you sure you want to cancel the appointment for ${appointment.name}?`
      actionText = "Cancel Appointment"
    } else if (newStatus === "done") {
      title = "Mark as Done"
      message = `Are you sure you want to mark ${appointment.name}'s appointment as done?`
      actionText = "Mark as Done"
    }

    setConfirmDialog({
      isOpen: true,
      title,
      message,
      actionText,
      appointmentId: id,
      status: newStatus,
      action: async () => {
        const success = await updateAppointmentStatus(id, newStatus)
        if (!success) {
          alert("Failed to update appointment status. Please try again.")
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
  }

  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  const addPayment = () => {
    if (selectedPerson && paymentAmount && Number.parseFloat(paymentAmount) > 0) {
      const newAmount = Number.parseFloat(paymentAmount)
      const currentTotal = getTotalPaid()
      const totalAmount = paymentAppointment?.amount || 0

      // Check if adding this payment would exceed the total amount
      if (currentTotal + newAmount > totalAmount) {
        alert(
          `Payment amount cannot exceed the remaining balance of Rs. ${(totalAmount - currentTotal).toLocaleString()}`,
        )
        return
      }

      const newPayment = {
        person: selectedPerson,
        amount: newAmount,
      }
      setTempPayments((prev) => [...prev, newPayment])
      setSelectedPerson("")
      setPaymentAmount("")
    }
  }

  const removePayment = (index) => {
    setTempPayments((prev) => prev.filter((_, i) => i !== index))
  }

  const getTotalPaid = () => {
    return tempPayments.reduce((sum, payment) => sum + payment.amount, 0)
  }

  const getRemainingAmount = () => {
    if (!paymentAppointment) return 0
    return paymentAppointment.amount - getTotalPaid()
  }

  const markAsPaid = () => {
    if (!paymentAppointment) return

    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      title: "Mark as Paid",
      message: `Are you sure you want to mark ${paymentAppointment.name}'s appointment as paid with the specified payment distribution?`,
      actionText: "Mark as Paid",
      action: async () => {
        const finalPayments = [...tempPayments]
        const remaining = getRemainingAmount()

        if (remaining > 0) {
          finalPayments.push({ person: "Moiz", amount: remaining })
        }

        const success = await updateAppointmentStatus(paymentAppointment.id, "paid", finalPayments)

        if (success) {
          setIsPaymentModalOpen(false)
          setPaymentAppointment(null)
          setTempPayments([])
          setSelectedPerson("")
          setPaymentAmount("")
        } else {
          alert("Failed to mark appointment as paid. Please try again.")
        }

        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
  }

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false)
    setPaymentAppointment(null)
    setTempPayments([])
    setSelectedPerson("")
    setPaymentAmount("")
  }

  const handleBillClick = (appointment, event) => {
    event.stopPropagation()
    setBillAppointment(appointment)
    // Initialize with some example service items
    setBillStep(1)
    setIsBillModalOpen(true)
  }

  const addServiceItem = () => {
    if (newService.description && newService.price) {
      const price = Number.parseFloat(newService.price)
      if (!isNaN(price) && price > 0) {
        // Check if adding this service would exceed the appointment amount
        const currentTotal = calculateSubTotal()
        if (currentTotal + price > billAppointment.amount) {
          alert(
            `Service amount cannot exceed the appointment total of Rs. ${billAppointment.amount.toLocaleString()}. Current total: Rs. ${currentTotal.toLocaleString()}, Remaining: Rs. ${(billAppointment.amount - currentTotal).toLocaleString()}`,
          )
          return
        }

        setServiceItems([
          ...serviceItems,
          {
            id: serviceItems.length > 0 ? Math.max(...serviceItems.map((item) => item.id)) + 1 : 1,
            description: newService.description,
            price: price,
          },
        ])
        setNewService({ description: "", price: "" })
      }
    }
  }

  const removeServiceItem = (id) => {
    setServiceItems(serviceItems.filter((item) => item.id !== id))
  }

  const calculateSubTotal = () => {
    return serviceItems.reduce((sum, item) => sum + item.price, 0)
  }

  const calculateAdditional = () => {
    return billAppointment.amount - calculateSubTotal() // 0% tax for now
  }

  const calculateTotal = () => {
    return calculateSubTotal()
  }

  const closeBillModal = () => {
    setIsBillModalOpen(false)
    setBillAppointment(null)
    setServiceItems([])
    setBillStep(1)
    setNewService({ description: "", price: "" })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const exportToPDF = async () => {
    const element = document.getElementById("invoice-preview")
    if (!element) return

    try {
      // Create canvas from the invoice element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      // Calculate dimensions for A5 size (148 x 210 mm)
      const imgWidth = 148 // A5 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      })

      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

      // Generate filename with client name and date
      const filename = `Invoice_${billAppointment.name.replace(/\s+/g, "_")}_${formatDate(billAppointment.date).replace(/\//g, "-")}.pdf`

      pdf.save(filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  // Show loading state
  if (loading) {
    return (
      <>
        <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
          <div className="w-full py-1.5 text-center bg-[#683223] rounded-md text-white text-sm font-medium mb-3">
            All Appointments
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#683223] mx-auto mb-2" />
              <p className="text-gray-400">Loading appointments...</p>
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
          All Appointments
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4 px-2">
          <Button
            onClick={() => setFilter("upcoming")}
            variant={filter === "upcoming" ? "default" : "outline"}
            className={`text-xs h-8 ${filter === "upcoming" ? "bg-[#683223] hover:bg-[#52291d] text-white" : "border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"}`}
          >
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Button>
          <Button
            onClick={() => setFilter("done")}
            variant={filter === "done" ? "default" : "outline"}
            className={`text-xs h-8 ${filter === "done" ? "bg-[#683223] hover:bg-[#52291d] text-white" : "border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"}`}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Done
          </Button>
          <Button
            onClick={() => setFilter("paid")}
            variant={filter === "paid" ? "default" : "outline"}
            className={`text-xs h-8 ${filter === "paid" ? "bg-[#683223] hover:bg-[#52291d] text-white" : "border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"}`}
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Paid
          </Button>
          <Button
            onClick={() => setFilter("cancelled")}
            variant={filter === "cancelled" ? "default" : "outline"}
            className={`text-xs h-8 ${filter === "cancelled" ? "bg-[#683223] hover:bg-[#52291d] text-white" : "border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"}`}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Button>
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={`text-xs h-8 ${filter === "all" ? "bg-[#683223] hover:bg-[#52291d] text-white" : "border-gray-600 text-gray-300 bg-gray-800 hover:bg-[#52291d]"}`}
          >
            All Appointments
          </Button>
        </div>

        {/* Appointments Table */}
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
                          <Calendar className="h-4 w-4" />
                          Date
                        </div>
                      </th>
                      <th className="text-left p-2 text-gray-300 text-sm font-medium">Status</th>
                      <th className="text-left p-2 text-gray-300 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                        onClick={() => handleRowClick(appointment)}
                      >
                        <td className="p-2 text-gray-100 text-sm">{appointment.name}</td>
                        <td className="p-2 text-gray-100 text-sm">{appointment.phone}</td>
                        <td className="p-2 text-gray-100 text-sm">{appointment.date}</td>
                        <td className="p-2">{getStatusBadge(appointment.status)}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => handleStatusChange(appointment.id, "cancelled", e)}
                              disabled={appointment.status !== "pending"}
                              className="h-6 px-2 text-xs bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={(e) => handleStatusChange(appointment.id, "done", e)}
                              disabled={
                                appointment.status === "done" ||
                                appointment.status === "paid" ||
                                appointment.status === "cancelled"
                              }
                              className="h-6 px-2 text-xs bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                            >
                              Done
                            </Button>
                            <Button
                              onClick={(e) => handleStatusChange(appointment.id, "paid", e)}
                              disabled={appointment.status === "paid" || appointment.status === "cancelled"}
                              className="h-6 px-2 text-xs bg-[#683223] hover:bg-[#52291d] text-white disabled:opacity-50"
                            >
                              Pay
                            </Button>
                            <Button
                              onClick={(e) => handleBillClick(appointment, e)}
                              disabled={appointment.status === "cancelled"}
                              className="h-6 px-2 text-xs bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                            >
                              <Receipt className="h-3 w-3 mr-1" />
                              Bill
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

      {/* Appointment Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-[#683223]" />
              Appointment Details
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              {/* Client Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium">Client Name</label>
                  <p className="text-white text-base mt-1">{selectedAppointment.name}</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium">Phone Number</label>
                  <p className="text-white text-base mt-1">{selectedAppointment.phone}</p>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Service Location
                </label>
                <p className="text-white text-base mt-1">{selectedAppointment.address}</p>
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Program Details
                </label>
                <p className="text-white text-base mt-1">{selectedAppointment.programDetails}</p>
              </div>

              {/* Schedule and Payment */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium">Date</label>
                  <p className="text-white text-base mt-1">{selectedAppointment.date}</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium">Time</label>
                  <p className="text-white text-base mt-1">{selectedAppointment.time}</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium">Amount</label>
                  <p className="text-white text-base mt-1">Rs. {selectedAppointment.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-gray-300 text-sm font-medium">Status</label>
                <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
              </div>

              {/* Payment Details */}
              {selectedAppointment.payments.length > 0 && (
                <div>
                  <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Payment Breakdown
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedAppointment.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
                        <span className="text-gray-100">{payment.person}</span>
                        <span className="text-white font-medium">Rs. {payment.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center bg-[#683223] p-2 rounded-md font-medium">
                      <span className="text-white">Total</span>
                      <span className="text-white">
                        Rs. {selectedAppointment.payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={closePaymentModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#683223]" />
              Payment Details
            </DialogTitle>
          </DialogHeader>

          {paymentAppointment && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-300">Total Amount</p>
                <p className="text-2xl font-bold text-white">Rs. {paymentAppointment.amount.toLocaleString()}</p>
              </div>

              {/* Add Payment */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Person</Label>
                    <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {accountNames
                          .filter((guy) => guy !== "Moiz")
                          .map((guy) => (
                            <SelectItem key={guy} value={guy} className="text-white hover:bg-gray-700">
                              {guy}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Amount</Label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={`Max: ${paymentAppointment ? (paymentAppointment.amount - getTotalPaid()).toLocaleString() : "0"}`}
                      max={paymentAppointment ? paymentAppointment.amount - getTotalPaid() : 0}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={addPayment}
                  disabled={
                    !selectedPerson ||
                    !paymentAmount ||
                    Number.parseFloat(paymentAmount) <= 0 ||
                    getRemainingAmount() <= 0 ||
                    Number.parseFloat(paymentAmount) > getRemainingAmount()
                  }
                  className="w-full bg-[#683223] hover:bg-[#52291d] text-white disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment{" "}
                  {getRemainingAmount() > 0
                    ? `(Rs. ${getRemainingAmount().toLocaleString()} remaining)`
                    : "(Fully allocated)"}
                </Button>
              </div>

              {/* Payment List */}
              {tempPayments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Added Payments</Label>
                  {tempPayments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
                      <span className="text-gray-100">{payment.person}</span>
                      <div className="flex items-center gap-2 rounded-md">
                        <span className="text-white">Rs. {payment.amount.toLocaleString()}</span>
                        <Button
                          onClick={() => removePayment(index)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-transparent"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="space-y-2 pt-2 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Total Paid:</span>
                  <span className="text-white">Rs. {getTotalPaid().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Moiz's Share:</span>
                  <span className="text-white">Rs. {getRemainingAmount().toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={closePaymentModal}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-900 hover:text-gray-200"
                >
                  Cancel
                </Button>
                <Button onClick={markAsPaid} className="flex-1 bg-[#683223] hover:bg-[#52291d] text-white">
                  Mark as Paid
                </Button>
              </div>
            </div>
          )}
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

      {/* Bill Modal */}
      <Dialog open={isBillModalOpen} onOpenChange={closeBillModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#683223]" />
              {billStep === 1 ? "Service Details" : "Invoice Preview"}
            </DialogTitle>
          </DialogHeader>

          {billAppointment && (
            <>
              {billStep === 1 && (
                <div className="space-y-6">
                  {/* Service Items Entry */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Enter Service Details</h3>

                    {/* Service Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-700 rounded-lg">
                        <thead>
                          <tr className="bg-gray-800">
                            <th className="text-left p-3 text-gray-300 text-sm font-medium border-b border-gray-700">
                              S.No
                            </th>
                            <th className="text-left p-3 text-gray-300 text-sm font-medium border-b border-gray-700">
                              Description
                            </th>
                            <th className="text-left p-3 text-gray-300 text-sm font-medium border-b border-gray-700">
                              Price (Rs.)
                            </th>
                            <th className="text-left p-3 text-gray-300 text-sm font-medium border-b border-gray-700">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceItems.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-800">
                              <td className="p-3 text-gray-100 text-sm">{index + 1}</td>
                              <td className="p-3 text-gray-100 text-sm">{item.description}</td>
                              <td className="p-3 text-gray-100 text-sm">{item.price.toLocaleString()}</td>
                              <td className="p-3">
                                <Button
                                  onClick={() => removeServiceItem(item.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-transparent"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}

                          {/* Add new service item row */}
                          <tr className="border-b border-gray-800">
                            <td className="p-3 text-gray-100 text-sm">+</td>
                            <td className="p-3">
                              <Input
                                value={newService.description}
                                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                placeholder="e.g., 2xCameras"
                                className="h-8 bg-gray-800 border-gray-700 text-white"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={newService.price}
                                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                placeholder={`Max: ${billAppointment ? (billAppointment.amount - calculateSubTotal()).toLocaleString() : "0"}`}
                                type="number"
                                max={billAppointment ? billAppointment.amount - calculateSubTotal() : 0}
                                className="h-8 bg-gray-800 border-gray-700 text-white"
                              />
                            </td>
                            <td className="p-3">
                              <Button
                                onClick={addServiceItem}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-green-400 hover:text-green-300 hover:bg-transparent"
                                disabled={
                                  !newService.description ||
                                  !newService.price ||
                                  billAppointment.amount - calculateSubTotal() <= 0 ||
                                  Number.parseFloat(newService.price) > billAppointment.amount - calculateSubTotal()
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-4 text-right space-y-1">
                      <p className="text-lg font-bold text-white">
                        Services Total: Rs. {calculateTotal().toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-300">
                        Appointment Total: Rs. {billAppointment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-300">
                        Remaining: Rs. {(billAppointment.amount - calculateTotal()).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={closeBillModal}
                      className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-900 hover:text-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setBillStep(2)}
                      className="bg-[#683223] hover:bg-[#52291d] text-white"
                      disabled={serviceItems.length === 0}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Preview Invoice
                    </Button>
                  </div>
                </div>
              )}

              {billStep === 2 && (
                <div className="space-y-6">
                  {/* A5 Invoice Preview */}
                  <div className="preview-container h-[70vh] rounded-lg overflow-y-auto scrollbar-hide">
                    <div
                      id="invoice-preview"
                      className="bg-white text-black p-8 rounded-lg shadow-lg mx-auto flex flex-col"
                      style={{ aspectRatio: "148/210" }}
                    >
                      {/* Header with decorative elements */}
                      <div className="relative mb-6">
                        {/* Decorative top border */}
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#683223] to-[#8B4513] rounded-t-lg"></div>

                        <div className="pt-6 flex justify-between items-start">
                          {/* Logo and Company Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#683223] rounded-lg flex items-center justify-center">
                              <Image
                                src="/ad-duha-logo.jpg"
                                alt="Ad-Duha Logo"
                                width={40}
                                height={40}
                                className="rounded-md"
                              />
                            </div>
                            <div>
                              <h1 className="text-xl font-bold text-[#683223]">Ad-Duha Studio</h1>
                              <p className="text-sm text-gray-600">Islamic Learning Services</p>
                            </div>
                          </div>

                          {/* Invoice Title */}
                          <div className="text-right">
                            <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
                          </div>
                        </div>
                      </div>

                      {/* Client and Invoice Info */}
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Invoice to:</h3>
                          <div className="text-sm">
                            <p className="font-semibold text-gray-800">{billAppointment.name}</p>
                            <p className="text-gray-600">{billAppointment.address}</p>
                            <p className="text-gray-600">{billAppointment.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-700">Program Date</span>
                              <span className="text-gray-800">{formatDate(billAppointment.date)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-700">Bill Date</span>
                              <span className="text-gray-800">{formatDate(billAppointment.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Service Items Table */}
                      <div className="mb-6 grow">
                        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-[#683223] text-white">
                              <th className="text-left p-3 text-sm font-semibold">No</th>
                              <th className="text-left p-3 text-sm font-semibold">Item Description</th>
                              <th className="text-right p-3 text-sm font-semibold">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviceItems.map((item, index) => (
                              <tr key={item.id} className="border-b border-gray-200">
                                <td className="p-3 text-sm text-gray-800">{index + 1}</td>
                                <td className="p-3 text-sm text-gray-800">{item.description}</td>
                                <td className="p-3 text-sm text-gray-800 text-right">
                                  Rs. {item.price.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals Section */}
                      <div className="mb-6">
                        <div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-700">Sub Total</span>
                                <span className="text-gray-800">Rs. {calculateSubTotal().toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-700">Additional</span>
                                <span className="text-gray-800">Rs. {calculateAdditional().toLocaleString()}</span>
                              </div>
                              <div className="border-t border-gray-300 pt-2">
                                <div className="flex justify-between font-bold">
                                  <span className="text-[#683223]">TOTAL</span>
                                  <span className="text-[#683223]">Rs. {billAppointment.amount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="relative">
                        {/* Decorative bottom border */}
                        <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-[#683223] to-[#8B4513] rounded-b-lg"></div>

                        <div className="pb-6 grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>+92 318 0751154</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>New Karachi, Karachi</span>
                            </div>
                          </div>
                          <div className="space-y-1 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span>Ad-Duha Islamic Studio</span>
                              <Facebook className="h-3 w-3" />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <span>+92 304 5491117</span>
                              <MessageCircle className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <Button
                      onClick={() => setBillStep(1)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-900 hover:text-gray-200"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Edit
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={closeBillModal}
                        className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-900 hover:text-gray-200"
                      >
                        Close
                      </Button>
                      <Button onClick={exportToPDF} className="bg-[#683223] hover:bg-[#52291d] text-white">
                        <Receipt className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Fixed Footer */}
      <div className="bg-gray-900 px-6 py-3 flex justify-between items-center">
        <div className="text-gray-400 text-xs">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
        <div className="text-gray-400 text-xs">
          Total: {appointments.length} | Pending: {appointments.filter((a) => a.status === "pending").length} | Done:{" "}
          {appointments.filter((a) => a.status === "done").length} | Paid:{" "}
          {appointments.filter((a) => a.status === "paid").length} | Cancelled:{" "}
          {appointments.filter((a) => a.status === "cancelled").length}
        </div>
      </div>
    </>
  )
}
