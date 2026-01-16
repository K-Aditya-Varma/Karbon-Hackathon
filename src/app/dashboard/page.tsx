'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    Plus,
    Search,
    Zap,
    ChevronRight,
    PlusCircle
} from 'lucide-react'
import CreateGroupModal from '@/components/modals/CreateGroupModal'
import Link from 'next/link'

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ totalSpent: 0, youOwe: 0, youAreOwed: 0 })
    const [groups, setGroups] = useState([])
    const [aiInput, setAiInput] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchGroups()
        fetchStats()
    }, [])

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups')
            const data = await res.json()
            setGroups(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats')
            const data = await res.json()
            setStats(data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleAiSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // For now, mock AI parsing
        alert(`MintSense parsing: "${aiInput}"\nFeature coming soon!`)
        setAiInput('')
    }

    return (
        <div style={{ padding: '3rem' }}>
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Overview</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Track your shared finances with precision.</p>
                </div>

                {/* AI Bar */}
                <form onSubmit={handleAiSubmit} style={{ position: 'relative', width: '400px' }}>
                    <div style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--accent)'
                    }}>
                        <Zap size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="MintSense: '50 for dinner at Tokyo'"
                        value={aiInput}
                        onChange={e => setAiInput(e.target.value)}
                        style={{
                            paddingLeft: '3rem',
                            width: '100%',
                            background: 'var(--glass)',
                            border: '1px solid var(--accent)',
                            boxShadow: '0 0 15px rgba(0, 255, 163, 0.1)'
                        }}
                    />
                </form>
            </header>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} icon={<Zap />} color="var(--accent)" />
                <StatCard title="You Owe" value={`$${stats.youOwe.toFixed(2)}`} icon={<TrendingDown />} color="#ff4d4d" />
                <StatCard title="You are Owed" value={`$${stats.youAreOwed.toFixed(2)}`} icon={<TrendingUp />} color="#00ffa3" />
            </div>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Recent Groups</h2>
                    <button
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <PlusCircle size={18} /> Create Group
                    </button>
                </div>

                {loading ? (
                    <p>Loading groups...</p>
                ) : groups.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>No groups found. Create one to get started!</p>
                        <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>Start a Group</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {groups.map((group: any) => (
                            <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
                                <GroupCard group={group} />
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <CreateGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchGroups}
            />
        </div>
    )
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
        >
            <div style={{
                padding: '12px',
                background: `${color}15`,
                color: color,
                borderRadius: '12px'
            }}>
                {icon}
            </div>
            <div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
            </div>
        </motion.div>
    )
}

function GroupCard({ group }: any) {
    return (
        <motion.div
            className="card"
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
            <div>
                <h3 style={{ marginBottom: '0.5rem' }}>{group.name}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    {group.members.length} participants • {group._count.expenses} expenses
                </p>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
                {group.members.map((m: any, i: number) => (
                    <div key={i} style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: m.color || 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        border: '2px solid var(--surface)'
                    }}>
                        {m.name[0]}
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
