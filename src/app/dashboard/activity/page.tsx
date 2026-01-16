'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, ArrowRight, Calendar, User } from 'lucide-react'
import Link from 'next/link'

export default function ActivityPage() {
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/groups')
                const groups = await res.json()

                // Flatten all expenses from all groups into a single activity feed
                const allExpenses: any[] = []

                for (const group of groups) {
                    const expRes = await fetch(`/api/expenses?groupId=${group.id}`)
                    const groupExpenses = await expRes.json()
                    allExpenses.push(...groupExpenses.map((e: any) => ({
                        ...e,
                        groupName: group.name,
                        groupId: group.id
                    })))
                }

                // Sort by date descending
                allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                setActivities(allExpenses)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchActivity()
    }, [])

    return (
        <div style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Full Activity</h1>
                <p style={{ color: 'var(--text-dim)' }}>A chronological ledger of every expense across your ecosystem.</p>
            </header>

            {loading ? (
                <p>Gleaning transaction history...</p>
            ) : activities.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: 'var(--text-dim)' }}>Silence in the ledger. Time to spend!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activities.map((item: any) => (
                        <Link key={item.id} href={`/dashboard/groups/${item.groupId}`}>
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="card"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'auto 1fr auto',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    padding: '1.2rem 1.5rem',
                                    borderLeft: '4px solid var(--accent)'
                                }}
                            >
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '12px',
                                    background: 'var(--glass)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent)'
                                }}>
                                    <CreditCard size={22} />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                        <h4 style={{ fontSize: '1.1rem' }}>{item.description}</h4>
                                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--accent-muted)', color: 'var(--accent)', borderRadius: '99px' }}>
                                            {item.groupName}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <User size={14} /> {item.payer.name}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Calendar size={14} /> {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>${item.amount.toFixed(2)}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent)', fontSize: '0.8rem', justifyContent: 'flex-end' }}>
                                        View <ArrowRight size={12} />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
