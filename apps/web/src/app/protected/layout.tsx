"use client";

import { ReactNode, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { redirectToLogin, verifyAccess } from '@/lib/api-client';
import { ProtectedContext } from './context';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    user: string | null;
    context: any | null;
  }>({
    isLoading: true,
    user: null,
    context: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Call the new /authenticated endpoint using the common module verifyAccess
      const { status, data } = await verifyAccess('/api/node/api/authorization/authenticated');

      if (status === 'authorized') {
        setAuthState({
          isLoading: false,
          user: data?.user ?? null,
          context: data?.context ?? null
        });
      } else {
        if (status === 'unauthenticated') {
          redirectToLogin();
        }
        // Handle cases where status is forbidden, etc., if necessary
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  if (authState.isLoading) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Verifying authentication status...</p>
      </div>
    );
  }

  if (!authState.user) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Authentication error occurred. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <ProtectedContext.Provider value={{ user: authState.user, context: authState.context }}>
      {children}
    </ProtectedContext.Provider>
  );
}
