"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import QuickFAB from '@/components/QuickFAB';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  IndianRupee, 
  Receipt, 
  PlusCircle, 
  LogOut, 
  Download, 
  Stethoscope,
  ShieldCheck
} from 'lucide-react';
import { getLocalDB } from '@/lib/db';

export default function DashboardLayout({ children }) {
  const { user, logout, isDemoMode } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/dashboard/patients', icon: Users },
    { name: 'Income', href: '/dashboard/income', icon: IndianRupee },
    { name: 'Receipts', href: '/dashboard/receipts', icon: Receipt },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleExportJSON = () => {
    const db = getLocalDB();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `physioclinic_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-slate-100/70 pb-20 md:pb-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold shadow">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold leading-tight tracking-tight">PhysioClinic</h1>
                  <p className="text-[10px] text-blue-100 opacity-90">Doctor Register & Billing</p>
                </div>
              </Link>
            </div>

            {/* Doctor Info & Actions Header Right */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isDemoMode && (
                <span className="hidden sm:inline-flex items-center gap-1 bg-amber-400/20 text-amber-100 border border-amber-300/30 text-xs px-2.5 py-1 rounded-full font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Demo Mode
                </span>
              )}
              
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold">{user?.displayName || 'Dr. Shantanu'}</div>
                <div className="text-[10px] text-blue-100">{user?.email}</div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/10 hover:bg-rose-500/80 text-white text-xs font-medium transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Body with Sidebar + Content */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 p-4 space-y-6 shrink-0">
            
            <div className="px-2">
              <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Doctor Controls</p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-200/60'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2 px-2">Data Management</p>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Backup Data (JSON)
              </button>
            </div>

            {/* Doctor Card */}
            <div className="mt-auto bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs">
              <p className="font-bold text-slate-800">{user?.displayName || 'Dr. Shantanu Waidande'}</p>
              <p className="text-slate-500 text-[11px]">BPTh, MPTh (Musculo)</p>
              <p className="text-slate-400 text-[10px]">Reg: PT-2024/8912</p>
            </div>

          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-3 sm:p-6 overflow-x-hidden">
            {children}
          </main>

        </div>

        {/* Mobile Bottom Navigation Bar (Mobile First Requirement) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center z-40 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Global Floating Action Button */}
        <QuickFAB />

      </div>
    </ProtectedRoute>
  );
}
