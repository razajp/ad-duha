"use client"

import { useToast } from "../../../components/providers/ToastProvider"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { User, Plus, X } from "lucide-react"

export default function NewMonthlyClientPage() {
  const { showToast } = useToast();

  const handleRegisterMonthlyClient = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const monthlyClientData = {
      name: formData.get("clientName"),
      phone: formData.get("phoneNumber"),
      amount: parseFloat(formData.get("monthlyAmount")),
    }
    
    // Call to API to register a new monthly client
    try {
      const response = await fetch("/api/monthly-clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(monthlyClientData),
      })

      const result = await response.json()
      if (result.success) {
        showToast("Monthly client registered successfully!", "success")
        event.target.reset() // Reset the form
      } else {
        showToast(result.error || "Failed to register monthly client", "error")
      }
    } catch (error) {
      showToast("Server error. Please try again.", "error")
    }
  }

  return (
    <>
      {/* Form Content - Scrollable without visible scrollbar */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
        <div className="w-full py-1.5 text-center bg-[#683223] rounded-md text-white text-sm font-medium mb-3">
          New Monthly Client
        </div>
        <div className="flex-1 overflow-scroll scrollbar-hide">
          <div className="max-w-2xl mx-auto">
            <form className="space-y-5" id="monthly-client-form" onSubmit={handleRegisterMonthlyClient}>
              {/* Client Information Section */}
              <Card className="bg-gray-900 border-gray-800 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-[#683223]" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4 px-5 space-y-5">
                  <div>
                    <Label htmlFor="clientName" className="text-gray-200 text-sm font-medium mb-1 block">
                      Full Name *
                    </Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      placeholder="Enter client's full name"
                      required
                      className="border-gray-600 bg-gray-800 h-10 text-base text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-gray-200 text-sm font-medium mb-1 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="Enter phone number"
                      required
                      className="border-gray-600 bg-gray-800 h-10 text-base text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyAmount" className="text-gray-200 text-sm font-medium mb-1 block">
                      Monthly Payment Amount *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                        Rs.
                      </span>
                      <Input
                        id="monthlyAmount"
                        name="monthlyAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                        className="border-gray-600 bg-gray-800 h-10 text-base pl-8 text-gray-100 placeholder:text-gray-500 focus:border-[#683223] focus:ring-[#683223]"
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      This amount will be collected every month from this client
                    </p>
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
          form="monthly-client-form"
          className="px-6 h-8 text-xs font-medium bg-[#683223] hover:bg-[#52291d] text-white shadow-md flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Register Monthly Client
        </Button>
      </div>
    </>
  )
}
