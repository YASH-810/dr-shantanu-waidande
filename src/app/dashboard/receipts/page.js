"use client";

import React, { useState, useEffect } from 'react';
import { getLocalDB, saveLocalDB } from '@/lib/db';
import Link from 'next/link';
import { 
  Receipt, 
  Search, 
  Plus, 
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
    <div className="space-y-5">
      
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-foreground text-primary-light border border-foreground/80 rounded-lg shadow-md text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header & Main Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2 font-serif">
            <Receipt className="w-5 h-5 text-primary" /> Clinic Receipts History
          </h1>
          <p className="text-xs text-foreground/50">View, manage and reprint generated patient receipts</p>
        </div>

        <Link
          href="/dashboard/receipts/create"
          className="px-4 py-2 bg-primary hover:opacity-90 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Create Receipt
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface p-4 rounded-lg border border-border space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-foreground/30 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search bill no, patient name or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-primary font-medium"
          />
        </div>
        <div className="text-[11px] text-foreground/35 font-medium pt-1">
          Showing <span className="font-semibold text-foreground">{filteredReceipts.length}</span> of <span className="font-semibold text-foreground">{receipts.length}</span> saved receipts
        </div>
      </div>

      {/* Receipts Table (Desktop) & Cards (Mobile) */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="p-12 text-center text-foreground/30 text-xs">
            No saved receipts found. Click "Create Receipt" to generate a new A5 receipt.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-background border-b border-border text-foreground/40 font-medium uppercase tracking-wider">
                    <th className="py-3 px-4">Bill No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Physiotherapist</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {paginatedReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-background/50 transition">
                      <td className="py-3 px-4 font-mono font-medium text-primary">{r.billNo}</td>
                      <td className="py-3 px-4 font-mono text-foreground/70">{r.date}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{r.patientName}</td>
                      <td className="py-3 px-4 text-foreground/60">{r.therapistName}</td>
                      <td className="py-3 px-4 font-semibold text-primary">₹{r.amount}</td>
                      <td className="py-3 px-4 text-foreground/60">{r.paymentMode}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Link
                          href="/dashboard/receipts/create"
                          className="px-2 py-1 bg-foreground/5 hover:bg-foreground/10 text-foreground/70 rounded text-[11px] font-medium inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> Print
                        </Link>
                        <button
                          onClick={() => handleDeleteReceipt(r.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-medium"
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

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-border bg-background p-2 space-y-2">
              {paginatedReceipts.map((r) => (
                <div key={r.id} className="bg-surface rounded-lg border border-border p-4 space-y-3">
                  
                  {/* Top Subtitle Row */}
                  <div className="flex items-center justify-between text-[11px] text-foreground/35 font-medium pb-1 border-b border-border">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-foreground/30" />
                      {r.date}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <User className="w-3 h-3 text-foreground/30 shrink-0" />
                      {r.therapistName || 'Dr. Shantanu'}
                    </span>
                  </div>

                  {/* Main Title Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-sm inline-block mb-0.5">
                        {r.billNo}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground leading-snug">
                        {r.patientName}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold text-primary bg-primary/10 border border-primary/15 block">
                        ₹{r.amount}
                      </span>
                    </div>
                  </div>

                  {/* Key-Value Details */}
                  <div className="bg-background rounded-md p-3 border border-border text-xs space-y-1.5 font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/35">Payment Mode</span>
                      <span className="text-foreground font-medium flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-foreground/35" />
                        {r.paymentMode || 'Online'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/35">Physiotherapist</span>
                      <span className="text-foreground/70">{r.therapistName || 'Dr. Shantanu Waidande'}</span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href="/dashboard/receipts/create"
                      className="flex-1 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/70 text-xs font-medium rounded-md text-center transition flex items-center justify-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print A5 Receipt
                    </Link>
                    <button
                      onClick={() => handleDeleteReceipt(r.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-md transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Pagination Controls Bar */}
            {filteredReceipts.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border text-xs bg-background">
                <div className="flex items-center gap-2 text-foreground/40 font-medium">
                  <span>Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-surface border border-border rounded-md text-foreground font-medium focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-[11px]">
                    Showing <strong className="text-foreground">{Math.min((currentPage - 1) * pageSize + 1, filteredReceipts.length)}</strong>–<strong className="text-foreground">{Math.min(currentPage * pageSize, filteredReceipts.length)}</strong> of <strong className="text-foreground">{filteredReceipts.length}</strong> receipts
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-2.5 py-1.5 bg-surface border border-border rounded-md text-foreground/70 font-medium disabled:opacity-40 hover:bg-foreground/5 transition flex items-center gap-1 text-[11px]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>

                  <span className="px-3 py-1.5 font-medium text-foreground bg-surface border border-border rounded-md text-[11px]">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-2.5 py-1.5 bg-surface border border-border rounded-md text-foreground/70 font-medium disabled:opacity-40 hover:bg-foreground/5 transition flex items-center gap-1 text-[11px]"
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
