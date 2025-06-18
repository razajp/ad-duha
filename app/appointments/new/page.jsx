"use client"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Calendar, User, MapPin, Plus, X } from "lucide-react"
import { useToast } from "../../../components/providers/ToastProvider"

export default function NewAppointmentPage() {
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault()

    const form = e.target
    const data = {
      name: form.clientName.value,
      phone: form.phoneNo.value,
      address: form.address.value,
      amount: parseFloat(form.amount.value),
      programDetails: form.programDetails.value,
      date: form.appointmentDate.value,
      time: form.appointmentTime.value,
    }

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (result.success) {
        showToast("Appointment registered successfully!", "success")
        e.target.reset()
      } else {
        showToast(result.error || "Failed to register appointment", "error")
      }
    } catch (err) {
      showToast("Server error. Please try again.", "error")
    }
  }

  return (
    <>
      <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
        <div className="w-full py-1.5 text-center bg-[#683223] rounded-md text-white text-sm font-medium mb-3">
          New Appointment Registration
        </div>
        <div className="flex-1 overflow-scroll scrollbar-hide">
          <div className="max-w-3xl mx-auto">
            <form id="appointment-form" className="space-y-5" onSubmit={handleSubmit}>
              {/* Client Information Section */}
              <Card className="bg-gray-900 border-gray-800 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-[#683223]" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4 px-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName" className="text-gray-200 text-sm font-medium mb-1 block">
                        Full Name *
                      </Label>
                      <Input
                        id="clientName"
                        placeholder="Enter client's full name"
                        required
                        className="border-gray-600 bg-gray-800 h-10 text-base text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNo" className="text-gray-200 text-sm font-medium mb-1 block">
                        Phone Number *
                      </Label>
                      <Input
                        id="phoneNo"
                        type="tel"
                        placeholder="Enter phone number"
                        required
                        className="border-gray-600 bg-gray-800 h-10 text-base text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Details Section */}
              <Card className="bg-gray-900 border-gray-800 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#683223]" />
                    Service Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4 px-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address" className="text-gray-200 text-sm font-medium mb-1 block">
                        Service Location Address *
                      </Label>
                      <Input
                        id="address"
                        placeholder="Enter the complete address"
                        required
                        className="border-gray-600 bg-gray-800 h-10 text-base text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount" className="text-gray-200 text-sm font-medium mb-1 block">
                        Payment Amount *
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                          Rs.
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          required
                          className="border-gray-600 bg-gray-800 h-10 text-base pl-8 text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223]"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="programDetails" className="text-gray-200 text-sm font-medium mb-1 block">
                      Program Details *
                    </Label>
                    <Textarea
                      id="programDetails"
                      placeholder="Enter detailed information about the program or service being provided"
                      required
                      className="border-gray-600 bg-gray-800 min-h-[100px] text-base text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Schedule Section */}
              <Card className="bg-gray-900 border-gray-800 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#683223]" />
                    Appointment Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4 px-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appointmentDate" className="text-gray-200 text-sm font-medium mb-1 block">
                        Date *
                      </Label>
                      <Input
                        id="appointmentDate"
                        type="date"
                        required
                        className="border-gray-600 bg-gray-800 h-10 text-base text-gray-100 focus:border-[#683223] focus:ring-[#683223]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="appointmentTime" className="text-gray-200 text-sm font-medium mb-1 block">
                        Time *
                      </Label>
                      <Input
                        id="appointmentTime"
                        type="text"
                        placeholder="e.g., 2:00 PM, After Maghrib"
                        required
                        className="border-gray-600 bg-gray-800 h-10 text-base text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>

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
          form="appointment-form"
          className="px-6 h-8 text-xs font-medium bg-[#683223] hover:bg-[#52291d] text-white shadow-md flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Register Appointment
        </Button>
      </div>
    </>
  )
}
