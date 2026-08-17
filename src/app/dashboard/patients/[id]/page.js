"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLocalDB, saveLocalDB, generateId } from '@/lib/db';
import { SkeletonPatientDetail } from '@/components/SkeletonLoader';
import { 
  ArrowLeft, User, Calendar, Phone, MapPin, Activity, FileText, 
  CalendarCheck, TrendingUp, Plus, PlusCircle, Edit3, Trash2, 
  CheckCircle2, Receipt, X, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id;

  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  const [patientForm, setPatientForm] = useState({
    caseNo: '', name: '', age: '', gender: 'M', condition: '', history: '',
    referredBy: '', startDate: '', status: 'Active', mobile: '', address: ''
  });

  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().slice(0, 10), type: 'Direct',
    treatment: '', progressNotes: '', status: 'Unbilled'
  });

  useEffect(() => {
    const loadData = () => {
      const db = getLocalDB();
      const p = (db.patients || []).find(x => x.id === patientId);
      if (p) {
        setPatient(p);
        setPatientForm({
          caseNo: p.caseNo || '', name: p.name || '', age: p.age || '',
          gender: p.gender || 'M', condition: p.condition || '', history: p.history || '',
          referredBy: p.referredBy || '', startDate: p.startDate || new Date().toISOString().slice(0, 10),
          status: p.status || 'Active', mobile: p.mobile || '', address: p.address || ''
        });
      }
      setSessions((db.sessions || []).filter(s => s.patientId === patientId));
    };
    loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('local-db-updated', loadData);
      return () => window.removeEventListener('local-db-updated', loadData);
    }
  }, [patientId]);

  const triggerToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    if (!patientForm.name) return;
    const db = getLocalDB();
    const updatedPatients = (db.patients || []).map(p => p.id === patientId ? { ...p, ...patientForm } : p);
    saveLocalDB({ ...db, patients: updatedPatients });
    setPatient({ ...patient, ...patientForm });
    setEditModalOpen(false);
    triggerToast('Patient details updated successfully');
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('local-db-updated'));
  };

  const handleSaveSession = (e, shouldCreateBill = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!sessionForm.treatment) return;
    const db = getLocalDB();
    const newSession = {
      id: generateId('s'), patientId, date: sessionForm.date,
      treatment: sessionForm.treatment, progressNotes: sessionForm.progressNotes,
      status: 'Unbilled', createdAt: new Date().toISOString()
    };
    const updatedSessions = [newSession, ...(db.sessions || [])];
    saveLocalDB({ ...db, sessions: updatedSessions });
    setSessions(updatedSessions.filter(s => s.patientId === patientId));
    setSessionModalOpen(false);
    triggerToast('Rehabilitation session logged');
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('local-db-updated'));
    if (shouldCreateBill) router.push(`/dashboard/receipts/create?patientId=${patientId}&treatment=${encodeURIComponent(sessionForm.treatment)}`);
    setSessionForm({ date: new Date().toISOString().slice(0, 10), treatment: '', progressNotes: '', status: 'Unbilled' });
  };

  const handleDeleteSession = (sessionId) => {
    if (!confirm('Delete this session log?')) return;
    const db = getLocalDB();
    const updated = (db.sessions || []).filter(s => s.id !== sessionId);
    saveLocalDB({ ...db, sessions: updated });
    setSessions(updated.filter(s => s.patientId === patientId));
    triggerToast('Session log deleted');
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('local-db-updated'));
  };

  // Skeleton loading state
  if (!patient) {
    return (
      <div className="space-y-6">
        <SkeletonPatientDetail />
        <div className="text-center pt-4">
          <Link href="/dashboard/patients" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Patient Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-foreground text-primary-light border border-foreground/80 rounded-lg shadow-md text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: Patient Info */}
        <div className="lg:col-span-4 bg-surface p-5 rounded-lg border border-border space-y-4 text-xs">
          
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" /> Patient Overview
            </h3>
            <button onClick={() => setEditModalOpen(true)} className="text-primary font-medium hover:underline text-xs">Edit</button>
          </div>

          <div className="space-y-3 text-foreground/70">
            <div>
              <span className="text-[10px] uppercase font-medium text-foreground/35 block">Condition / Diagnosis</span>
              <p className="font-semibold text-foreground text-sm mt-0.5 font-serif">{patient.condition}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div>
                <span className="text-[10px] uppercase font-medium text-foreground/35 block">Age & Gender</span>
                <p className="font-medium text-foreground">{patient.age} Yrs / {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium text-foreground/35 block">Referred By</span>
                <p className="font-medium text-foreground truncate">{patient.referredBy || 'Direct'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-[10px] uppercase font-medium text-foreground/35 block">Mobile</span>
              <p className="font-mono font-medium text-foreground">{patient.mobile || '-'}</p>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-[10px] uppercase font-medium text-foreground/35 block">Address</span>
              <p className="font-medium text-foreground/70">{patient.address || '-'}</p>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-[10px] uppercase font-medium text-foreground/35 block">Clinical History</span>
              <p className="text-foreground/60 leading-relaxed bg-background p-3 rounded-md border border-border mt-1">
                {patient.history || 'No medical history details logged.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Rehabilitation Timeline */}
        <div className="lg:col-span-8 bg-surface p-5 rounded-lg border border-border space-y-4">
          
          <div className="flex items-center justify-between border-b border-border pb-3 gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                <span>Rehabilitation Progression</span>
              </h3>
              <p className="text-[11px] text-foreground/40">Daily sessions, modalities & recovery notes</p>
            </div>
            <button onClick={() => setSessionModalOpen(true)}
              className="px-3 py-1.5 bg-primary hover:opacity-90 text-white text-xs font-medium rounded-md flex items-center gap-1 transition shrink-0">
              <PlusCircle className="w-3.5 h-3.5" /> Log Session
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-12 text-center bg-background rounded-lg border border-dashed border-border space-y-3">
              <Activity className="w-8 h-8 text-primary/30 mx-auto" />
              <p className="text-foreground/40 text-xs font-medium">No sessions logged for {patient.name} yet.</p>
              <button onClick={() => setSessionModalOpen(true)} className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-md">
                Log First Session
              </button>
            </div>
          ) : (
            <>
              {(() => {
                const totalPages = Math.ceil(sessions.length / pageSize) || 1;
                const startIndex = (currentPage - 1) * pageSize;
                const paginatedSessions = sessions.slice(startIndex, startIndex + pageSize);
                
                return (
                  <div className="space-y-3">
                    {paginatedSessions.map((s) => (
                      <div key={s.id} className="p-4 bg-surface border border-border rounded-lg space-y-2.5 hover:border-primary/20 transition">
                        
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <span className="font-mono font-medium text-foreground text-xs">{s.date}</span>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/receipts/create?patientId=${patient.id}&treatment=${encodeURIComponent(s.treatment || '')}`}
                              className="px-2.5 py-1 bg-primary hover:opacity-90 text-white rounded-md text-[10px] font-medium flex items-center gap-1 transition"
                            >
                              <Receipt className="w-3 h-3" /> Create Bill
                            </Link>
                            <button onClick={() => handleDeleteSession(s.id)} className="text-foreground/25 hover:text-red-500 p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-medium text-foreground/35">Treatment & Modalities</span>
                          <p className="font-medium text-foreground text-xs mt-0.5">{s.treatment}</p>
                        </div>

                        {s.progressNotes && (
                          <div className="bg-primary/5 p-3 rounded-md border border-primary/10 text-xs space-y-1">
                            <span className="font-semibold text-foreground block text-[11px]">Rehabilitation Notes</span>
                            <p className="text-foreground/60 leading-relaxed italic">{s.progressNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs bg-background p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-foreground/40 font-medium">
                        <span>Per page:</span>
                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                          className="px-2 py-1 bg-surface border border-border rounded-md text-foreground font-medium focus:outline-none">
                          <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                        </select>
                        <span className="text-[11px]">
                          Showing <strong className="text-foreground">{startIndex + 1}</strong>–<strong className="text-foreground">{Math.min(startIndex + pageSize, sessions.length)}</strong> of <strong className="text-foreground">{sessions.length}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className="px-2.5 py-1 bg-surface border border-border rounded-md text-foreground/70 font-medium disabled:opacity-40 hover:bg-foreground/5 transition flex items-center gap-1 text-[11px]">
                          <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </button>
                        <span className="px-3 py-1 font-medium text-foreground bg-surface border border-border rounded-md text-[11px]">Page {currentPage} of {totalPages}</span>
                        <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className="px-2.5 py-1 bg-surface border border-border rounded-md text-foreground/70 font-medium disabled:opacity-40 hover:bg-foreground/5 transition flex items-center gap-1 text-[11px]">
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
        <div className="fixed inset-0 z-[60] bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Log Rehab Session</h3>
                  <p className="text-[11px] text-foreground/50">Patient: <span className="font-semibold text-foreground">{patient.name}</span> ({patient.caseNo})</p>
                </div>
              </div>
              <button onClick={() => setSessionModalOpen(false)} className="p-1 rounded-md text-foreground/30 hover:text-foreground hover:bg-foreground/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-foreground/60 mb-1">Session Date *</label>
                <input type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" required />
              </div>
              <div>
                <label className="block font-medium text-foreground/60 mb-1">Treatment & Modalities *</label>
                <input type="text" placeholder="e.g. IFT 20 mins + Ultrasound + Core exercises" value={sessionForm.treatment}
                  onChange={(e) => setSessionForm({ ...sessionForm, treatment: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground font-medium focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block font-medium text-foreground/60 mb-1">Rehabilitation Notes</label>
                <textarea rows="3" placeholder="e.g. Pain decreased to VAS 4/10. Knee flexion improved by 15 degrees..."
                  value={sessionForm.progressNotes} onChange={(e) => setSessionForm({ ...sessionForm, progressNotes: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button type="button" onClick={() => setSessionModalOpen(false)} className="sm:w-1/3 py-2.5 bg-muted hover:bg-muted/80 font-medium text-foreground/70 rounded-md">Cancel</button>
                <button type="submit" onClick={(e) => handleSaveSession(e, false)} className="sm:w-1/3 py-2.5 bg-primary hover:opacity-90 font-medium text-white rounded-md">Save Log</button>
                <button type="button" onClick={(e) => handleSaveSession(e, true)} className="sm:w-1/3 py-2.5 bg-accent hover:opacity-90 font-medium text-foreground rounded-md flex items-center justify-center gap-1">
                  <Receipt className="w-4 h-4" /> Save & Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Edit Patient Details</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-foreground/30 hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdatePatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-medium text-foreground/60 mb-1">Case No</label><input type="text" value={patientForm.caseNo} onChange={(e) => setPatientForm({ ...patientForm, caseNo: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md font-mono text-foreground" required /></div>
                <div><label className="block font-medium text-foreground/60 mb-1">Patient Name</label><input type="text" value={patientForm.name} onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md font-medium text-foreground" required /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block font-medium text-foreground/60 mb-1">Age</label><input type="number" value={patientForm.age} onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
                <div><label className="block font-medium text-foreground/60 mb-1">Gender</label><select value={patientForm.gender} onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select></div>
                <div><label className="block font-medium text-foreground/60 mb-1">Status</label><select value={patientForm.status} onChange={(e) => setPatientForm({ ...patientForm, status: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"><option value="Active">Active</option><option value="Completed">Completed</option></select></div>
              </div>
              <div><label className="block font-medium text-foreground/60 mb-1">Condition</label><input type="text" value={patientForm.condition} onChange={(e) => setPatientForm({ ...patientForm, condition: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" required /></div>
              <div><label className="block font-medium text-foreground/60 mb-1">Medical History</label><textarea rows="3" value={patientForm.history} onChange={(e) => setPatientForm({ ...patientForm, history: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-medium text-foreground/60 mb-1">Referred By</label><input type="text" value={patientForm.referredBy} onChange={(e) => setPatientForm({ ...patientForm, referredBy: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
                <div><label className="block font-medium text-foreground/60 mb-1">Mobile</label><input type="text" value={patientForm.mobile} onChange={(e) => setPatientForm({ ...patientForm, mobile: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
              </div>
              <div><label className="block font-medium text-foreground/60 mb-1">Address</label><input type="text" value={patientForm.address} onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })} className="w-full p-2.5 bg-background border border-border rounded-md text-foreground" /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditModalOpen(false)} className="w-1/2 py-2.5 bg-muted hover:bg-muted/80 font-medium text-foreground/70 rounded-md">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 bg-primary hover:opacity-90 font-medium text-white rounded-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
