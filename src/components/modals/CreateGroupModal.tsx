'use client'

import { useState } from 'react'
import { X, Plus, UserPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CreateGroupModal({ isOpen, onClose, onSuccess }: any) {
    const [name, setName] = useState('')
    const [members, setMembers] = useState([{ name: '' }])
    const [loading, setLoading] = useState(false)

    const addMember = () => setMembers([...members, { name: '' }])
    const updateMember = (i: number, val: string) => {
        const next = [...members]
        next[i].name = val
        setMembers(next)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, members: members.filter(m => m.name) })
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
            backdropFilter: 'blur(4px)'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card"
                style={{ width: '100%', maxWidth: '500px', background: 'var(--surface)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Create New Group</h2>
                    <button onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Group Name</label>
                        <input
                            style={{ width: '100%' }}
                            placeholder="e.g. Europe Trip 2024"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Participants</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {members.map((m, i) => (
                                <input
                                    key={i}
                                    placeholder={`Participant ${i + 1} Name`}
                                    value={m.name}
                                    onChange={e => updateMember(i, e.target.value)}
                                />
                            ))}
                            <button
                                type="button"
                                onClick={addMember}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'var(--accent)',
                                    fontSize: '0.9rem',
                                    marginTop: '0.5rem'
                                }}
                            >
                                <Plus size={16} /> Add Participant
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
