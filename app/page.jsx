"use client"

import Image from "next/image"

export default function HomePage() {
  return (
    <>
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 mr-3 mt-3">
        <div className="flex-1 flex items-center justify-center select-none">
          <div className="text-center">
            <div className="mb-6">
              <Image
                src="/ad-duha-logo.jpg"
                alt="Ad-Duha Studio Logo"
                width={120}
                height={120}
                className="rounded-lg mx-auto shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Ad-Duha Studio</h1>
            <p className="text-gray-400 text-lg">Islamic Learning Management System</p>
            <div className="mt-8 text-gray-500 text-sm">
              <p>Welcome to the management dashboard</p>
              <p>Use the sidebar to navigate through different sections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="bg-gray-900 px-6 py-3 flex justify-center items-center">
        <div className="text-gray-400 text-xs">© 2024 Ad-Duha Studio. All rights reserved.</div>
      </div>
    </>
  )
}
