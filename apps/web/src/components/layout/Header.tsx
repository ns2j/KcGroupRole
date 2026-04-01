"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import LoginButton from '@/components/auth/LoginButton';
import LogoutButton from '@/components/auth/LogoutButton';
import { verifyAccess } from '@/lib/api-client';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLoginState = async () => {
            // Utilize the new authentication check endpoint and standardize status determination with verifyAccess
            const { status } = await verifyAccess('/api/node/api/authorization/authenticated');
            setIsLoggedIn(status === 'authorized');
            setIsLoading(false);
        };

        checkLoginState();
    }, []);


    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm" >
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">

                <Link
                    href="/"
                    className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-indigo-600"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <span className="text-lg">K</span>
                    </div>
                    KcOidc
                </Link>

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : isLoggedIn ? (
                        <LogoutButton />
                    ) : (
                        <LoginButton />
                    )}
                </div>

            </div>
        </header>
    );
}
