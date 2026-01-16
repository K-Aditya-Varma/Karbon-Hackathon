'use client'

import { useState, useEffect, use } from 'react'
import { Plus, ArrowLeft, MoreVertical, CreditCard, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AddExpenseModal from '@/components/modals/AddExpenseModal'

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [group, setGroup] = useState<any>(null)
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

    const fetchData = async () => {
        try {
            const [gRes, eRes] = await Promise.all([
                fetch(`/api/groups/${id}`),
                fetch(`/api/expenses?groupId=${id}`)
            ])
            const gData = await gRes.json()
            const eData = await eRes.json()
            setGroup(gData)
            setExpenses(eData)
            setLoading(false)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [id])

    if (loading) return <div style={{ padding: '3rem' }}>Loading group...</div>
    if (!group) return <div style={{ padding: '3rem' }}>Group not found.</div>

    return (
        <div style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem' }}>{group.name}</h1>
                        <p style={{ color: 'var(--text-dim)' }}>{group.members.length} participants</p>
                    </div>
                    <button
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => setIsExpenseModalOpen(true)}
                    >
                        <Plus size={18} /> Add Expense
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                {/* Ledger */}
                <section>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Expenses</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {expenses.length === 0 ? (
                            <p style={{ color: 'var(--text-dim)' }}>No expenses yet.</p>
                        ) : (
                            expenses.map((exp: any) => (
                                <ExpenseItem key={exp.id} expense={exp} />
                            ))
                        )}
                    </div>
                </section>

                {/* Balances */}
                <aside>
                    <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Balances</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {group.members.map((m: any) => {
                                const balance = group.netBalances[m.id] || 0
                                return (
                                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: m.color || 'var(--secondary)', flexShrink: 0 }} />
                                            <span style={{ fontWeight: 500 }}>{m.name}</span>
                                        </div>
                                        <span style={{
                                            fontWeight: 600,
                                            color: balance > 0 ? 'var(--accent)' : balance < 0 ? 'var(--error)' : 'var(--text-dim)'
                                        }}>
                                            {balance > 0 ? '+' : ''}{balance.toFixed(2)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        {group.settlementSuggestions.length > 0 && (
                            <>
                                <hr style={{ margin: '1.5rem 0', border: '0.5px solid var(--border)' }} />
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>Settle Up Suggestions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {group.settlementSuggestions.map((s: any, i: number) => {
                                        const from = group.members.find((m: any) => m.id === s.from)?.name
                                        const to = group.members.find((m: any) => m.id === s.to)?.name
                                        return (
                                            <div key={i} style={{ fontSize: '0.85rem' }}>
                                                {from} owes {to} <span style={{ color: 'var(--accent)' }}>${s.amount}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </aside>
            </div>

            <AddExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                group={group}
                onSuccess={fetchData}
            />
        </div>
    )
}

function ExpenseItem({ expense }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'var(--glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)'
                }}>
                    <CreditCard size={20} />
                </div>
                <div>
                    <h4 style={{ fontSize: '1.1rem' }}>{expense.description}</h4>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        Paid by <span style={{ color: 'var(--foreground)' }}>{expense.payer.name}</span> • {new Date(expense.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>${expense.amount.toFixed(2)}</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{expense.splitType}</p>
            </div>
        </motion.div>
    )
}
