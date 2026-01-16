'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    CreditCard,
    Plus
} from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' })
            if (res.ok) {
                router.push('/auth')
            }
        } catch (err) {
            console.error('Logout failed', err)
        }
    }

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Groups', href: '/dashboard/groups', icon: Users },
        { name: 'Activity', href: '/dashboard/activity', icon: CreditCard },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Sidebar */}
            <aside className="glass" style={{
                width: '280px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--border)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                    <div style={{
                        padding: '8px',
                        background: 'var(--accent)',
                        borderRadius: '12px',
                        boxShadow: '0 0 15px rgba(0, 255, 163, 0.2)'
                    }}>
                        <CreditCard size={24} color="#000" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>MintSense</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: active ? 'var(--accent-muted)' : 'transparent',
                                    color: active ? 'var(--accent)' : 'var(--text-dim)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={20} />
                                <span style={{ fontWeight: 500 }}>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={handleSignOut}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '12px 16px',
                            color: 'var(--text-dim)',
                            width: '100%',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                {children}
            </main>
        </div>
    )
}
