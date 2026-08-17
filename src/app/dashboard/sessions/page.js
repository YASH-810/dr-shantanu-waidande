"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/patients');
  }, [router]);

  return (
    <div className="p-12 text-center text-slate-500 text-xs font-semibold space-y-2">
      <p>Redirecting to Patient Directory & Rehabilitation Progression Logs...</p>
    </div>
  );
}
