'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, Search, Users as UsersIcon, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import CreateGroupModal from '@/components/modals/CreateGroupModal'

export default function GroupsPage() {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [search, setSearch] = useState('')

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

    useEffect(() => {
        fetchGroups()
    }, [])

    const filteredGroups = groups.filter((g: any) =>
        g.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ padding: '3rem' }}>
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Groups</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage your shared expenses and participants.</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <PlusCircle size={20} /> Create New Group
                </button>
            </header>

            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={20} />
                <input
                    style={{ paddingLeft: '3rem', width: '100%', maxWidth: '400px' }}
                    placeholder="Search groups..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <p>Loading groups...</p>
            ) : filteredGroups.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <UsersIcon size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-dim)' }}>No groups found matching "{search}"</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredGroups.map((group: any) => (
                        <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="card"
                                style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                            >
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{group.name}</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                        {group.members.length} participants • {group._count?.expenses || 0} expenses
                                    </p>
                                </div>
                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '-8px' }}>
                                        {group.members.slice(0, 4).map((m: any, i: number) => (
                                            <div key={i} style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: m.color || 'var(--secondary)',
                                                border: '2px solid var(--surface)',
                                                marginLeft: i > 0 ? '-10px' : 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                zIndex: 4 - i
                                            }}>
                                                {m.name[0]}
                                            </div>
                                        ))}
                                        {group.members.length > 4 && (
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: 'var(--glass)',
                                                border: '2px solid var(--surface)',
                                                marginLeft: '-10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                color: 'var(--text-dim)'
                                            }}>
                                                +{group.members.length - 4}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronRight size={20} color="var(--text-dim)" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}

            <CreateGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchGroups}
            />
        </div>
    )
}
