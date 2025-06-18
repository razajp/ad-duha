"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { Toast } from "../ui/toast.jsx"

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type })
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </ToastContext.Provider>
  )
}
