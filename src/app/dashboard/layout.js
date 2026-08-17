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
  IndianRupee, 
  Receipt, 
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
      <div className="min-h-screen flex flex-col bg-background pb-20 md:pb-0">
        
        {/* Top Header — flat teal, no gradient */}
        <header className="sticky top-0 z-40 bg-primary text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Stethoscope className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold leading-tight tracking-tight font-serif">PhysioClinic</h1>
                  <p className="text-[10px] text-white/60">Doctor Register & Billing</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isDemoMode && (
                <span className="hidden sm:inline-flex items-center gap-1 bg-white/10 text-white/80 border border-white/15 text-[11px] px-2.5 py-1 rounded-md font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Demo
                </span>
              )}
              
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-white/90">{user?.displayName || 'Dr. Shantanu'}</div>
                <div className="text-[10px] text-white/50">{user?.email}</div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
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
          <aside className="hidden md:flex flex-col w-60 bg-surface border-r border-border p-4 space-y-6 shrink-0">
            
            <div className="px-2">
              <p className="text-[11px] font-semibold uppercase text-foreground/40 tracking-wider">Navigation</p>
            </div>

            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-primary' : 'text-foreground/35'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border">
              <p className="text-[11px] font-semibold uppercase text-foreground/40 tracking-wider mb-2 px-2">Data</p>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground/60 hover:bg-foreground/5 rounded-md transition"
              >
                <Download className="w-4 h-4 text-primary" />
                Backup Data (JSON)
              </button>
            </div>

            {/* Doctor Card */}
            <div className="mt-auto bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs">
              <p className="font-semibold text-foreground">{user?.displayName || 'Dr. Shantanu Waidande'}</p>
              <p className="text-foreground/50 text-[11px]">BPTh, MPTh (Musculo)</p>
              <p className="text-foreground/35 text-[10px]">Reg: PT-2024/8912</p>
            </div>

          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-3 sm:p-6 overflow-x-hidden">
            {children}
          </main>

        </div>

        {/* Mobile Bottom Navigation — larger touch targets, no rounded-xl */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-2 py-1 flex justify-around items-center z-40 shadow-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1.5 rounded-md transition ${
                  isActive ? 'text-primary font-semibold' : 'text-foreground/40 hover:text-foreground/60'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-primary' : 'text-foreground/35'}`} />
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
