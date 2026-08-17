"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLocalDB, saveLocalDB, generateId } from '@/lib/db';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Activity, 
  FileText, 
  CalendarCheck, 
  TrendingUp, 
  Plus, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Receipt,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id;

  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [toast, setToast] = useState(null);

  // Pagination State for Session Timeline
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals & Form state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  // Edit Patient Form State
  const [patientForm, setPatientForm] = useState({
    caseNo: '',
    name: '',
    age: '',
    gender: 'M',
    condition: '',
    history: '',
    referredBy: '',
    startDate: '',
    status: 'Active',
    mobile: '',
    address: ''
  });

  // Log Session Form State
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'Direct',
    treatment: '',
    progressNotes: '',
    status: 'Unbilled'
  });

  useEffect(() => {
    const loadData = () => {
      const db = getLocalDB();
      const p = (db.patients || []).find(x => x.id === patientId);
      if (p) {
        setPatient(p);
        setPatientForm({
          caseNo: p.caseNo || '',
          name: p.name || '',
          age: p.age || '',
          gender: p.gender || 'M',
          condition: p.condition || '',
          history: p.history || '',
          referredBy: p.referredBy || '',
          startDate: p.startDate || new Date().toISOString().slice(0, 10),
          status: p.status || 'Active',
          mobile: p.mobile || '',
          address: p.address || ''
        });
      }
      const pSessions = (db.sessions || []).filter(s => s.patientId === patientId);
      setSessions(pSessions);
    };

    loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('local-db-updated', loadData);
      return () => window.removeEventListener('local-db-updated', loadData);
    }
  }, [patientId]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    if (!patientForm.name) return;

    const db = getLocalDB();
    const updatedPatients = (db.patients || []).map(p => 
      p.id === patientId ? { ...p, ...patientForm } : p
    );

    saveLocalDB({ ...db, patients: updatedPatients });
    setPatient({ ...patient, ...patientForm });
    setEditModalOpen(false);
    triggerToast('Patient details updated successfully');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('local-db-updated'));
    }
  };

  const handleSaveSession = (e, shouldCreateBill = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!sessionForm.treatment) return;

    const db = getLocalDB();
    const newSession = {
      id: generateId('s'),
      patientId: patientId,
      date: sessionForm.date,
      treatment: sessionForm.treatment,
      progressNotes: sessionForm.progressNotes,
      status: 'Unbilled',
      createdAt: new Date().toISOString()
    };

    const updatedSessions = [newSession, ...(db.sessions || [])];
    saveLocalDB({ ...db, sessions: updatedSessions });
    setSessions(updatedSessions.filter(s => s.patientId === patientId));
    setSessionModalOpen(false);
    triggerToast('Rehabilitation session logged');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('local-db-updated'));
    }

    if (shouldCreateBill) {
      router.push(`/dashboard/receipts/create?patientId=${patientId}&treatment=${encodeURIComponent(sessionForm.treatment)}`);
    }

    setSessionForm({
      date: new Date().toISOString().slice(0, 10),
      treatment: '',
      progressNotes: '',
      status: 'Unbilled'
    });
  };

  const handleDeleteSession = (sessionId) => {
    if (!confirm('Delete this session log?')) return;
    const db = getLocalDB();
    const updated = (db.sessions || []).filter(s => s.id !== sessionId);
    saveLocalDB({ ...db, sessions: updated });
    setSessions(updated.filter(s => s.patientId === patientId));
    triggerToast('Session log deleted');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('local-db-updated'));
    }
  };

  if (!patient) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-slate-500 text-xs font-semibold">Loading patient record...</p>
        <Link 
          href="/dashboard/patients" 
          className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Patient Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-emerald-400 border border-slate-700 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}


      {/* Main Grid: Patient Overview & Rehabilitation Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Patient Clinical Info */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" /> Patient Overview
            </h3>
            <button
              onClick={() => setEditModalOpen(true)}
              className="text-blue-600 font-bold hover:underline"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3 font-medium text-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Condition / Diagnosis</span>
              <p className="font-extrabold text-blue-950 text-sm mt-0.5">{patient.condition}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Age & Gender</span>
                <p className="font-semibold text-slate-800">{patient.age} Yrs / {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Referred By</span>
                <p className="font-semibold text-slate-800 truncate">{patient.referredBy || 'Direct'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile Contact</span>
              <p className="font-mono font-semibold text-slate-800">{patient.mobile || '-'}</p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Address</span>
              <p className="font-medium text-slate-700">{patient.address || '-'}</p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Clinical & Treatment History</span>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                {patient.history || 'No medical history details logged.'}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Rehabilitation Progression Timeline */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Rehabilitation Progression</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Log of daily sessions, modalities & recovery notes
              </p>
            </div>

            <button
              onClick={() => setSessionModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" /> + Log Session
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <Activity className="w-8 h-8 text-indigo-400 mx-auto" />
              <p className="text-slate-600 text-xs font-semibold">No rehabilitation sessions logged for {patient.name} yet.</p>
              <button
                onClick={() => setSessionModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Log First Session
              </button>
            </div>
          ) : (
            <>
              {(() => {
                const totalPages = Math.ceil(sessions.length / pageSize) || 1;
                const startIndex = (currentPage - 1) * pageSize;
                const paginatedSessions = sessions.slice(startIndex, startIndex + pageSize);
                
                return (
                  <div className="space-y-3.5">
                    {paginatedSessions.map((s, idx) => {
                      const absoluteIndex = sessions.length - (startIndex + idx);
                      return (
                        <div key={s.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2.5 relative hover:border-indigo-200 transition">
                          
                          {/* Top Bar of Session Card */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-800 text-xs">{s.date}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/receipts/create?patientId=${patient.id}&treatment=${encodeURIComponent(s.treatment || '')}`}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
                                title="Generate printable receipt for this session"
                              >
                                <Receipt className="w-3 h-3 text-emerald-100" /> + Create Bill
                              </Link>
                              <button
                                onClick={() => handleDeleteSession(s.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Delete Session Log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Treatment & Modalities */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Treatment & Modalities Provided</span>
                            <p className="font-bold text-slate-900 text-xs mt-0.5">{s.treatment}</p>
                          </div>

                          {/* Clinical Progression Notes */}
                          {s.progressNotes && (
                            <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100/80 text-xs space-y-1">
                              <span className="font-extrabold text-indigo-900 block text-[11px]">Rehabilitation Progression Notes</span>
                              <p className="text-slate-700 leading-relaxed italic">{s.progressNotes}</p>
                            </div>
                          )}

                        </div>
                      );
                    })}

                    {/* Timeline Pagination Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs bg-slate-50/60 p-3 rounded-2xl">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span>Per page:</span>
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
                        </select>
                        <span className="ml-1 text-[11px]">
                          Showing <strong className="text-slate-800">{startIndex + 1}</strong>–<strong className="text-slate-800">{Math.min(startIndex + pageSize, sessions.length)}</strong> of <strong className="text-slate-800">{sessions.length}</strong> logs
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center gap-1 text-[11px]"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </button>

                        <span className="px-3 py-1 font-bold text-slate-800 bg-white border border-slate-200 rounded-xl text-[11px]">
                          Page {currentPage} of {totalPages}
                        </span>

                        <button
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center gap-1 text-[11px]"
                        >
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

        </div>

      </div>

      {/* Log Session Modal */}
      {sessionModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Log Rehab Session</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Patient: <span className="font-bold text-indigo-900">{patient.name}</span> ({patient.caseNo})</p>
                </div>
              </div>
              <button 
                onClick={() => setSessionModalOpen(false)}
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

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSessionModalOpen(false)}
                  className="sm:w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => handleSaveSession(e, false)}
                  className="sm:w-1/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow-xs"
                >
                  Save Log
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveSession(e, true)}
                  className="sm:w-1/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded-xl shadow-xs flex items-center justify-center gap-1"
                >
                  <Receipt className="w-4 h-4" /> Save & Bill
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Patient Details</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Case No</label>
                  <input
                    type="text"
                    value={patientForm.caseNo}
                    onChange={(e) => setPatientForm({ ...patientForm, caseNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={patientForm.name}
                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
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
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
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
                    value={patientForm.status}
                    onChange={(e) => setPatientForm({ ...patientForm, status: e.target.value })}
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
                  value={patientForm.condition}
                  onChange={(e) => setPatientForm({ ...patientForm, condition: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical & Treatment History</label>
                <textarea
                  rows="3"
                  value={patientForm.history}
                  onChange={(e) => setPatientForm({ ...patientForm, history: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referred By</label>
                  <input
                    type="text"
                    value={patientForm.referredBy}
                    onChange={(e) => setPatientForm({ ...patientForm, referredBy: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={patientForm.mobile}
                    onChange={(e) => setPatientForm({ ...patientForm, mobile: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={patientForm.address}
                  onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
