"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalDB, saveLocalDB, generateId } from '@/lib/db';
import { 
  Plus, 
  X, 
  UserPlus, 
  Receipt, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function QuickFAB() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Quick Patient Form State
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

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenPatientModal = () => {
    setIsOpen(false);
    const db = getLocalDB();
    const count = (db.patients || []).length + 1;
    const nextNo = `PC-2024-${String(count).padStart(3, '0')}`;
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
    setModalOpen(true);
  };

  const handleSavePatient = (e, createReceiptAfter = false) => {
    if (e) e.preventDefault();
    if (!formData.name) return;

    const db = getLocalDB();
    const newId = generateId('p');
    const newPatient = {
      id: newId,
      ...formData,
      createdAt: new Date().toISOString()
    };

    const updatedPatients = [newPatient, ...(db.patients || [])];
    saveLocalDB({ ...db, patients: updatedPatients });

    // Notify other components/pages about DB update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('local-db-updated'));
    }

    setModalOpen(false);

    if (createReceiptAfter) {
      router.push(`/dashboard/receipts/create?patientId=${newId}`);
    } else {
      triggerToast(`Patient "${formData.name}" registered successfully!`);
    }
  };

  const handleAddReceipt = () => {
    setIsOpen(false);
    router.push('/dashboard/receipts/create');
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[70] px-4 py-3 bg-slate-900/95 text-emerald-400 border border-slate-700 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Speed Dial Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Button (FAB) & Menu */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Speed Dial Menu Actions */}
        <div className={`flex flex-col items-end gap-2.5 transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' 
            : 'opacity-0 translate-y-6 pointer-events-none scale-90'
        }`}>
          
          {/* Action 1: Add Patient */}
          <div className="flex items-center gap-2.5 group">
            <span className="bg-slate-900/90 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg whitespace-nowrap transition-transform duration-200 group-hover:scale-105 border border-slate-700/50">
              Add Patient
            </span>
            <button
              onClick={handleOpenPatientModal}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20"
              title="Add New Patient"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Action 2: Add Receipt */}
          <div className="flex items-center gap-2.5 group">
            <span className="bg-slate-900/90 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg whitespace-nowrap transition-transform duration-200 group-hover:scale-105 border border-slate-700/50">
              Add Receipt
            </span>
            <button
              onClick={handleAddReceipt}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20"
              title="Create New Receipt"
            >
              <Receipt className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Main Trigger FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full text-white flex items-center justify-center shadow-xl transition-all duration-300 border border-white/30 focus:outline-none ${
            isOpen 
              ? 'bg-slate-800 rotate-45 shadow-slate-900/40 scale-105' 
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-600/40 hover:scale-110 active:scale-95'
          }`}
          aria-label="Quick Actions Menu"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>

      </div>

      {/* Quick Add Patient Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Register New Patient</h3>
                  <p className="text-[11px] text-slate-500">Quick patient entry from anywhere</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleSavePatient(e, false)} className="space-y-3 text-xs">
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
                  <label className="block font-semibold text-slate-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condition / Diagnosis *</label>
                <input
                  type="text"
                  placeholder="e.g. Lumbar Spondylosis, Frozen Shoulder"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical History</label>
                <textarea
                  rows="2"
                  placeholder="Brief medical notes or clinical history..."
                  value={formData.history}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referred By</label>
                  <input
                    type="text"
                    placeholder="Doctor or Direct"
                    value={formData.referredBy}
                    onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
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

              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full sm:w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-1/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-semibold text-white rounded-xl shadow-xs transition"
                >
                  Save Patient
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSavePatient(e, true)}
                  className="w-full sm:w-1/3 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                >
                  Save & Receipt <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
