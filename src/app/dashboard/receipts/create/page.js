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
  Stethoscope, 
  User, 
  Sparkles,
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

  // Separate inputs for Service Description & Amount (Units dropped per request)
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
      setForm(prev => ({ ...prev, patientId: "" }));
    }
  };

  // Service item array handlers
  const handleAddServiceItem = () => {
    setServiceItems(prev => [...prev, { service: "", amount: "" }]);
  };

  const handleRemoveServiceItem = (index) => {
    setServiceItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateServiceItem = (index, field, value) => {
    setServiceItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  // Total Amount Calculation
  const totalAmountNum = serviceItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const wordsAmount = numberToWords(totalAmountNum);

  const handleSaveReceipt = () => {
    if (!form.patName || totalAmountNum <= 0) {
      triggerToast('Patient name and valid service amount are required');
      return;
    }

    // Format services as string for backwards-compatible DB storage
    const servicesStr = serviceItems
      .filter(item => item.service)
      .map(item => `${item.service} | ${item.amount}`)
      .join('\n');

    const db = getLocalDB();
    const newReceipt = {
      id: generateId('r'),
      billNo: form.billNo,
      date: form.date,
      therapistName: form.docName,
      therapistQual: form.docQual,
      therapistRegNo: form.docReg,
      patientId: form.patientId,
      patientName: form.patName,
      patientAge: form.age,
      patientSex: form.sex,
      patientMobile: form.mobile,
      patientAddress: form.address,
      services: servicesStr,
      amount: totalAmountNum,
      paymentMode: form.mode,
      transactionId: form.transId,
      customText: form.customText,
      createdAt: new Date().toISOString()
    };

    const updatedReceipts = [newReceipt, ...(db.receipts || [])];
    
    // Save to financial income records
    const newIncome = {
      id: generateId('i'),
      patientId: form.patientId,
      date: form.date,
      receiptNo: form.billNo,
      serialNo: form.billNo,
      amount: totalAmountNum,
      mode: form.mode,
      status: 'Completed',
      note: form.customText || 'Receipt payment',
      type: 'Direct',
      createdAt: new Date().toISOString()
    };

    const updatedIncome = [newIncome, ...(db.income || [])];

    saveLocalDB({ ...db, receipts: updatedReceipts, income: updatedIncome });
    triggerToast('Receipt and income record saved successfully!');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('local-db-updated'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-emerald-400 border border-slate-700 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" /> Printable Receipt Builder
            </h1>
            <p className="text-xs text-slate-500">Create itemized A5 clinic receipts with automated words conversion</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveReceipt}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Save className="w-4 h-4" /> Save Receipt
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" /> Print A5 Receipt
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Form Controls (Hidden during print) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs print:hidden">
          
          <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-2">
            1. Receipt Details
          </h2>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Patient (Auto-fill)</label>
            <select
              value={form.patientId}
              onChange={handlePatientSelect}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
            >
              <option value="">-- Manual Entry / Select Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.caseNo})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bill / Receipt No</label>
              <input
                type="text"
                value={form.billNo}
                onChange={(e) => setForm({ ...form, billNo: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-2 pt-2">
            2. Doctor & Patient Information
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Doctor Name</label>
              <input
                type="text"
                value={form.docName}
                onChange={(e) => setForm({ ...form, docName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Qualifications</label>
              <input
                type="text"
                value={form.docQual}
                onChange={(e) => setForm({ ...form, docQual: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Name</label>
              <input
                type="text"
                value={form.patName}
                onChange={(e) => setForm({ ...form, patName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age / Gender</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Age"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
                <select
                  value={form.sex}
                  onChange={(e) => setForm({ ...form, sex: e.target.value })}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-2 pt-2">
            3. Treatment Services & Payment
          </h2>

          {/* Separate Service & Amount Inputs (Units Dropped) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700">Treatment Particulars & Amounts</label>
              <button
                type="button"
                onClick={handleAddServiceItem}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Service
              </button>
            </div>

            {serviceItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Service / Treatment Description"
                  value={item.service}
                  onChange={(e) => handleUpdateServiceItem(idx, 'service', e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 text-xs"
                />
                <div className="relative w-28 shrink-0">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => handleUpdateServiceItem(idx, 'amount', e.target.value)}
                    className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 text-xs"
                  />
                </div>
                {serviceItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveServiceItem(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Calculated Total (₹)</label>
              <input
                type="number"
                value={totalAmountNum}
                readOnly
                className="w-full p-2 bg-emerald-50 border border-emerald-300 rounded-xl font-black text-emerald-800 text-base"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold"
              >
                <option value="Online">Online / GPay</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Note</label>
            <input
              type="text"
              value={form.transId}
              onChange={(e) => setForm({ ...form, transId: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
            />
          </div>

        </div>

        {/* Right: Live A5 Printable Paper Preview */}
        <div className="lg:col-span-7 flex justify-center bg-slate-800 p-4 sm:p-8 rounded-2xl shadow-inner print:p-0 print:bg-white print:shadow-none">
          
          <div className="w-[210mm] min-h-[148mm] bg-white p-8 text-black shadow-2xl rounded-sm font-sans flex flex-col justify-between border border-slate-300 print:shadow-none print:border-none print:w-full print:h-auto">
            
            {/* Receipt Header */}
            <div>
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-blue-900">{form.docName || 'Dr. Name'}</h2>
                  <p className="text-xs font-bold text-slate-700">{form.docQual || 'Qualification'}</p>
                  <p className="text-[10px] text-slate-500 italic">Reg. No: {form.docReg || 'PT-XXXX'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black tracking-widest text-slate-900 uppercase">RECEIPT</span>
                  <p className="text-xs font-mono font-bold mt-1 text-blue-950">No: {form.billNo}</p>
                  <p className="text-xs text-slate-600 font-mono">Date: {form.date}</p>
                </div>
              </div>

              {/* Patient Details Row */}
              <div className="grid grid-cols-2 gap-4 my-4 py-2 bg-slate-50/80 px-3 border border-slate-200 text-xs">
                <div>
                  <p><span className="font-bold text-slate-600">Patient Name:</span> <span className="font-bold text-slate-900 uppercase">{form.patName || 'Patient Name'}</span></p>
                  <p><span className="font-bold text-slate-600">Mobile:</span> {form.mobile || '-'}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-bold text-slate-600">Age / Sex:</span> {form.age || '-'} / {form.sex}</p>
                  <p><span className="font-bold text-slate-600">Mode:</span> <span className="font-semibold">{form.mode}</span></p>
                </div>
              </div>

              {/* Services Itemized Table (Dropped Unit column) */}
              <table className="w-full text-xs border-collapse my-4">
                <thead>
                  <tr className="border-b-2 border-black text-slate-800 font-bold uppercase text-[11px]">
                    <th className="text-left py-1">Particulars / Treatment Service</th>
                    <th className="text-right py-1 w-28">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {serviceItems.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="py-4 text-center text-slate-400 font-italic">No treatment services entered</td>
                    </tr>
                  ) : (
                    serviceItems.map((srv, i) => (
                      <tr key={i}>
                        <td className="py-2 font-medium">{srv.service || 'Physiotherapy Session'}</td>
                        <td className="py-2 text-right font-mono font-bold">₹{srv.amount || '0'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Receipt Footer */}
            <div className="pt-4 border-t border-slate-300 mt-auto">
              <div className="flex justify-between items-end">
                <div>
                  <div className="border-2 border-black px-3 py-1 inline-block font-bold text-sm font-mono">
                    Total: ₹{totalAmountNum}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 mt-1 italic">
                    Amount in words: <span className="font-bold text-slate-900">{wordsAmount}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">{form.customText}</p>
                </div>

                <div className="text-right">
                  <div className="w-44 border-b border-black mb-1 h-12"></div>
                  <p className="text-[10px] font-bold uppercase text-slate-800">Authorized Signature</p>
                  <p className="text-[9px] text-slate-500">For {form.docName}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
