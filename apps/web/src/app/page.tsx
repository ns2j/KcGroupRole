'use client';

import { useEffect, useState } from 'react';
import { Loader2, LogIn, LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import { fetchProtectedApi, redirectToLogin, redirectToLogout } from '@/lib/api-client';

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || '';
  const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || '';

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetchProtectedApi('/api/node/api/info');

      if (response.ok) {
        const data = await response.json();
        setUserData(data.decodedAccessToken);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Communication error:', error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    redirectToLogin();
  };

  const handleLogout = () => {
    redirectToLogout();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 md:p-8 text-slate-900">

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {userData ? (
          <div className="p-6 md:p-8 flex flex-col items-center text-center">

            <div className="relative mb-6">
              <div className="h-24 w-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner">
                {userData.name ? userData.name.charAt(0).toUpperCase() : <User size={40} />}
              </div>
              <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white rounded-full p-1.5 shadow-sm">
                <ShieldCheck size={16} className="text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight">
              {userData.name || userData.preferred_username}
            </h2>
            <p className="text-slate-500 mb-6">@{userData.preferred_username}</p>

            <div className="w-full space-y-3 mb-8">
              <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100 text-left">
                <Mail className="h-5 w-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Email Address</p>
                  <p className="text-sm font-semibold text-slate-700">{userData.email || 'Not set'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 h-11 px-8 text-red-600 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>

        ) : (
          <div className="p-6 md:p-8 flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <User size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Welcome
            </h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              Welcome to the secure BFF architecture.<br />
              Please login to continue.
            </p>

            <button
              onClick={handleLogin}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm h-11 px-8"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login with Keycloak
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
