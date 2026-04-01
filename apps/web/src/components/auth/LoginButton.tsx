"use client";

import { LogIn } from 'lucide-react';

import { redirectToLogin } from '@/lib/api-client';

export default function LoginButton() {
    const handleLogin = () => {
        redirectToLogin();
    };

    return (
        <button
            onClick={handleLogin}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-9 px-4 shadow-sm"
        >
            <LogIn className="mr-2 h-4 w-4" />
            Login
        </button>
    );
}
