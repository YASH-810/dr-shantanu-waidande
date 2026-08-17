"use client";

// Client-side Database Helper using Firestore + Local Storage Sync
const STORAGE_KEY = 'physioclinic_db_v1';

const defaultSeedData = {
  patients: [
    {
      id: "p_101",
      caseNo: "PC-2024-001",
      name: "Rajesh Sharma",
      age: 45,
      gender: "M",
      condition: "Lumbar Spondylosis",
      history: "Lower back pain radiating to left leg for 3 months. No previous surgery.",
      referredBy: "Dr. K. Mehta (Ortho)",
      startDate: "2024-08-01",
      status: "Active",
      mobile: "+91 98230 11223",
      address: "Flat 402, Sunshine Apts, Pune",
      createdAt: "2024-08-01T10:00:00.000Z"
    },
    {
      id: "p_102",
      caseNo: "PC-2024-002",
      name: "Ananya Deshmukh",
      age: 32,
      gender: "F",
      condition: "Frozen Shoulder (R)",
      history: "Restricted abduction & external rotation following minor fall 6 weeks ago.",
      referredBy: "Self / Direct Walk-in",
      startDate: "2024-08-05",
      status: "Active",
      mobile: "+91 97654 44321",
      address: "12 Green Avenue, Kothrud, Pune",
      createdAt: "2024-08-05T11:30:00.000Z"
    },
    {
      id: "p_103",
      caseNo: "PC-2024-003",
      name: "Suresh Patil",
      age: 58,
      gender: "M",
      condition: "Post ACL Reconstruction Rehab",
      history: "Right knee ACL reconstruction 4 weeks post-op. Quadriceps lag present.",
      referredBy: "Dr. V. Joshi",
      startDate: "2024-07-15",
      status: "Completed",
      mobile: "+91 99211 55667",
      address: "Bungalow 7, Model Colony, Pune",
      createdAt: "2024-07-15T09:00:00.000Z"
    }
  ],
  sessions: [
    {
      id: "s_201",
      patientId: "p_101",
      date: "2024-08-01",
      type: "Direct",
      treatment: "IFT + Core Stabilization + TENS 20 mins",
      status: "Billed",
      createdAt: "2024-08-01T10:30:00.000Z"
    },
    {
      id: "s_202",
      patientId: "p_101",
      date: "2024-08-03",
      type: "Direct",
      treatment: "Lumbar Traction + McKenzie extensions",
      status: "Billed",
      createdAt: "2024-08-03T10:30:00.000Z"
    },
    {
      id: "s_203",
      patientId: "p_101",
      date: "2024-08-07",
      type: "Direct",
      treatment: "IFT + Dry Needling glutes",
      status: "Unbilled",
      createdAt: "2024-08-07T10:30:00.000Z"
    },
    {
      id: "s_204",
      patientId: "p_102",
      date: "2024-08-05",
      type: "Direct",
      treatment: "Maitland Mobilization Grade II + Shoulder Pulley",
      status: "Billed",
      createdAt: "2024-08-05T12:00:00.000Z"
    },
    {
      id: "s_205",
      patientId: "p_102",
      date: "2024-08-08",
      type: "Direct",
      treatment: "Ultrasound Therapy + Rotator cuff strengthening",
      status: "Unbilled",
      createdAt: "2024-08-08T12:00:00.000Z"
    }
  ],
  income: [
    {
      id: "i_301",
      patientId: "p_101",
      date: "2024-08-03",
      serialNo: "RCPT-20240803-001",
      receiptNo: "RCPT-20240803-001",
      amount: 1200,
      units: "2 Sessions",
      mode: "Online",
      status: "Completed",
      type: "Direct",
      note: "IFT & Lumbar traction initial package",
      sessionIds: ["s_201", "s_202"],
      createdAt: "2024-08-03T11:00:00.000Z"
    },
    {
      id: "i_302",
      patientId: "p_102",
      date: "2024-08-05",
      serialNo: "RCPT-20240805-002",
      receiptNo: "RCPT-20240805-002",
      amount: 600,
      units: "1 Session",
      mode: "Cash",
      status: "Completed",
      type: "Direct",
      note: "Shoulder mob & exercise assessment",
      sessionIds: ["s_204"],
      createdAt: "2024-08-05T12:30:00.000Z"
    }
  ],
  receipts: [
    {
      id: "r_401",
      billNo: "RCPT-20240803-001",
      date: "2024-08-03",
      therapistId: "doc_1",
      therapistName: "Dr. Shantanu Waidande",
      therapistQual: "BPTh, MPTh (Musculoskeletal)",
      therapistRegNo: "PT-2024/8912",
      patientId: "p_101",
      patientName: "Rajesh Sharma",
      patientAge: "45",
      patientSex: "Male",
      patientMobile: "+91 98230 11223",
      patientAddress: "Flat 402, Sunshine Apts, Pune",
      services: "IFT + Core Stabilization | 1 | 600\nLumbar Traction | 1 | 600",
      amount: 1200,
      paymentMode: "Online",
      transactionId: "UPI/4219081231",
      customText: "Received with thanks towards physiotherapy treatment charges.",
      createdAt: "2024-08-03T11:00:00.000Z"
    }
  ],
  therapists: [
    {
      id: "doc_1",
      name: "Dr. Shantanu Waidande",
      qualification: "BPTh, MPTh (Musculoskeletal)",
      regNo: "PT-2024/8912"
    }
  ]
};

export function getLocalDB() {
  if (typeof window === 'undefined') return defaultSeedData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSeedData));
      return defaultSeedData;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Local DB read error:", e);
    return defaultSeedData;
  }
}

export function saveLocalDB(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Local DB save error:", e);
  }
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

export function numberToWords(number) {
  let num = Math.floor(Math.abs(parseFloat(number) || 0));
  if (num === 0) return 'Zero Rupees Only';
  if (num > 99999999) return 'Amount Too Large';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function helper(n) {
    if (n === 0) return '';
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
    return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + helper(n % 100) : '');
  }

  let parts = [];
  const lakh = Math.floor(num / 100000);
  const restL = num % 100000;
  const thousand = Math.floor(restL / 1000);
  const rest = restL % 1000;

  if (lakh) parts.push(helper(lakh) + ' Lakh');
  if (thousand) parts.push(helper(thousand) + ' Thousand');
  if (rest) parts.push(helper(rest));

  return parts.join(' ') + ' Rupees Only';
}
