"use client";

import React, { useState, useEffect } from 'react';
import { getLocalDB, saveLocalDB, generateId } from '@/lib/db';
import { 
  IndianRupee, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  Trash2,
  X,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function IncomePage() {
  const [income, setIncome] = useState([]);
  const [patients, setPatients] = useState([]);
  
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    mode: 'Online',
    status: 'Completed',
    note: ''
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    const data = getLocalDB();
    setIncome(data.income || []);
    setPatients(data.patients || []);
    if (data.patients && data.patients.length > 0) {
      setFormData(prev => ({ ...prev, patientId: data.patients[0].id }));
    }
  }, []);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getPatientName = (patientId) => {
    const p = patients.find(x => x.id === patientId);
    return p ? p.name : 'Direct Patient';
  };

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    const db = getLocalDB();
    const newIncome = {
      id: generateId('i'),
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      receiptNo: `RCPT-${formData.date.replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
      serialNo: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
      units: 'Payment',
      type: 'Direct',
      createdAt: new Date().toISOString()
    };

    const updated = [newIncome, ...db.income];
    setIncome(updated);
    saveLocalDB({ ...db, income: updated });
    setModalOpen(false);
    setFormData({
      patientId: patients[0]?.id || '',
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      mode: 'Online',
      status: 'Completed',
      note: ''
    });
    triggerToast('Income payment recorded');
  };

  const handleDeleteIncome = (id) => {
    if (!confirm('Delete this financial record?')) return;
    const db = getLocalDB();
    const updated = db.income.filter(i => i.id !== id);
    setIncome(updated);
    saveLocalDB({ ...db, income: updated });
    triggerToast('Income record deleted');
  };

  // Metrics
  const totalRevenue = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const pendingAmount = income.filter(i => i.status === 'Pending').reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, modeFilter, statusFilter]);

  const filteredIncome = income.filter(item => {
    const pName = getPatientName(item.patientId).toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = !q || pName.includes(q) || item.receiptNo?.toLowerCase().includes(q) || item.note?.toLowerCase().includes(q);
    const matchesMode = modeFilter === 'All' || item.mode === modeFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesMode && matchesStatus;
  });

  const totalPages = Math.ceil(filteredIncome.length / pageSize) || 1;
  const paginatedIncome = filteredIncome.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    if (filteredIncome.length === 0) return;
    const esc = x => `"${String(x ?? '').replace(/"/g, '""')}"`;
    let csv = '"Receipt No","Date","Patient","Amount","Mode","Status","Note"\n';
    filteredIncome.forEach(i => {
      csv += [i.receiptNo, i.date, getPatientName(i.patientId), i.amount, i.mode, i.status, i.note].map(esc).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_income_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-foreground text-primary-light border border-foreground/80 rounded-lg shadow-md text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2 font-serif">
            <IndianRupee className="w-5 h-5 text-primary" /> Financial Records
          </h1>
          <p className="text-xs text-foreground/50">Track revenue payments, pending amounts & modes</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-muted hover:bg-muted/70 text-foreground/70 text-xs font-medium rounded-md flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-primary" />
            Export Income
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary hover:opacity-90 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </button>
        </div>
      </div>

      {/* Metrics Row — Stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-surface p-4 rounded-lg border border-border">
          <p className="text-[11px] font-medium uppercase text-foreground/40 tracking-wide">Total Income Collected</p>
          <p className="text-2xl font-serif text-primary mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-surface p-4 rounded-lg border border-border">
          <p className="text-[11px] font-medium uppercase text-foreground/40 tracking-wide">Pending Receivables</p>
          <p className="text-2xl font-serif text-accent mt-1">₹{pendingAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters Bar & Status Tabs */}
      <div className="bg-surface p-4 rounded-lg border border-border space-y-3">
        
        {/* Search & Payment Mode */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-foreground/30 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search receipt #, patient or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="p-2 bg-background border border-border rounded-md text-xs font-medium text-foreground focus:outline-none"
            >
              <option value="All">All Modes</option>
              <option value="Online">Online / GPay</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['All', 'Completed', 'Pending'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 text-foreground/50 hover:bg-foreground/10'
                }`}
              >
                {status.toUpperCase()}
                <span className={`text-[10px] px-1.5 rounded-full ${
                  statusFilter === status ? 'bg-white/20 text-white' : 'bg-foreground/5 text-foreground/40'
                }`}>
                  {status === 'All' ? income.length : income.filter(i => i.status === status).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-[11px] text-foreground/35 font-medium pt-1">
          Showing <span className="font-semibold text-foreground">{filteredIncome.length}</span> of <span className="font-semibold text-foreground">{income.length}</span> income records
        </div>

      </div>

      {/* Income Table View (Desktop) & Cards (Mobile) */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {filteredIncome.length === 0 ? (
          <div className="p-12 text-center text-foreground/30 text-xs">
            No financial income records match your filters.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-background border-b border-border text-foreground/40 font-medium uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {paginatedIncome.map((inc) => (
                    <tr key={inc.id} className="hover:bg-background/50 transition">
                      <td className="py-3 px-4 font-mono font-medium text-primary">{inc.receiptNo}</td>
                      <td className="py-3 px-4 font-mono text-foreground/70">{inc.date}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{getPatientName(inc.patientId)}</td>
                      <td className="py-3 px-4 font-semibold text-primary text-sm">₹{inc.amount}</td>
                      <td className="py-3 px-4 text-foreground/70 font-medium">{inc.mode}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          inc.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-accent'
                        }`}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteIncome(inc.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-medium"
                          title="Delete Record"
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
              {paginatedIncome.map((inc) => (
                <div key={inc.id} className="bg-surface rounded-lg border border-border p-4 space-y-3">
                  
                  {/* Subtitle Row */}
                  <div className="flex items-center justify-between text-[11px] text-foreground/35 font-medium pb-1 border-b border-border">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-foreground/30" />
                      {inc.date}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-foreground/60">
                      <CreditCard className="w-3 h-3 text-foreground/30" />
                      {inc.mode}
                    </span>
                  </div>

                  {/* Title Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-sm inline-block mb-0.5">
                        {inc.receiptNo || 'RCPT'}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground leading-snug">
                        {getPatientName(inc.patientId)}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold text-primary bg-primary/10 border border-primary/15 block">
                        ₹{inc.amount}
                      </span>
                    </div>
                  </div>

                  {/* Key-Value Details */}
                  <div className="bg-background rounded-md p-3 border border-border text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/35">Payment Mode</span>
                      <span className="text-foreground font-medium">{inc.mode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/35">Status</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        inc.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-accent'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                    {inc.note && (
                      <div className="flex justify-between items-start gap-2 pt-1 border-t border-border">
                        <span className="text-foreground/35 shrink-0">Note</span>
                        <span className="text-foreground/60 text-right italic">{inc.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDeleteIncome(inc.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-md transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Record
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Pagination Controls Bar */}
            {filteredIncome.length > 0 && (
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
                    Showing <strong className="text-foreground">{Math.min((currentPage - 1) * pageSize + 1, filteredIncome.length)}</strong>–<strong className="text-foreground">{Math.min(currentPage * pageSize, filteredIncome.length)}</strong> of <strong className="text-foreground">{filteredIncome.length}</strong> records
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

      {/* Add Income Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-lg shadow-xl p-5 space-y-4 border border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Record Income Payment</h3>
              <button onClick={() => setModalOpen(false)} className="text-foreground/30 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-foreground/60 mb-1">Select Patient</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground font-medium"
                  required
                >
                  <option value="">-- Direct Payment / Select Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.caseNo})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground/60 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground/60 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-foreground font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground/60 mb-1">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  >
                    <option value="Online">Online / GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground/60 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground/60 mb-1">Payment Note</label>
                <input
                  type="text"
                  placeholder="e.g. 5-session lumbar rehab package"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 bg-muted hover:bg-muted/80 font-medium text-foreground/70 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-primary hover:opacity-90 font-medium text-white rounded-md"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
