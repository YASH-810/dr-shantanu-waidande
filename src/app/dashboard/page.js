"use client";

import React, { useState, useEffect } from 'react';
import { getLocalDB, saveLocalDB, generateId } from '@/lib/db';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  Clock, 
  Plus, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  X, 
  ChevronRight, 
  UserCheck, 
  Activity,
  Copy,
  Zap,
  Phone,
  MapPin,
  Stethoscope
} from 'lucide-react';

export default function OverviewDashboard() {
  const [db, setDb] = useState({ patients: [], sessions: [], income: [], receipts: [] });
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'income'
  
  // Modals
  const [logSessionModal, setLogSessionModal] = useState(false);
  const [addIncomeModal, setAddIncomeModal] = useState(false);
  const [toast, setToast] = useState(null);

  // New Session Form State
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'Direct',
    treatment: ''
  });

  // New Income Form State
  const [incomeForm, setIncomeForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    mode: 'Online',
    status: 'Completed',
    note: ''
  });

  useEffect(() => {
    const loadData = () => {
      const data = getLocalDB();
      setDb(data);
      if (data.patients && data.patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(data.patients[0].id);
      }
    };
    loadData();
    window.addEventListener('local-db-updated', loadData);
    return () => window.removeEventListener('local-db-updated', loadData);
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const selectedPatient = db.patients.find(p => p.id === selectedPatientId);

  // Calculate Metrics
  const totalPatients = db.patients.length;
  const totalSessions = db.sessions.length;
  const totalRevenue = db.income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const unbilledSessionsCount = db.sessions.filter(s => s.status === 'Unbilled').length;

  // Selected Patient Data
  const patientSessions = db.sessions.filter(s => s.patientId === selectedPatientId);
  const patientUnbilledSessions = patientSessions.filter(s => s.status === 'Unbilled');
  const patientIncome = db.income.filter(i => i.patientId === selectedPatientId);

  // Quick Log Session
  const handleLogSession = (e) => {
    e.preventDefault();
    if (!selectedPatientId || !sessionForm.treatment) {
      triggerToast('Please select patient and treatment details', 'error');
      return;
    }
    const newSession = {
      id: generateId('s'),
      patientId: selectedPatientId,
      date: sessionForm.date,
      type: sessionForm.type,
      treatment: sessionForm.treatment,
      status: 'Unbilled',
      createdAt: new Date().toISOString()
    };

    const updatedDb = {
      ...db,
      sessions: [newSession, ...db.sessions]
    };

    setDb(updatedDb);
    saveLocalDB(updatedDb);
    setLogSessionModal(false);
    setSessionForm({ date: new Date().toISOString().slice(0, 10), type: 'Direct', treatment: '' });
    triggerToast('Session logged successfully!');
  };

  // Quick Add Income
  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!selectedPatientId || !incomeForm.amount) {
      triggerToast('Please enter income amount', 'error');
      return;
    }

    const newIncome = {
      id: generateId('i'),
      patientId: selectedPatientId,
      date: incomeForm.date,
      receiptNo: `RCPT-${incomeForm.date.replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
      serialNo: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: parseFloat(incomeForm.amount) || 0,
      units: 'Session Payment',
      mode: incomeForm.mode,
      status: incomeForm.status,
      type: 'Direct',
      note: incomeForm.note || 'Direct payment',
      sessionIds: [],
      createdAt: new Date().toISOString()
    };

    const updatedDb = {
      ...db,
      income: [newIncome, ...db.income]
    };

    setDb(updatedDb);
    saveLocalDB(updatedDb);
    setAddIncomeModal(false);
    setIncomeForm({ date: new Date().toISOString().slice(0, 10), amount: '', mode: 'Online', status: 'Completed', note: '' });
    triggerToast('Income record added!');
  };

  // Copy Unbilled Sessions text for WhatsApp / SMS
  const handleCopyUnbilledText = () => {
    if (!selectedPatient || patientUnbilledSessions.length === 0) {
      triggerToast('No unbilled sessions to copy', 'error');
      return;
    }
    let text = `PhysioClinic Statement for ${selectedPatient.name}\nCase No: ${selectedPatient.caseNo}\nUnbilled Sessions (${patientUnbilledSessions.length}):\n`;
    patientUnbilledSessions.forEach((s, idx) => {
      text += `${idx + 1}. Date: ${s.date} | Treatment: ${s.treatment}\n`;
    });
    text += `\nPlease clear payment at your earliest convenience. Thank you!`;
    navigator.clipboard.writeText(text);
    triggerToast('Unbilled sessions text copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-950 text-rose-200 border-rose-800' : 'bg-slate-900 text-emerald-400 border-slate-700'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast.message}
        </div>
      )}

      {/* Global Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Patients</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalPatients}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Sessions</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalSessions}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Revenue</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Unbilled Sessions</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{unbilledSessionsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Layout: Patient Selector + Detailed Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Focus Patient List / Selector Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" /> Focus Patient
            </h2>
            <span className="text-xs text-slate-400">{db.patients.length} Registered</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Patient --</option>
              {db.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.caseNo || 'No Case'})
                </option>
              ))}
            </select>
          </div>

          {/* Quick List Cards for Mobile / Quick Selection */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {db.patients.map((p) => {
              const isSelected = p.id === selectedPatientId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full text-left p-3 rounded-xl transition border flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs font-semibold'
                      : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.caseNo} • {p.condition}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Focused Patient Detailed Workspace */}
        <div className="md:col-span-2 space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Info Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{selectedPatient.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedPatient.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedPatient.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Case No: <span className="font-mono font-semibold">{selectedPatient.caseNo}</span></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyUnbilledText}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                      title="Copy list of unbilled sessions to send to patient"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      Copy Unbilled
                    </button>
                  </div>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                    <span className="font-bold text-slate-800">{selectedPatient.age} Yrs / {selectedPatient.gender === 'F' ? 'Female' : 'Male'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Referred By</span>
                    <span className="font-bold text-slate-800">{selectedPatient.referredBy || 'Direct'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Start Date</span>
                    <span className="font-bold text-slate-800">{selectedPatient.startDate || '-'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Mobile</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {selectedPatient.mobile || '-'}
                    </span>
                  </div>
                </div>

                {/* Condition & Medical History */}
                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/60 text-xs space-y-1">
                  <div className="font-bold text-blue-950 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Condition: {selectedPatient.condition}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    <span className="font-semibold text-slate-700">Medical History: </span>
                    {selectedPatient.history || 'No detailed clinical history recorded yet.'}
                  </p>
                </div>
              </div>

              {/* Patient Sessions & Income Tabs */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-3">
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition border-b-2 ${
                      activeTab === 'sessions'
                        ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sessions ({patientSessions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('income')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition border-b-2 ${
                      activeTab === 'income'
                        ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Income & Payments ({patientIncome.length})
                  </button>
                </div>

                {/* Tab 1: Sessions */}
                {activeTab === 'sessions' && (
                  <div className="p-4 sm:p-5 space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">All Sessions</h4>
                      <button
                        onClick={() => setLogSessionModal(true)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-2xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Log Session
                      </button>
                    </div>

                    {patientSessions.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No sessions recorded for this patient yet. Click "+ Log Session" to add one.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                              <th className="py-2.5 px-2">Date</th>
                              <th className="py-2.5 px-2">Type</th>
                              <th className="py-2.5 px-2">Treatment</th>
                              <th className="py-2.5 px-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {patientSessions.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-50/80">
                                <td className="py-2.5 px-2 font-mono text-slate-700">{s.date}</td>
                                <td className="py-2.5 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    s.type === 'Hospital' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {s.type}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 font-medium text-slate-800">{s.treatment}</td>
                                <td className="py-2.5 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    s.status === 'Billed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {s.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Unbilled Sessions Subsection */}
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Unbilled Sessions</h4>
                      {patientUnbilledSessions.length === 0 ? (
                        <p className="text-xs text-slate-400">No pending unbilled sessions!</p>
                      ) : (
                        <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-3 space-y-2">
                          {patientUnbilledSessions.map((us) => (
                            <div key={us.id} className="flex items-center justify-between text-xs py-1 border-b border-amber-100 last:border-0">
                              <div>
                                <span className="font-mono text-slate-600 mr-2">{us.date}</span>
                                <span className="font-semibold text-slate-900">{us.treatment}</span>
                              </div>
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Unbilled</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: Income */}
                {activeTab === 'income' && (
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Income & Payment Records</h4>
                      <button
                        onClick={() => setAddIncomeModal(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-2xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Income
                      </button>
                    </div>

                    {patientIncome.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No financial records found for this patient. Click "+ Add Income" to record a payment.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                              <th className="py-2.5 px-2">Date</th>
                              <th className="py-2.5 px-2">Receipt #</th>
                              <th className="py-2.5 px-2">Amount</th>
                              <th className="py-2.5 px-2">Mode</th>
                              <th className="py-2.5 px-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {patientIncome.map((inc) => (
                              <tr key={inc.id} className="hover:bg-slate-50/80">
                                <td className="py-2.5 px-2 font-mono text-slate-700">{inc.date}</td>
                                <td className="py-2.5 px-2 font-mono text-xs text-blue-700">{inc.receiptNo}</td>
                                <td className="py-2.5 px-2 font-bold text-emerald-700">₹{inc.amount}</td>
                                <td className="py-2.5 px-2 text-slate-600">{inc.mode}</td>
                                <td className="py-2.5 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    inc.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {inc.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400 space-y-2">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold">Select a patient from the list to view medical history & log sessions.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal 1: Log Session Modal */}
      {logSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Treatment Session</h3>
              <button onClick={() => setLogSessionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Date</label>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Type</label>
                <select
                  value={sessionForm.type}
                  onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                >
                  <option value="Direct">Direct Clinic Patient</option>
                  <option value="Hospital">Hospital Patient</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treatment Details / Notes</label>
                <textarea
                  rows="3"
                  placeholder="e.g. IFT 20 min + Ultrasound + Lumbar mobilization"
                  value={sessionForm.treatment}
                  onChange={(e) => setSessionForm({ ...sessionForm, treatment: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLogSessionModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl shadow-xs"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Income Modal */}
      {addIncomeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Income Payment</h3>
              <button onClick={() => setAddIncomeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="600"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={incomeForm.mode}
                    onChange={(e) => setIncomeForm({ ...incomeForm, mode: e.target.value })}
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
                    value={incomeForm.status}
                    onChange={(e) => setIncomeForm({ ...incomeForm, status: e.target.value })}
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
                  placeholder="Package of 5 sessions"
                  value={incomeForm.note}
                  onChange={(e) => setIncomeForm({ ...incomeForm, note: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddIncomeModal(false)}
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
