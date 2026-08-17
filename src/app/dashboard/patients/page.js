"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalDB, saveLocalDB, generateId } from '@/lib/db';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  FileText, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2,
  Calendar,
  Phone,
  MapPin,
  Stethoscope,
  Activity,
  CalendarCheck,
  TrendingUp,
  PlusCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);

  // Session Logging Modal State
  const [sessionModalPatient, setSessionModalPatient] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'Direct',
    treatment: '',
    progressNotes: '',
    status: 'Unbilled'
  });

  // Patient Form State
  const [formData, setFormData] = useState({
    caseNo: '',
    name: '',
    age: '',
    gender: 'M',
    condition: '',
    history: '',
    referredBy: '',
    startDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
    mobile: '',
    address: ''
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
        caseNo: patient.caseNo || '',
        name: patient.name || '',
        age: patient.age || '',
        gender: patient.gender || 'M',
        condition: patient.condition || '',
        history: patient.history || '',
        referredBy: patient.referredBy || '',
        startDate: patient.startDate || new Date().toISOString().slice(0, 10),
        status: patient.status || 'Active',
        mobile: patient.mobile || '',
        address: patient.address || ''
      });
    } else {
      setEditingPatientId(null);
      const nextNo = `PC-2024-${String(patients.length + 1).padStart(3, '0')}`;
      setFormData({
        caseNo: nextNo,
        name: '',
        age: '',
        gender: 'M',
        condition: '',
        history: '',
        referredBy: '',
        startDate: new Date().toISOString().slice(0, 10),
        status: 'Active',
        mobile: '',
        address: ''
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
      updatedPatients = updatedPatients.map(p => 
        p.id === editingPatientId ? { ...p, ...formData } : p
      );
      triggerToast('Patient details updated');
    } else {
      const newPatient = {
        id: generateId('p'),
        ...formData,
        createdAt: new Date().toISOString()
      };
      updatedPatients.unshift(newPatient);
      triggerToast('New patient registered');
    }

    const newDb = { ...db, patients: updatedPatients };
    setPatients(updatedPatients);
    saveLocalDB(newDb);
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

  // Open Log Session Modal for Patient
  const handleOpenSessionModal = (patient) => {
    setSessionModalPatient(patient);
    setSessionForm({
      date: new Date().toISOString().slice(0, 10),
      type: 'Direct',
      treatment: '',
      progressNotes: '',
      status: 'Unbilled'
    });
  };

  // Save Session Progression
  const handleSaveSession = (e) => {
    e.preventDefault();
    if (!sessionModalPatient || !sessionForm.treatment) return;

    const db = getLocalDB();
    const newSession = {
      id: generateId('s'),
      patientId: sessionModalPatient.id,
      date: sessionForm.date,
      type: sessionForm.type,
      treatment: sessionForm.treatment,
      progressNotes: sessionForm.progressNotes,
      status: sessionForm.status,
      createdAt: new Date().toISOString()
    };

    const updatedSessions = [newSession, ...(db.sessions || [])];
    const newDb = { ...db, sessions: updatedSessions };
    setSessions(updatedSessions);
    saveLocalDB(newDb);
    setSessionModalPatient(null);
    triggerToast(`Session logged for ${sessionModalPatient.name}`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('local-db-updated'));
    }
  };

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, genderFilter]);

  // Filter & Pagination Logic
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
    a.href = url;
    a.download = `patients_directory_${new Date().toISOString().slice(0, 10)}.csv`;
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

      {/* Header & Main Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Patient Directory & Rehab Logs
          </h1>
          <p className="text-xs text-slate-500">Manage patient records, log treatment sessions & track rehabilitation progress</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Export CSV
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Patient
          </button>
        </div>
      </div>

      {/* Filter Tabs & Quick Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        
        {/* Search Input & Mobile Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by patient name, case no, condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex gap-2 sm:hidden">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
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
              ALL <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'All' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>{patients.length}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'Active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ACTIVE <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'Active' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'}`}>{patients.filter(p => p.status === 'Active').length}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Completed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'Completed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              COMPLETED <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'Completed' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'}`}>{patients.filter(p => p.status === 'Completed').length}</span>
            </button>
          </div>

          <div className="hidden sm:flex gap-2">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="All">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
        </div>

        {/* Results Info Counter Bar */}
        <div className="text-[11px] text-slate-400 font-medium pt-1">
          Showing <span className="font-bold text-slate-700">{filteredPatients.length}</span> of <span className="font-bold text-slate-700">{patients.length}</span> patients
        </div>

      </div>

      {/* Patients Data Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No patient records match your search query.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Case No</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Age/Sex</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Sessions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedPatients.map((p) => {
                    const patientSessionsCount = sessions.filter(s => s.patientId === p.id).length;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.caseNo}</td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/dashboard/patients/${p.id}`}
                            className="font-bold text-blue-700 hover:underline text-left block"
                          >
                            {p.name}
                          </Link>
                          <div className="text-[10px] text-slate-400">{p.mobile}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{p.age} / {p.gender}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{p.condition}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-[11px]">
                            {patientSessionsCount} {patientSessionsCount === 1 ? 'session' : 'sessions'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenSessionModal(p)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold"
                            title="Log Session Progression"
                          >
                            <CalendarCheck className="w-3.5 h-3.5 inline" /> + Log Session
                          </button>
                          <Link
                            href={`/dashboard/patients/${p.id}`}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold inline-flex items-center gap-1"
                            title="View Patient Progression Page"
                          >
                            <FileText className="w-3.5 h-3.5" /> Progression
                          </Link>
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold"
                            title="Edit Patient"
                          >
                            <Edit3 className="w-3.5 h-3.5 inline" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeletePatient(p.id)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-semibold"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100 bg-slate-50/50 p-2 space-y-3">
              {paginatedPatients.map((p) => {
                const patientSessionsCount = sessions.filter(s => s.patientId === p.id).length;
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 transition active:scale-[0.99]">
                    
                    {/* Top Subtitle Row: Date & Location */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pb-1 border-b border-slate-100">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {p.startDate || new Date().toISOString().slice(0, 10)}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
                        {patientSessionsCount} Sessions
                      </span>
                    </div>

                    {/* Main Title Row: Ref Code + Patient Name + Status Pill + Chevron */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-0.5">
                          {p.caseNo}
                        </span>
                        <Link 
                          href={`/dashboard/patients/${p.id}`}
                          className="text-sm font-extrabold text-slate-900 leading-snug hover:text-blue-600 transition cursor-pointer block"
                        >
                          {p.name}
                        </Link>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          p.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {p.status}
                        </span>
                        <Link 
                          href={`/dashboard/patients/${p.id}`}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>

                    {/* Key-Value Details Grid */}
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 font-medium">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Condition</span>
                        <span className="text-slate-800 font-bold text-right">{p.condition}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Age / Sex</span>
                        <span className="text-slate-700 font-semibold">{p.age} Yrs / {p.gender}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Contact</span>
                        <span className="text-slate-800 font-mono font-semibold">{p.mobile || '-'}</span>
                      </div>
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleOpenSessionModal(p)}
                        className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1 shadow-xs"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" /> Log Session
                      </button>
                      <Link
                        href={`/dashboard/patients/${p.id}`}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" /> Progression Page
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pagination Controls Bar */}
            {filteredPatients.length > 0 && (
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
                    Showing <strong className="text-slate-800">{Math.min((currentPage - 1) * pageSize + 1, filteredPatients.length)}</strong>–<strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredPatients.length)}</strong> of <strong className="text-slate-800">{filteredPatients.length}</strong> patients
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

      {/* Patient Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingPatientId ? 'Edit Patient Details' : 'Register New Patient'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Case No</label>
                  <input
                    type="text"
                    value={formData.caseNo}
                    onChange={(e) => setFormData({ ...formData, caseNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="45"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condition / Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Lumbar Spondylosis, Frozen Shoulder"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical & Treatment History</label>
                <textarea
                  rows="3"
                  placeholder="Clinical history, onset, past surgeries, medical notes..."
                  value={formData.history}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referred By</label>
                  <input
                    type="text"
                    placeholder="Doctor name or Direct Walk-in"
                    value={formData.referredBy}
                    onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="+91 98230 11223"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="City / Area address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl shadow-xs"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Session & Rehab Progression Modal */}
      {sessionModalPatient && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Log Rehab Session</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Patient: <span className="font-bold text-indigo-900">{sessionModalPatient.name}</span> ({sessionModalPatient.caseNo})</p>
                </div>
              </div>
              <button 
                onClick={() => setSessionModalPatient(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Date *</label>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treatment & Modalities Given *</label>
                <input
                  type="text"
                  placeholder="e.g. IFT 20 mins + Ultrasound therapy + Core exercises"
                  value={sessionForm.treatment}
                  onChange={(e) => setSessionForm({ ...sessionForm, treatment: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rehabilitation Progress & Clinical Notes</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Pain decreased to VAS 4/10. Knee flexion improved by 15 degrees. Patient comfortable with quad sets..."
                  value={sessionForm.progressNotes}
                  onChange={(e) => setSessionForm({ ...sessionForm, progressNotes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSessionModalPatient(null)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow-xs"
                >
                  Save Progression Log
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
