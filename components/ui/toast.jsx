"use client"

import { useEffect, useState } from "react"

export function Toast({ message, type = "success", show, onClose }) {
  if (!show) return null

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-md text-sm border-2 border-zinc-800
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {message}
    </div>
  )
}
