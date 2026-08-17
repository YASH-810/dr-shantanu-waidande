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
  X, 
  ChevronRight, 
  UserCheck, 
  Activity,
  Copy,
  Phone
} from 'lucide-react';

export default function OverviewDashboard() {
  const [db, setDb] = useState({ patients: [], sessions: [], income: [], receipts: [] });
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [activeTab, setActiveTab] = useState('sessions');
  
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

  // Metrics
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

    const updatedDb = { ...db, sessions: [newSession, ...db.sessions] };
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

    const updatedDb = { ...db, income: [newIncome, ...db.income] };
    setDb(updatedDb);
    saveLocalDB(updatedDb);
    setAddIncomeModal(false);
    setIncomeForm({ date: new Date().toISOString().slice(0, 10), amount: '', mode: 'Online', status: 'Completed', note: '' });
    triggerToast('Income record added!');
  };

  // Copy Unbilled Sessions text
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
    <div className="space-y-5">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-md border text-xs font-medium flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-foreground text-primary-light border-foreground/80'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Stat Cards — text-only, no icon squares */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface p-4 rounded-lg border border-border">
          <p className="text-[11px] font-medium uppercase text-foreground/40 tracking-wide">Patients</p>
          <p className="text-2xl font-serif text-foreground mt-1">{totalPatients}</p>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-border">
          <p className="text-[11px] font-medium uppercase text-foreground/40 tracking-wide">Sessions</p>
          <p className="text-2xl font-serif text-foreground mt-1">{totalSessions}</p>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-border">
          <p className="text-[11px] font-medium uppercase text-foreground/40 tracking-wide">Revenue</p>
          <p className="text-2xl font-serif text-primary mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-border">
          <p className="text-[11px] font-medium uppercase text-foreground/40 tracking-wide">Unbilled</p>
          <p className="text-2xl font-serif text-accent mt-1">{unbilledSessionsCount}</p>
        </div>
      </div>

      {/* Main Layout: Patient Selector + Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left: Patient List (scrollable, no dropdown) */}
        <div className="bg-surface p-4 rounded-lg border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" /> Focus Patient
            </h2>
            <span className="text-[11px] text-foreground/40">{db.patients.length} total</span>
          </div>

          <div className="space-y-1 max-h-[380px] overflow-y-auto">
            {db.patients.map((p) => {
              const isSelected = p.id === selectedPatientId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full text-left p-3 rounded-md transition border flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/8 border-primary/20 text-foreground font-medium'
                      : 'bg-transparent hover:bg-foreground/3 border-transparent text-foreground/70'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">{p.name}</div>
                    <div className="text-[10px] text-foreground/40">{p.caseNo} · {p.condition}</div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-foreground/20'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Focused Patient Workspace */}
        <div className="md:col-span-2 space-y-5">
          {selectedPatient ? (
            <>
              {/* Patient Info */}
              <div className="bg-surface p-5 rounded-lg border border-border space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground font-serif">{selectedPatient.name}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        selectedPatient.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-foreground/5 text-foreground/50'
                      }`}>
                        {selectedPatient.status}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50">Case No: <span className="font-mono font-medium">{selectedPatient.caseNo}</span></p>
                  </div>

                  <button
                    onClick={handleCopyUnbilledText}
                    className="px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 text-foreground/70 text-xs font-medium rounded-md flex items-center gap-1.5 transition"
                    title="Copy list of unbilled sessions to send to patient"
                  >
                    <Copy className="w-3.5 h-3.5 text-primary" />
                    Copy Unbilled
                  </button>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-background p-2.5 rounded-md border border-border">
                    <span className="text-foreground/35 block text-[10px]">Age / Gender</span>
                    <span className="font-medium text-foreground">{selectedPatient.age} Yrs / {selectedPatient.gender === 'F' ? 'Female' : 'Male'}</span>
                  </div>
                  <div className="bg-background p-2.5 rounded-md border border-border">
                    <span className="text-foreground/35 block text-[10px]">Referred By</span>
                    <span className="font-medium text-foreground">{selectedPatient.referredBy || 'Direct'}</span>
                  </div>
                  <div className="bg-background p-2.5 rounded-md border border-border">
                    <span className="text-foreground/35 block text-[10px]">Start Date</span>
                    <span className="font-medium text-foreground">{selectedPatient.startDate || '-'}</span>
                  </div>
                  <div className="bg-background p-2.5 rounded-md border border-border">
                    <span className="text-foreground/35 block text-[10px]">Mobile</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3 text-foreground/30" />
                      {selectedPatient.mobile || '-'}
                    </span>
                  </div>
                </div>

                {/* Condition */}
                <div className="bg-primary/5 p-3.5 rounded-md border border-primary/10 text-xs space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary" />
                    Condition: {selectedPatient.condition}
                  </div>
                  <p className="text-foreground/60 leading-relaxed">
                    <span className="font-medium text-foreground/70">History: </span>
                    {selectedPatient.history || 'No detailed clinical history recorded yet.'}
                  </p>
                </div>
              </div>

              {/* Sessions & Income Tabs */}
              <div className="bg-surface rounded-lg border border-border overflow-hidden">
                <div className="flex border-b border-border bg-background px-4 pt-3">
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`px-4 py-2.5 font-medium text-xs transition border-b-2 ${
                      activeTab === 'sessions'
                        ? 'border-primary text-primary bg-surface'
                        : 'border-transparent text-foreground/40 hover:text-foreground/70'
                    }`}
                  >
                    Sessions ({patientSessions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('income')}
                    className={`px-4 py-2.5 font-medium text-xs transition border-b-2 ${
                      activeTab === 'income'
                        ? 'border-primary text-primary bg-surface'
                        : 'border-transparent text-foreground/40 hover:text-foreground/70'
                    }`}
                  >
                    Income ({patientIncome.length})
                  </button>
                </div>

                {/* Tab: Sessions */}
                {activeTab === 'sessions' && (
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">All Sessions</h4>
                      <button
                        onClick={() => setLogSessionModal(true)}
                        className="px-3 py-1.5 bg-primary hover:opacity-90 text-white text-xs font-medium rounded-md flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Log Session
                      </button>
                    </div>

                    {patientSessions.length === 0 ? (
                      <div className="text-center py-8 text-foreground/30 text-xs">
                        No sessions recorded for this patient yet.
                      </div>
                    ) : (
                      <>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border text-foreground/35 font-medium uppercase">
                                <th className="py-2.5 px-2">Date</th>
                                <th className="py-2.5 px-2">Type</th>
                                <th className="py-2.5 px-2">Treatment</th>
                                <th className="py-2.5 px-2">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {patientSessions.map((s) => (
                                <tr key={s.id} className="hover:bg-background/50">
                                  <td className="py-2.5 px-2 font-mono text-foreground/70">{s.date}</td>
                                  <td className="py-2.5 px-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                      s.type === 'Hospital' ? 'bg-foreground/5 text-foreground/60' : 'bg-primary/10 text-primary'
                                    }`}>
                                      {s.type}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 font-medium text-foreground">{s.treatment}</td>
                                  <td className="py-2.5 px-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                      s.status === 'Billed' ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-accent'
                                    }`}>
                                      {s.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden space-y-2">
                          {patientSessions.map((s) => (
                            <div key={s.id} className="p-3 bg-background rounded-md border border-border text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-foreground/60">{s.date}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  s.status === 'Billed' ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-accent'
                                }`}>
                                  {s.status}
                                </span>
                              </div>
                              <p className="font-medium text-foreground">{s.treatment}</p>
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                                s.type === 'Hospital' ? 'bg-foreground/5 text-foreground/60' : 'bg-primary/10 text-primary'
                              }`}>
                                {s.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Unbilled subsection */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Unbilled Sessions</h4>
                      {patientUnbilledSessions.length === 0 ? (
                        <p className="text-xs text-foreground/30">No pending unbilled sessions.</p>
                      ) : (
                        <div className="bg-accent/5 border border-accent/15 rounded-md p-3 space-y-2">
                          {patientUnbilledSessions.map((us) => (
                            <div key={us.id} className="flex items-center justify-between text-xs py-1 border-b border-accent/10 last:border-0">
                              <div>
                                <span className="font-mono text-foreground/50 mr-2">{us.date}</span>
                                <span className="font-medium text-foreground">{us.treatment}</span>
                              </div>
                              <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">Unbilled</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Income */}
                {activeTab === 'income' && (
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Income Records</h4>
                      <button
                        onClick={() => setAddIncomeModal(true)}
                        className="px-3 py-1.5 bg-primary hover:opacity-90 text-white text-xs font-medium rounded-md flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Income
                      </button>
                    </div>

                    {patientIncome.length === 0 ? (
                      <div className="text-center py-8 text-foreground/30 text-xs">
                        No financial records found for this patient.
                      </div>
                    ) : (
                      <>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border text-foreground/35 font-medium uppercase">
                                <th className="py-2.5 px-2">Date</th>
                                <th className="py-2.5 px-2">Receipt #</th>
                                <th className="py-2.5 px-2">Amount</th>
                                <th className="py-2.5 px-2">Mode</th>
                                <th className="py-2.5 px-2">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {patientIncome.map((inc) => (
                                <tr key={inc.id} className="hover:bg-background/50">
                                  <td className="py-2.5 px-2 font-mono text-foreground/70">{inc.date}</td>
                                  <td className="py-2.5 px-2 font-mono text-xs text-primary">{inc.receiptNo}</td>
                                  <td className="py-2.5 px-2 font-semibold text-primary">₹{inc.amount}</td>
                                  <td className="py-2.5 px-2 text-foreground/60">{inc.mode}</td>
                                  <td className="py-2.5 px-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                      inc.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-accent'
                                    }`}>
                                      {inc.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden space-y-2">
                          {patientIncome.map((inc) => (
                            <div key={inc.id} className="p-3 bg-background rounded-md border border-border text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-foreground/60">{inc.date}</span>
                                <span className="font-semibold text-primary">₹{inc.amount}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-foreground/40 text-[10px]">{inc.receiptNo}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  inc.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-accent'
                                }`}>
                                  {inc.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-surface p-12 rounded-lg border border-border text-center text-foreground/30 space-y-2">
              <UserCheck className="w-10 h-10 text-foreground/15 mx-auto" />
              <p className="text-sm font-medium">Select a patient to view history and log sessions.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Log Session */}
      {logSessionModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-lg shadow-xl p-5 space-y-4 border border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Log Treatment Session</h3>
              <button onClick={() => setLogSessionModal(false)} className="text-foreground/30 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground/60 mb-1">Session Date</label>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-foreground/60 mb-1">Session Type</label>
                <select
                  value={sessionForm.type}
                  onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                >
                  <option value="Direct">Direct Clinic Patient</option>
                  <option value="Hospital">Hospital Patient</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground/60 mb-1">Treatment Details</label>
                <textarea
                  rows="3"
                  placeholder="e.g. IFT 20 min + Ultrasound + Lumbar mobilization"
                  value={sessionForm.treatment}
                  onChange={(e) => setSessionForm({ ...sessionForm, treatment: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLogSessionModal(false)}
                  className="w-1/2 py-2.5 bg-muted hover:bg-muted/80 font-medium text-foreground/70 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-primary hover:opacity-90 font-medium text-white rounded-md"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Income */}
      {addIncomeModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-lg shadow-xl p-5 space-y-4 border border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Record Income Payment</h3>
              <button onClick={() => setAddIncomeModal(false)} className="text-foreground/30 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground/60 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-foreground/60 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="600"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-foreground/60 mb-1">Payment Mode</label>
                  <select
                    value={incomeForm.mode}
                    onChange={(e) => setIncomeForm({ ...incomeForm, mode: e.target.value })}
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
                    value={incomeForm.status}
                    onChange={(e) => setIncomeForm({ ...incomeForm, status: e.target.value })}
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
                  placeholder="Package of 5 sessions"
                  value={incomeForm.note}
                  onChange={(e) => setIncomeForm({ ...incomeForm, note: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddIncomeModal(false)}
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
