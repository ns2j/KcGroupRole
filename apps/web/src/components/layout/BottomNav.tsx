"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, Server, Lock, ShieldAlert } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Info', href: '/info', icon: Info },
        { name: 'API Call', href: '/apicall', icon: Server },
        { name: 'Protected', href: '/protected', icon: Lock },
        { name: 'Manager', href: '/manager', icon: ShieldAlert },
    ];

    return (
        <nav className="fixed bottom-0 z-50 w-full border-t border-slate-200 bg-white/80 backdrop-blur-md pb-safe">
            <div className="flex h-16 items-center justify-around px-2 mx-auto max-w-md">

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive
                                    ? 'text-indigo-600'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}

            </div>
        </nav>
    );
}
