"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Stethoscope, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, loginWithEmail, registerWithEmail, loginAsDemoDoctor } = useAuth();
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const res = await signInWithGoogle();
    setLoading(false);
    if (res.success) {
      router.push('/dashboard');
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    const res = isRegister
      ? await registerWithEmail(email, password, name)
      : await loginWithEmail(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError('Authentication failed. Entering demo mode.');
      setTimeout(() => router.push('/dashboard'), 1000);
    }
  };

  const handleDemoAccess = () => {
    loginAsDemoDoctor("Dr. Shantanu Waidande", "shantanu@physioclinic.com");
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-8">

      {/* Main Container */}
      <div className="w-full max-w-md bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary text-white mb-4">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-serif">
            PhysioClinic Portal
          </h1>
          <p className="text-foreground/50 text-xs sm:text-sm mt-1.5">
            Doctor Portal — Secure Login
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs text-center">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white hover:bg-muted/50 text-foreground font-medium rounded-md flex items-center justify-center gap-3 transition border border-border active:scale-[0.98] text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.26v3.15C3.24 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.98 0 12s.46 3.83 1.26 5.42l4.06-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.24 2.7 1.26 6.58l4.06 3.15c.94-2.83 3.57-4.98 6.68-4.98z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-surface px-3 text-xs text-foreground/40 uppercase tracking-wider font-mono absolute">
            or email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-foreground/30 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Dr. Shantanu Waidande"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-md text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1">Doctor Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-foreground/30 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="doctor@physioclinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-md text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-foreground/30 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-md text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:opacity-90 text-white font-medium rounded-md transition flex items-center justify-center gap-2 text-sm mt-2 active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register / Sign In Switch */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-foreground/40 hover:text-primary transition"
          >
            {isRegister ? 'Already registered? Sign In' : 'First time doctor? Register here'}
          </button>
        </div>

        {/* Demo Fast Track */}
        <div className="mt-6 pt-5 border-t border-border text-center">
          <button
            onClick={handleDemoAccess}
            className="w-full py-3 px-4 bg-primary/8 hover:bg-primary/15 border border-primary/15 rounded-md text-xs font-medium text-foreground/70 flex items-center justify-center gap-2 transition"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
            Quick Demo Login (Dr. Shantanu Waidande)
          </button>
        </div>

      </div>

      <p className="text-foreground/30 text-xs mt-6 text-center">
        PhysioClinic PWA &copy; {new Date().getFullYear()} — Doctor Portal
      </p>
    </div>
  );
}
