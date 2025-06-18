"use client"

import { useToast } from "../../../components/providers/ToastProvider"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { User, Plus, X } from "lucide-react"

export default function NewAccountPage() {
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const accountData = {
      name: formData.get("accountName"),
      phone: formData.get("phoneNumber"),
    }

    // call to API to create a new account
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      const result = await res.json()
      if (result.success) {
        showToast("Account registered successfully!", "success")
        e.target.reset()
      } else {
        showToast(result.error || "Failed to register account", "error")
      }
    } catch (err) {
      console.log(err);
      
      showToast("Server error. Please try again.", "error")
    }
  }

  return (
    <>
      {/* Form Content - Scrollable without visible scrollbar */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
        <div className="w-full py-1.5 text-center bg-[#683223] rounded-md text-white text-sm font-medium mb-3">
          Create New Account
        </div>
        <div className="flex-1 overflow-scroll scrollbar-hide">
          <div className="max-w-2xl mx-auto">
            <form className="space-y-5" id="account-form" onSubmit={handleSubmit}>
              {/* Account Information Section */}
              <Card className="bg-gray-900 border-gray-800 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-[#683223]" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4 px-5 space-y-5">
                  <div>
                    <Label htmlFor="accountName" className="text-gray-200 text-sm font-medium mb-1 block">
                      Full Name *
                    </Label>
                    <Input
                      id="accountName"
                      name="accountName"
                      placeholder="Enter account holder's full name"
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
          form="account-form"
          className="px-6 h-8 text-xs font-medium bg-[#683223] hover:bg-[#52291d] text-white shadow-md flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Create Account
        </Button>
      </div>
    </>
  )
}
