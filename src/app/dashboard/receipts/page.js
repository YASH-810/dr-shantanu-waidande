"use client";

import React, { useState, useEffect } from 'react';
import { getLocalDB, saveLocalDB } from '@/lib/db';
import Link from 'next/link';
import { 
  Receipt, 
  Search, 
  Plus, 
  Download, 
  Printer, 
  Trash2, 
  CheckCircle2,
  Calendar,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ReceiptsDirectoryPage() {
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const db = getLocalDB();
    setReceipts(db.receipts || []);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteReceipt = (id) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;
    const db = getLocalDB();
    const updated = (db.receipts || []).filter(r => r.id !== id);
    setReceipts(updated);
    saveLocalDB({ ...db, receipts: updated });
    triggerToast('Receipt deleted');
  };

  const filteredReceipts = receipts.filter(r => {
    const q = search.toLowerCase();
    return !q || 
      r.billNo?.toLowerCase().includes(q) || 
      r.patientName?.toLowerCase().includes(q) || 
      r.therapistName?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredReceipts.length / pageSize) || 1;
  const paginatedReceipts = filteredReceipts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-emerald-400 border border-slate-700 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header & Main Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-600" /> Clinic Receipts History
          </h1>
          <p className="text-xs text-slate-500">View, manage and reprint generated patient receipts</p>
        </div>

        <Link
          href="/dashboard/receipts/create"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create Receipt
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search bill no, patient name or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>
        <div className="text-[11px] text-slate-400 font-medium pt-1">
          Showing <span className="font-bold text-slate-700">{filteredReceipts.length}</span> of <span className="font-bold text-slate-700">{receipts.length}</span> saved receipts
        </div>
      </div>

      {/* Receipts Table (Desktop) & Cards (Mobile Attached Design) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No saved receipts found. Click "Create Receipt" to generate a new A5 receipt.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Bill No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Physiotherapist</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{r.billNo}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{r.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.patientName}</td>
                      <td className="py-3 px-4 text-slate-600">{r.therapistName}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">₹{r.amount}</td>
                      <td className="py-3 px-4 text-slate-600">{r.paymentMode}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Link
                          href="/dashboard/receipts/create"
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> Print
                        </Link>
                        <button
                          onClick={() => handleDeleteReceipt(r.id)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-semibold"
                          title="Delete Receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Exact Reference Image Design Layout) */}
            <div className="md:hidden divide-y divide-slate-100 bg-slate-50/50 p-2 space-y-3">
              {paginatedReceipts.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                  
                  {/* Top Subtitle Row: Date & Doctor */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pb-1 border-b border-slate-100">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {r.date}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      {r.therapistName || 'Dr. Shantanu'}
                    </span>
                  </div>

                  {/* Main Title Row: Bill Ref + Patient Name + Amount Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mb-0.5">
                        {r.billNo}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {r.patientName}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-200/60 block">
                        ₹{r.amount}
                      </span>
                    </div>
                  </div>

                  {/* Key-Value Details Grid */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Payment Mode</span>
                      <span className="text-slate-800 font-semibold flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {r.paymentMode || 'Online'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Physiotherapist</span>
                      <span className="text-slate-700 font-semibold">{r.therapistName || 'Dr. Shantanu Waidande'}</span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href="/dashboard/receipts/create"
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" /> Print A5 Receipt
                    </Link>
                    <button
                      onClick={() => handleDeleteReceipt(r.id)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Pagination Controls Bar */}
            {filteredReceipts.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs bg-slate-50/80">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <span>Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="ml-1 text-[11px]">
                    Showing <strong className="text-slate-800">{Math.min((currentPage - 1) * pageSize + 1, filteredReceipts.length)}</strong>–<strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredReceipts.length)}</strong> of <strong className="text-slate-800">{filteredReceipts.length}</strong> receipts
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center gap-1 text-[11px]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>

                  <span className="px-3 py-1.5 font-bold text-slate-800 bg-white border border-slate-200 rounded-xl text-[11px]">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center gap-1 text-[11px]"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
