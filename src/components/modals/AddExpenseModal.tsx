'use client'

import { useState } from 'react'
import { X, Zap, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { parseExpenseString } from '@/lib/mintsense'

export default function AddExpenseModal({ isOpen, onClose, group, onSuccess }: any) {
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [payerId, setPayerId] = useState(group.members[0]?.id || '')
    const [splitType, setSplitType] = useState('EQUAL') // EQUAL, PERCENT, EXACT
    const [loading, setLoading] = useState(false)
    const [aiInput, setAiInput] = useState('')

    const handleAiParse = () => {
        const parsed = parseExpenseString(aiInput, group.members)
        if (parsed.amount) setAmount(parsed.amount.toString())
        if (parsed.description) setDescription(parsed.description)
        if (parsed.mentionedIds.length > 0) {
            // Logic for multi-select participants if needed
        }
        setAiInput('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const numAmount = parseFloat(amount)
        const membersCount = group.members.length

        // Simple Equal Split Logic for now
        const splits = group.members.map((m: any) => ({
            memberId: m.id,
            amount: numAmount / membersCount
        }))

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: numAmount,
                    description,
                    groupId: group.id,
                    payerId,
                    splitType,
                    splits
                })
            })

            if (res.ok) {
                onSuccess()
                onClose()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(8px)'
        }}>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card"
                style={{ width: '100%', maxWidth: '550px', border: '1px solid var(--accent-muted)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '10px' }}>
                            <Zap size={20} color="#000" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem' }}>Add Expense</h2>
                    </div>
                    <button onClick={onClose}><X /></button>
                </div>

                {/* MintSense Quick Entry */}
                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,255,163,0.05)', borderRadius: '12px', border: '1px dashed var(--accent)' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>MINTSENSE AUTO-FILL</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            style={{ flex: 1, background: 'transparent', border: 'none', padding: '0.5rem 0' }}
                            placeholder="Type e.g. '42.50 for Pizza'"
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAiParse()}
                        />
                        <button onClick={handleAiParse} style={{ color: 'var(--accent)' }}><Check size={20} /></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem' }}>
                        <input
                            placeholder="What was it for?"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="$ 0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            style={{ textAlign: 'right', fontWeight: 'bold' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Paid by</label>
                            <select
                                value={payerId}
                                onChange={e => setPayerId(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--surface)',
                                    color: 'white',
                                    padding: '0.8rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                {group.members.map((m: any) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Split Mode</label>
                            <select
                                value={splitType}
                                onChange={e => setSplitType(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--surface)',
                                    color: 'white',
                                    padding: '0.8rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <option value="EQUAL">Equally</option>
                                <option value="PERCENT">By Percentage</option>
                                <option value="EXACT">Exact Amounts</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Adding...' : 'Save Expense'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
