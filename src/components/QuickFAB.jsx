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
        <div className="fixed top-5 right-5 z-[70] px-4 py-3 bg-foreground text-primary-light border border-foreground/80 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary-light" />
          {toast}
        </div>
      )}

      {/* Speed Dial Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/30 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB & Menu — pointer-events-none on wrapper to never block background taps */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Speed Dial Actions */}
        <div className={`flex flex-col items-end gap-2.5 transition-all duration-200 ${
          isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          
          {/* Action: Add Patient */}
          <div className="flex items-center gap-2.5">
            <span className="bg-foreground text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-sm whitespace-nowrap">
              Add Patient
            </span>
            <button
              onClick={handleOpenPatientModal}
              className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition pointer-events-auto"
              title="Add New Patient"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Action: Add Receipt */}
          <div className="flex items-center gap-2.5">
            <span className="bg-foreground text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-sm whitespace-nowrap">
              Add Receipt
            </span>
            <button
              onClick={handleAddReceipt}
              className="w-11 h-11 rounded-full bg-accent text-foreground flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition pointer-events-auto"
              title="Create New Receipt"
            >
              <Receipt className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Main FAB — flat teal, pointer-events-auto */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-200 focus:outline-none pointer-events-auto ${
            isOpen 
              ? 'bg-foreground rotate-45' 
              : 'bg-primary hover:opacity-90 active:scale-95'
          }`}
          aria-label="Quick Actions Menu"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

      </div>

      {/* Quick Add Patient Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-border">
            
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Register New Patient</h3>
                  <p className="text-[11px] text-foreground/50">Quick patient entry from anywhere</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-1 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleSavePatient(e, false)} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground/70 mb-1">Case No</label>
                  <input
                    type="text"
                    value={formData.caseNo}
                    onChange={(e) => setFormData({ ...formData, caseNo: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md font-mono text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground/70 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md font-medium text-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground/70 mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="45"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground/70 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground/70 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground/70 mb-1">Condition / Diagnosis *</label>
                <input
                  type="text"
                  placeholder="e.g. Lumbar Spondylosis, Frozen Shoulder"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground font-medium focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-foreground/70 mb-1">Medical History</label>
                <textarea
                  rows="2"
                  placeholder="Brief medical notes or clinical history..."
                  value={formData.history}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground/70 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="+91 98230 11223"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground/70 mb-1">Referred By</label>
                  <input
                    type="text"
                    placeholder="Doctor or Direct"
                    value={formData.referredBy}
                    onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground/70 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="City / Area address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-foreground"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full sm:w-1/3 py-2.5 bg-muted hover:bg-muted/80 font-medium text-foreground/70 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-1/3 py-2.5 bg-primary hover:opacity-90 font-medium text-white rounded-md transition"
                >
                  Save Patient
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSavePatient(e, true)}
                  className="w-full sm:w-1/3 py-2.5 bg-accent hover:opacity-90 font-medium text-foreground rounded-md transition flex items-center justify-center gap-1"
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
