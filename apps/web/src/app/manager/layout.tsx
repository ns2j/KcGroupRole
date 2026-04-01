"use client";

import { ReactNode, useEffect, useState } from 'react';
import { ShieldAlert, Activity, Users, Settings, Loader2, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { redirectToLogin, verifyAccess } from '@/lib/api-client';
import { ManagerContext, ManagerContextType } from './context';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<ManagerContextType>({
    status: 'loading',
    contextData: null,
    userData: null
  });

  useEffect(() => {
    const checkManagerAccess = async () => {
      // Check permissions (currently the /admin endpoint returns the username as well)
      const { status, data } = await verifyAccess('/api/node/api/authorization/admin');

      setAuthState({
        status,
        contextData: data?.context || null,
        userData: data?.user || null
      });

      if (status === 'unauthenticated') {
        redirectToLogin();
      }
    };

    checkManagerAccess();
  }, []);

  const { status, userData, contextData } = authState;

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
        <p className="text-slate-500 font-medium">Checking manager permissions...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
        <p className="text-slate-500 font-medium">Unauthenticated. Redirecting to login...</p>
      </div>
    );
  }

  if (status === 'forbidden') {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-2xl mt-12 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white border-2 border-rose-100 rounded-3xl p-8 text-center shadow-2xl shadow-rose-900/5">
          <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Access Denied</h1>
          <p className="text-slate-600 font-medium mb-8">
            This page is only accessible to users with the <strong>Manager</strong> role.<br />
            Your account does not have the necessary permissions.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ManagerContext.Provider value={authState}>
      <div className="flex flex-col bg-slate-950 text-slate-100 relative shadow-2xl overflow-hidden min-h-[calc(100vh-8rem)]">
        {/* 🚨 Admin bar for managers only (Common layout for all management screens) */}
        <div className="bg-rose-950/80 backdrop-blur-md border-b-2 border-rose-500/50 sticky top-0 z-40">
          <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-rose-500 font-mono text-xs md:text-sm tracking-widest font-bold">
                <ShieldAlert size={18} className="animate-pulse" />
                <span className="hidden sm:inline">SERVER ADMINISTRATION CONSOLE</span>
                <span className="sm:hidden">ADMIN</span>
              </div>

              {userData && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
                  <User size={12} className="text-rose-400" />
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-tighter">
                    Manager: {userData.name || userData.preferred_username}
                  </span>
                </div>
              )}
            </div>

            {/* Sub-navigation for administrators (displayed only when screen size is medium or larger) */}
            <div className="flex items-center gap-4 md:gap-6 text-xs font-bold text-rose-300 uppercase tracking-wider">
              {userData && (
                <div className="lg:hidden flex items-center justify-center w-8 h-8 bg-rose-500/20 rounded-full border border-rose-500/40">
                  <User size={16} className="text-rose-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content for each page (page.tsx) is expanded here */}
        <div className="flex-1 w-full bg-slate-950">
          {children}
        </div>
      </div>
    </ManagerContext.Provider>

  );
}
