"use client";

import React, { useState, useEffect } from 'react';
import { getLocalDB, saveLocalDB, generateId, numberToWords } from '@/lib/db';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Printer, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Plus,
  Trash2
} from 'lucide-react';

export default function CreateReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get('patientId');
  const initialTreatment = searchParams.get('treatment');

  const [patients, setPatients] = useState([]);
  const [toast, setToast] = useState(null);

  // Service Description & Amount items
  const [serviceItems, setServiceItems] = useState([
    { service: "Physiotherapy Treatment & Rehabilitation", amount: "500" }
  ]);

  // Form State
  const [form, setForm] = useState({
    billNo: `RCPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
    date: new Date().toISOString().slice(0, 10),
    docName: "Dr. Shantanu Waidande",
    docQual: "BPTh, MPTh (Musculoskeletal)",
    docReg: "PT-2024/8912",
    patientId: "",
    patName: "",
    age: "",
    sex: "Male",
    mobile: "",
    address: "",
    mode: "Online",
    transId: "UPI/Direct",
    customText: "Received with thanks towards physiotherapy treatment charges."
  });

  useEffect(() => {
    const db = getLocalDB();
    const allPatients = db.patients || [];
    setPatients(allPatients);

    let docDetails = {};
    if (db.therapists && db.therapists.length > 0) {
      const t = db.therapists[0];
      docDetails = {
        docName: t.name || form.docName,
        docQual: t.qualification || form.docQual,
        docReg: t.regNo || form.docReg
      };
    }

    if (initialTreatment) {
      setServiceItems([{ service: initialTreatment, amount: "500" }]);
    }

    if (initialPatientId) {
      const selectedP = allPatients.find(p => p.id === initialPatientId);
      if (selectedP) {
        setForm(prev => ({
          ...prev,
          ...docDetails,
          patientId: selectedP.id,
          patName: selectedP.name,
          age: selectedP.age ? String(selectedP.age) : "",
          sex: selectedP.gender === 'F' ? 'Female' : selectedP.gender === 'O' ? 'Other' : 'Male',
          mobile: selectedP.mobile || "",
          address: selectedP.address || ""
        }));
        return;
      }
    }

    if (Object.keys(docDetails).length > 0) {
      setForm(prev => ({ ...prev, ...docDetails }));
    }
  }, [initialPatientId, initialTreatment]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePatientSelect = (e) => {
    const pId = e.target.value;
    const p = patients.find(x => x.id === pId);
    if (p) {
      setForm(prev => ({
        ...prev,
        patientId: p.id,
        patName: p.name,
        age: p.age ? String(p.age) : "",
        sex: p.gender === 'F' ? 'Female' : p.gender === 'O' ? 'Other' : 'Male',
        mobile: p.mobile || "",
        address: p.address || ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        patientId: "",
        patName: "",
        age: "",
        sex: "Male",
        mobile: "",
        address: ""
      }));
    }
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...serviceItems];
    updated[index][field] = value;
    setServiceItems(updated);
  };

  const handleAddService = () => {
    setServiceItems([...serviceItems, { service: "", amount: "0" }]);
  };

  const handleRemoveService = (index) => {
    if (serviceItems.length === 1) return;
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const totalAmountNum = serviceItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const wordsAmount = numberToWords(totalAmountNum);

  const handleSaveReceipt = () => {
    if (!form.patName) {
      triggerToast('Please enter patient name');
      return;
    }

    const db = getLocalDB();
    const newReceipt = {
      id: generateId('r'),
      billNo: form.billNo,
      date: form.date,
      patientId: form.patientId || null,
      patientName: form.patName,
      age: form.age,
      sex: form.sex,
      mobile: form.mobile,
      therapistName: form.docName,
      therapistQual: form.docQual,
      therapistReg: form.docReg,
      services: serviceItems,
      amount: totalAmountNum,
      paymentMode: form.mode,
      transactionId: form.transId,
      note: form.customText,
      createdAt: new Date().toISOString()
    };

    const updated = [newReceipt, ...(db.receipts || [])];
    saveLocalDB({ ...db, receipts: updated });
    triggerToast('Receipt saved to records');
  };

  const handlePrint = () => {
    handleSaveReceipt();
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-foreground text-primary-light border border-foreground/80 rounded-lg shadow-md text-xs font-medium flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-surface hover:bg-foreground/5 border border-border text-foreground/70 rounded-md transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2 font-serif">
              <FileText className="w-5 h-5 text-primary" /> Create Patient Receipt
            </h1>
            <p className="text-xs text-foreground/50">Printable A5 layout for clinical documentation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveReceipt}
            className="px-4 py-2 bg-surface hover:bg-foreground/5 border border-border text-foreground text-xs font-medium rounded-md flex items-center gap-1.5 transition"
          >
            <Save className="w-4 h-4 text-primary" /> Save Receipt
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary hover:opacity-90 text-white text-xs font-medium rounded-md flex items-center gap-1.5 shadow-sm transition active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" /> Print A5 Receipt
          </button>
        </div>
      </div>

      {/* Main Grid: Form Inputs (Left) vs Live A5 Paper (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Input Form Controls */}
        <div className="lg:col-span-5 bg-surface p-5 rounded-lg border border-border space-y-4 text-xs print:hidden">
          
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              Receipt Parameters
            </h2>
            <span className="text-[11px] font-mono text-primary font-medium">{form.billNo}</span>
          </div>

          {/* Quick Select Registered Patient */}
          <div>
            <label className="block font-medium text-foreground/70 mb-1">Select Registered Patient</label>
            <select
              value={form.patientId}
              onChange={handlePatientSelect}
              className="w-full p-2 bg-background border border-border rounded-md text-foreground font-medium focus:outline-none focus:border-primary"
            >
              <option value="">-- Manual Entry / Pick from Register --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.caseNo || 'No Case'}) - {p.condition}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground/70 mb-1">Receipt / Bill No</label>
              <input
                type="text"
                value={form.billNo}
                onChange={(e) => setForm({ ...form, billNo: e.target.value })}
                className="w-full p-2 bg-background border border-border rounded-md font-mono text-foreground"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground/70 mb-1">Billing Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-2 bg-background border border-border rounded-md text-foreground"
              />
            </div>
          </div>

          {/* Patient Info Fields */}
          <div className="space-y-3 pt-2 border-t border-border">
            <p className="font-medium text-foreground/50 uppercase tracking-wider text-[10px]">Patient Details</p>
            
            <div>
              <label className="block font-medium text-foreground/70 mb-1">Patient Name *</label>
              <input
                type="text"
                value={form.patName}
                onChange={(e) => setForm({ ...form, patName: e.target.value })}
                placeholder="Full Patient Name"
                className="w-full p-2 bg-background border border-border rounded-md font-medium text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-medium text-foreground/70 mb-1">Age</label>
                <input
                  type="text"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="34"
                  className="w-full p-2 bg-background border border-border rounded-md text-foreground"
                />
              </div>
              <div>
                <label className="block font-medium text-foreground/70 mb-1">Gender</label>
                <select
                  value={form.sex}
                  onChange={(e) => setForm({ ...form, sex: e.target.value })}
                  className="w-full p-2 bg-background border border-border rounded-md text-foreground"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-foreground/70 mb-1">Mobile</label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="98230..."
                  className="w-full p-2 bg-background border border-border rounded-md text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Service Items Section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground/50 uppercase tracking-wider text-[10px]">Service Items</p>
              <button
                type="button"
                onClick={handleAddService}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Service Row
              </button>
            </div>

            <div className="space-y-2">
              {serviceItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Treatment Description"
                    value={item.service}
                    onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                    className="flex-1 p-2 bg-background border border-border rounded-md text-xs text-foreground font-medium"
                  />
                  <div className="w-24 relative">
                    <span className="absolute left-2 top-2 text-foreground/40 font-mono">₹</span>
                    <input
                      type="number"
                      placeholder="500"
                      value={item.amount}
                      onChange={(e) => handleServiceChange(index, 'amount', e.target.value)}
                      className="w-full pl-5 pr-2 py-2 bg-background border border-border rounded-md text-xs font-semibold text-foreground"
                    />
                  </div>
                  {serviceItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveService(index)}
                      className="p-1.5 text-foreground/30 hover:text-red-500 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Mode */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block font-medium text-foreground/70 mb-1">Total Bill Amount</label>
              <input
                type="text"
                value={`₹ ${totalAmountNum}`}
                readOnly
                className="w-full p-2 bg-primary/8 border border-primary/20 rounded-md font-semibold text-primary text-base"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground/70 mb-1">Payment Mode</label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="w-full p-2 bg-background border border-border rounded-md text-foreground font-medium"
              >
                <option value="Online">Online / GPay</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">Transaction Ref / Note</label>
            <input
              type="text"
              value={form.transId}
              onChange={(e) => setForm({ ...form, transId: e.target.value })}
              className="w-full p-2 bg-background border border-border rounded-md font-mono text-foreground"
            />
          </div>

        </div>

        {/* Right: Live A5 Printable Paper Preview — Responsive Scroll Container */}
        <div className="lg:col-span-7 overflow-x-auto w-full flex justify-center bg-muted/40 p-3 sm:p-6 rounded-lg border border-border print:p-0 print:bg-white print:border-none print:shadow-none">
          
          <div className="w-full max-w-[210mm] min-h-[148mm] bg-white p-6 sm:p-8 text-black shadow-sm rounded-sm font-sans flex flex-col justify-between border border-border print:shadow-none print:border-none print:w-full print:h-auto">
            
            {/* Receipt Header */}
            <div>
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900 font-serif">{form.docName || 'Dr. Name'}</h2>
                  <p className="text-xs font-medium text-neutral-700">{form.docQual || 'Qualification'}</p>
                  <p className="text-[10px] text-neutral-500 italic">Reg. No: {form.docReg || 'PT-XXXX'}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold tracking-widest text-neutral-900 uppercase">RECEIPT</span>
                  <p className="text-xs font-mono font-medium mt-1 text-neutral-800">No: {form.billNo}</p>
                  <p className="text-xs text-neutral-600 font-mono">Date: {form.date}</p>
                </div>
              </div>

              {/* Patient Details Row */}
              <div className="grid grid-cols-2 gap-4 my-4 py-2 bg-neutral-50 px-3 border border-neutral-200 text-xs">
                <div>
                  <p><span className="font-semibold text-neutral-600">Patient Name:</span> <span className="font-bold text-neutral-900 uppercase">{form.patName || 'Patient Name'}</span></p>
                  <p><span className="font-semibold text-neutral-600">Mobile:</span> {form.mobile || '-'}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-semibold text-neutral-600">Age / Sex:</span> {form.age || '-'} / {form.sex}</p>
                  <p><span className="font-semibold text-neutral-600">Mode:</span> <span className="font-medium">{form.mode}</span></p>
                </div>
              </div>

              {/* Services Itemized Table */}
              <table className="w-full text-xs border-collapse my-4">
                <thead>
                  <tr className="border-b-2 border-black text-neutral-800 font-bold uppercase text-[11px]">
                    <th className="text-left py-1">Particulars / Treatment Service</th>
                    <th className="text-right py-1 w-28">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {serviceItems.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="py-4 text-center text-neutral-400 italic">No treatment services entered</td>
                    </tr>
                  ) : (
                    serviceItems.map((srv, i) => (
                      <tr key={i}>
                        <td className="py-2 font-medium text-neutral-800">{srv.service || 'Physiotherapy Session'}</td>
                        <td className="py-2 text-right font-mono font-semibold text-neutral-900">₹{srv.amount || '0'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Receipt Footer */}
            <div className="pt-4 border-t border-neutral-300 mt-auto">
              <div className="flex justify-between items-end">
                <div>
                  <div className="border-2 border-black px-3 py-1 inline-block font-semibold text-sm font-mono">
                    Total: ₹{totalAmountNum}
                  </div>
                  <p className="text-[11px] font-medium text-neutral-700 mt-1 italic">
                    Amount in words: <span className="font-semibold text-neutral-900">{wordsAmount}</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">{form.customText}</p>
                </div>

                <div className="text-right">
                  <div className="w-44 border-b border-black mb-1 h-12"></div>
                  <p className="text-[10px] font-bold uppercase text-neutral-800">Authorized Signature</p>
                  <p className="text-[9px] text-neutral-500">For {form.docName}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
