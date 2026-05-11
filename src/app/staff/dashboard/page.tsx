"use client"

import { useContext } from "react"
import { UserContext } from "@/components/context/user-context"
import LogoutButton from "@/components/logoutstaff"
import { User, ShieldCheck } from "lucide-react"

export default function StaffDashboard() {
  const { user } = useContext(UserContext)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-3xl p-8 border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Staff Dashboard
            </h1>
            <p className="text-slate-500 mt-2">
              Manage your workspace efficiently
            </p>
          </div>

          <div className="bg-blue-100 p-4 rounded-2xl">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {/* User Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full">
              <User className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm opacity-80">Welcome back</p>
              <h2 className="text-2xl font-semibold">
                {user?.name || "Staff Member"}
              </h2>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          <div className="bg-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-slate-500 text-sm">Role</h3>
            <p className="text-2xl font-bold text-slate-800 mt-2">Staff</p>
          </div>

          <div className="bg-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-slate-500 text-sm">Status</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">Active</p>
          </div>

          <div className="bg-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-slate-500 text-sm">Access</h3>
            <p className="text-2xl font-bold text-slate-800 mt-2">Granted</p>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-10 flex justify-end">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}