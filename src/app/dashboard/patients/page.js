"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalDB, saveLocalDB, generateId } from '@/lib/db';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  FileText, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);

  const [sessionModalPatient, setSessionModalPatient] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'Direct',
    treatment: '',
    progressNotes: '',
    status: 'Unbilled'
  });

  const [formData, setFormData] = useState({
    caseNo: '', name: '', age: '', gender: 'M', condition: '', history: '',
    referredBy: '', startDate: new Date().toISOString().slice(0, 10),
    status: 'Active', mobile: '', address: ''
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadData = () => {
      const data = getLocalDB();
      setPatients(data.patients || []);
      setSessions(data.sessions || []);
    };
    loadData();
    window.addEventListener('local-db-updated', loadData);
    return () => window.removeEventListener('local-db-updated', loadData);
  }, []);

  const triggerToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (patient = null) => {
    if (patient) {
      setEditingPatientId(patient.id);
      setFormData({
        caseNo: patient.caseNo || '', name: patient.name || '', age: patient.age || '',
        gender: patient.gender || 'M', condition: patient.condition || '', history: patient.history || '',
        referredBy: patient.referredBy || '', startDate: patient.startDate || new Date().toISOString().slice(0, 10),
        status: patient.status || 'Active', mobile: patient.mobile || '', address: patient.address || ''
      });
    } else {
      setEditingPatientId(null);
      const nextNo = `PC-2024-${String(patients.length + 1).padStart(3, '0')}`;
      setFormData({
        caseNo: nextNo, name: '', age: '', gender: 'M', condition: '', history: '',
        referredBy: '', startDate: new Date().toISOString().slice(0, 10),
        status: 'Active', mobile: '', address: ''
      });
    }
    setModalOpen(true);
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    const db = getLocalDB();
    let updatedPatients = [...db.patients];
    if (editingPatientId) {
      updatedPatients = updatedPatients.map(p => p.id === editingPatientId ? { ...p, ...formData } : p);
      triggerToast('Patient details updated');
    } else {
      updatedPatients.unshift({ id: generateId('p'), ...formData, createdAt: new Date().toISOString() });
      triggerToast('New patient registered');
    }
    setPatients(updatedPatients);
    saveLocalDB({ ...db, patients: updatedPatients });
    setModalOpen(false);
  };

  const handleDeletePatient = (id) => {
    if (!confirm('Are you sure you want to delete this patient record?')) return;
    const db = getLocalDB();
    const updated = db.patients.filter(p => p.id !== id);
    setPatients(updated);
    saveLocalDB({ ...db, patients: updated });
    triggerToast('Patient deleted');
  };

  const handleOpenSessionModal = (patient) => {
    setSessionModalPatient(patient);
    setSessionForm({ date: new Date().toISOString().slice(0, 10), type: 'Direct', treatment: '', progressNotes: '', status: 'Unbilled' });
  };

  const handleSaveSession = (e) => {
    e.preventDefault();
    if (!sessionModalPatient || !sessionForm.treatment) return;
    const db = getLocalDB();
    const newSession = {
      id: generateId('s'), patientId: sessionModalPatient.id, date: sessionForm.date,
      type: sessionForm.type, treatment: sessionForm.treatment, progressNotes: sessionForm.progressNotes,
      status: sessionForm.status, createdAt: new Date().toISOString()
    };
    const updatedSessions = [newSession, ...(db.sessions || [])];
    setSessions(updatedSessions);
    saveLocalDB({ ...db, sessions: updatedSessions });
    setSessionModalPatient(null);
    triggerToast(`Session logged for ${sessionModalPatient.name}`);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('local-db-updated'));
  };

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, genderFilter]);

  const filteredPatients = patients.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name?.toLowerCase().includes(q) || p.caseNo?.toLowerCase().includes(q) || p.condition?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter;
    return matchesSearch && matchesStatus && matchesGender;
  });

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    if (filteredPatients.length === 0) return;
    const esc = x => `"${String(x ?? '').replace(/"/g, '""')}"`;
    let csv = '"Case No","Name","Age","Gender","Condition","History","Referred By","Start Date","Status","Mobile","Address"\n';
    filteredPatients.forEach(p => {
      csv += [p.caseNo, p.name, p.age, p.gender, p.condition, p.history, p.referredBy, p.startDate, p.status, p.mobile, p.address].map(esc).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `patients_directory_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
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
            <Users className="w-5 h-5 text-primary" /> Patient Directory
          </h1>
          <p className="text-xs text-foreground/50">Manage patient records, log treatment sessions & track rehabilitation progress</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="px-3.5 py-2 bg-muted hover:bg-muted/70 text-foreground/70 text-xs font-medium rounded-md flex items-center gap-1.5 transition">
            <Download className="w-4 h-4 text-primary" /> Export CSV
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary hover:opacity-90 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition active:scale-[0.98]">
            <Plus className="w-4 h-4" /> New Patient
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface p-4 rounded-lg border border-border space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-foreground/30 absolute left-3 top-3" />
            <input type="text" placeholder="Search by patient name, case no, condition..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:border-primary font-medium" />
          </div>
          <div className="flex gap-2 sm:hidden">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-1/2 p-2 bg-background border border-border rounded-md text-xs font-medium text-foreground">
              <option value="All">All Statuses</option><option value="Active">Active</option><option value="Completed">Completed</option>
            </select>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="w-1/2 p-2 bg-background border border-border rounded-md text-xs font-medium text-foreground">
              <option value="All">All Genders</option><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['All', 'Active', 'Completed'].map(status => (
              <button key={status} onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  statusFilter === status ? 'bg-primary text-white' : 'bg-foreground/5 text-foreground/50 hover:bg-foreground/10'
                }`}>
                {status.toUpperCase()}
                <span className={`text-[10px] px-1.5 rounded-full ${statusFilter === status ? 'bg-white/20 text-white' : 'bg-foreground/5 text-foreground/40'}`}>
                  {status === 'All' ? patients.length : patients.filter(p => p.status === status).length}
                </span>
              </button>
            ))}
          </div>
          <div className="hidden sm:flex gap-2">
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="p-1.5 bg-background border border-border rounded-md text-xs font-medium text-foreground">
              <option value="All">All Genders</option><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-foreground/35 font-medium pt-1">
          Showing <span className="font-semibold text-foreground">{filteredPatients.length}</span> of <span className="font-semibold text-foreground">{patients.length}</span> patients
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-foreground/30 text-xs">No patient records match your search query.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-background border-b border-border text-foreground/40 font-medium uppercase tracking-wider">
                    <th className="py-3 px-4">Case No</th><th className="py-3 px-4">Patient Name</th><th className="py-3 px-4">Age/Sex</th>
                    <th className="py-3 px-4">Condition</th><th className="py-3 px-4">Sessions</th><th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {paginatedPatients.map((p) => {
                    const count = sessions.filter(s => s.patientId === p.id).length;
                    return (
                      <tr key={p.id} className="hover:bg-background/50 transition">
                        <td className="py-3 px-4 font-mono font-semibold text-foreground/70">{p.caseNo}</td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/patients/${p.id}`} className="font-semibold text-primary hover:underline block">{p.name}</Link>
                          <div className="text-[10px] text-foreground/35">{p.mobile}</div>
                        </td>
                        <td className="py-3 px-4 text-foreground/60">{p.age} / {p.gender}</td>
                        <td className="py-3 px-4 font-medium text-foreground">{p.condition}</td>
                        <td className="py-3 px-4">
                          <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded text-[11px]">{count} {count === 1 ? 'session' : 'sessions'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${p.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-foreground/5 text-foreground/50'}`}>{p.status}</span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button onClick={() => handleOpenSessionModal(p)} className="px-2 py-1 bg-primary/8 hover:bg-primary/15 text-primary rounded text-[11px] font-medium">
                            <CalendarCheck className="w-3.5 h-3.5 inline" /> Log
                          </button>
                          <Link href={`/dashboard/patients/${p.id}`} className="px-2 py-1 bg-foreground/5 hover:bg-foreground/10 text-foreground/70 rounded text-[11px] font-medium inline-flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> View
                          </Link>
                          <button onClick={() => handleOpenModal(p)} className="px-2 py-1 bg-primary/8 hover:bg-primary/15 text-primary rounded text-[11px] font-medium">
                            <Edit3 className="w-3.5 h-3.5 inline" /> Edit
                          </button>
                          <button onClick={() => handleDeletePatient(p.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-medium">
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards — no active:scale gimmick */}
            <div className="md:hidden divide-y divide-border bg-background p-2 space-y-2">
              {paginatedPatients.map((p) => {
                const count = sessions.filter(s => s.patientId === p.id).length;
                return (
                  <div key={p.id} className="bg-surface rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-foreground/35 font-medium pb-1 border-b border-border">
                      <span className="flex items-center gap-1 font-mono"><Calendar className="w-3 h-3" /> {p.startDate || '-'}</span>
                      <span className="font-mono text-primary font-medium bg-primary/8 px-2 py-0.5 rounded text-[10px]">{count} Sessions</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-sm inline-block mb-0.5">{p.caseNo}</span>
                        <Link href={`/dashboard/patients/${p.id}`} className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition block">{p.name}</Link>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-1 rounded text-[10px] font-medium ${p.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-foreground/5 text-foreground/50'}`}>{p.status}</span>
                        <Link href={`/dashboard/patients/${p.id}`} className="text-foreground/30 hover:text-foreground/60 p-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      </div>
                    </div>
                    <div className="bg-background rounded-md p-3 border border-border text-xs space-y-1.5">
                      <div className="flex justify-between"><span className="text-foreground/35">Condition</span><span className="font-medium text-foreground text-right">{p.condition}</span></div>
                      <div className="flex justify-between"><span className="text-foreground/35">Age / Sex</span><span className="font-medium text-foreground/70">{p.age} Yrs / {p.gender}</span></div>
                      <div className="flex justify-between"><span className="text-foreground/35">Contact</span><span className="font-mono font-medium text-foreground">{p.mobile || '-'}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button onClick={() => handleOpenSessionModal(p)} className="py-2 bg-primary hover:opacity-90 text-white text-xs font-medium rounded-md text-center transition flex items-center justify-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5" /> Log Session
                      </button>
                      <Link href={`/dashboard/patients/${p.id}`} className="py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/70 text-xs font-medium rounded-md text-center transition flex items-center justify-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Progression
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredPatients.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border text-xs bg-background">
                <div className="flex items-center gap-2 text-foreground/40 font-medium">
                  <span>Rows:</span>
                  <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-2 py-1 bg-surface border border-border rounded-md text-foreground font-medium focus:outline-none">
                    <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                  </select>
                  <span className="ml-1 text-[11px]">
                    Showing <strong className="text-foreground">{Math.min((currentPage - 1) * pageSize + 1, filteredPatients.length)}</strong>–<strong className="text-foreground">{Math.min(currentPage * pageSize, filteredPatients.length)}</strong> of <strong className="text-foreground">{filteredPatients.length}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-2.5 py-1.5 bg-surface border border-border rounded-md text-foreground/70 font-medium disabled:opacity-40 hover:bg-foreground/5 transition flex items-center gap-1 text-[11px]">
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <span className="px-3 py-1.5 font-medium text-foreground bg-surface border border-border rounded-md text-[11px]">Page {currentPage} of {totalPages}</span>
                  <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-2.5 py-1.5 bg-surface border border-border rounded-md text-foreground/70 font-medium disabled:opacity-40 hover:bg-foreground/5 transition flex items-center gap-1 text-[11px]">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Patient Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">{editingPatientId ? 'Edit Patient Details' : 'Register New Patient'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-foreground/30 hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSavePatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-medium text-foreground/60 mb-1">Case No</label><input type="text" value={formData.caseNo} onChange={(e) => setFormData({ ...formData, caseNo: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md font-mono text-foreground" required /></div>
                <div><label className="block font-medium text-foreground/60 mb-1">Patient Name</label><input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md font-medium text-foreground" required /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block font-medium text-foreground/60 mb-1">Age</label><input type="number" placeholder="45" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
                <div><label className="block font-medium text-foreground/60 mb-1">Gender</label><select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select></div>
                <div><label className="block font-medium text-foreground/60 mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"><option value="Active">Active</option><option value="Completed">Completed</option></select></div>
              </div>
              <div><label className="block font-medium text-foreground/60 mb-1">Condition / Diagnosis</label><input type="text" placeholder="e.g. Lumbar Spondylosis" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" required /></div>
              <div><label className="block font-medium text-foreground/60 mb-1">Medical & Treatment History</label><textarea rows="3" placeholder="Clinical history, onset, past surgeries..." value={formData.history} onChange={(e) => setFormData({ ...formData, history: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-medium text-foreground/60 mb-1">Referred By</label><input type="text" placeholder="Doctor name or Direct" value={formData.referredBy} onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
                <div><label className="block font-medium text-foreground/60 mb-1">Mobile Number</label><input type="text" placeholder="+91 98230 11223" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
              </div>
              <div><label className="block font-medium text-foreground/60 mb-1">Address</label><input type="text" placeholder="City / Area" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="w-1/2 py-2.5 bg-muted hover:bg-muted/80 font-medium text-foreground/70 rounded-md">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 bg-primary hover:opacity-90 font-medium text-white rounded-md">Save Patient Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Session Modal */}
      {sessionModalPatient && (
        <div className="fixed inset-0 z-[60] bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><CalendarCheck className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Log Rehab Session</h3>
                  <p className="text-[11px] text-foreground/50">Patient: <span className="font-semibold text-foreground">{sessionModalPatient.name}</span> ({sessionModalPatient.caseNo})</p>
                </div>
              </div>
              <button onClick={() => setSessionModalPatient(null)} className="p-1 rounded-md text-foreground/30 hover:text-foreground hover:bg-foreground/5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveSession} className="space-y-3.5 text-xs">
              <div><label className="block font-medium text-foreground/60 mb-1">Session Date *</label><input type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" required /></div>
              <div><label className="block font-medium text-foreground/60 mb-1">Treatment & Modalities *</label><input type="text" placeholder="e.g. IFT 20 mins + Ultrasound therapy" value={sessionForm.treatment} onChange={(e) => setSessionForm({ ...sessionForm, treatment: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground font-medium focus:outline-none focus:border-primary" required /></div>
              <div><label className="block font-medium text-foreground/60 mb-1">Progress Notes</label><textarea rows="3" placeholder="Pain decreased to VAS 4/10..." value={sessionForm.progressNotes} onChange={(e) => setSessionForm({ ...sessionForm, progressNotes: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSessionModalPatient(null)} className="w-1/2 py-2.5 bg-muted hover:bg-muted/80 font-medium text-foreground/70 rounded-md">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 bg-primary hover:opacity-90 font-medium text-white rounded-md">Save Progression Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
