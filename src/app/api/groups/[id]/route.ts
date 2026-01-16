import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculateNetBalances, simplifyDebts } from '@/lib/balanceEngine'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const group = await prisma.group.findUnique({
        where: { id },
        include: {
            members: true,
            expenses: {
                include: { splits: true }
            }
        }
    })

    if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const netBalances = calculateNetBalances(group.members, group.expenses)
    const suggestions = simplifyDebts({ ...netBalances })

    return NextResponse.json({
        ...group,
        netBalances,
        settlementSuggestions: suggestions
    })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.group.delete({ where: { id } })
    return NextResponse.json({ message: 'Group deleted' })
}
