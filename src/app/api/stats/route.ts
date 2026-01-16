import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculateNetBalances } from '@/lib/balanceEngine'

export async function GET() {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const groups = await prisma.group.findMany({
        where: { members: { some: { userId: user.id } } },
        include: {
            members: true,
            expenses: {
                include: { splits: true }
            }
        }
    })

    let totalSpent = 0
    let youOwe = 0
    let youAreOwed = 0

    groups.forEach((group: any) => {
        const userMember = group.members.find((m: any) => m.userId === user.id)
        if (!userMember) return

        const netBalances = calculateNetBalances(group.members, group.expenses)
        const balance = netBalances[userMember.id] || 0

        if (balance > 0) youAreOwed += balance
        else if (balance < 0) youOwe += Math.abs(balance)

        // Calculate total spent by user
        group.expenses.forEach((exp: any) => {
            if (exp.payerId === userMember.id) {
                totalSpent += exp.amount
            }
        })
    })

    return NextResponse.json({
        totalSpent,
        youOwe,
        youAreOwed
    })
}
