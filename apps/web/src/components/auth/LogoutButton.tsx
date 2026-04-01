"use client";

import { LogOut } from 'lucide-react';

import { redirectToLogout } from '@/lib/api-client';

export default function LogoutButton() {
    const handleLogout = () => {
        redirectToLogout();
    };

    return (
        <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 h-9 px-4 text-red-600 hover:text-red-700"
        >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </button>
    );
}
