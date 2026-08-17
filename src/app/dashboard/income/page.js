"use client";

import React, { useState, useEffect } from 'react';
import { getLocalDB, saveLocalDB, generateId } from '@/lib/db';
import { 
  IndianRupee, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  Trash2,
  X,
  CreditCard,
  Calendar,
  User,
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
    <div className="space-y-6">
      
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-emerald-400 border border-slate-700 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-600" /> Financial Records
          </h1>
          <p className="text-xs text-slate-500">Track revenue payments, pending amounts & modes</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Export Income
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </button>
        </div>
      </div>

      {/* Metrics Row (Kept only top 2 boxes in side-by-side grid) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400">Total Income Collected</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400">Pending Receivables</p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">₹{pendingAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters Bar & Status Tabs (Attached Design Layout) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        
        {/* Search & Payment Mode */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search receipt #, patient or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Modes</option>
              <option value="Online">Online / GPay</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Status Pill Tabs (Attached Reference Mobile Layout) */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ALL <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'All' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>{income.length}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Completed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'Completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              COMPLETED <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'Completed' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'}`}>{income.filter(i => i.status === 'Completed').length}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'Pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              PENDING <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'Pending' ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 text-slate-600'}`}>{income.filter(i => i.status === 'Pending').length}</span>
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-[11px] text-slate-400 font-medium pt-1">
          Showing <span className="font-bold text-slate-700">{filteredIncome.length}</span> of <span className="font-bold text-slate-700">{income.length}</span> income records
        </div>

      </div>

      {/* Income Table View (Desktop) & Cards (Mobile Attached Design Layout) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredIncome.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No financial income records match your filters.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedIncome.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{inc.receiptNo}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{inc.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{getPatientName(inc.patientId)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700 text-sm">₹{inc.amount}</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{inc.mode}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteIncome(inc.id)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-semibold"
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

            {/* Mobile Cards View (Exact Reference Attached Image Design Layout) */}
            <div className="md:hidden divide-y divide-slate-100 bg-slate-50/50 p-2 space-y-3">
              {paginatedIncome.map((inc) => (
                <div key={inc.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                  
                  {/* Subtitle Row: Date & Payment Mode */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pb-1 border-b border-slate-100">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {inc.date}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      {inc.mode}
                    </span>
                  </div>

                  {/* Main Title Row: Receipt # + Patient Name + Amount Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-0.5">
                        {inc.receiptNo || 'RCPT'}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {getPatientName(inc.patientId)}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-200/60 block">
                        ₹{inc.amount}
                      </span>
                    </div>
                  </div>

                  {/* Key-Value Details Grid */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Payment Mode</span>
                      <span className="text-slate-800 font-bold">{inc.mode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                    {inc.note && (
                      <div className="flex justify-between items-start gap-2 pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400 font-medium shrink-0">Note</span>
                        <span className="text-slate-600 text-right italic">{inc.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDeleteIncome(inc.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Record
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Pagination Controls Bar */}
            {filteredIncome.length > 0 && (
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
                    Showing <strong className="text-slate-800">{Math.min((currentPage - 1) * pageSize + 1, filteredIncome.length)}</strong>–<strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredIncome.length)}</strong> of <strong className="text-slate-800">{filteredIncome.length}</strong> records
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

      {/* Add Income Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Income Payment</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold"
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
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Online">Online / GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Note</label>
                <input
                  type="text"
                  placeholder="e.g. 5-session lumbar rehab package"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-semibold text-white rounded-xl shadow-xs"
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
