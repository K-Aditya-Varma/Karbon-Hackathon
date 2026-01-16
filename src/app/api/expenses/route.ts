import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount, description, date, groupId, payerId, splits, splitType } = await req.json()

    // amount: number
    // description: string
    // groupId: string
    // payerId: string (GroupMember ID)
    // splits: [{ memberId, amount, percent? }]

    try {
        const expense = await prisma.$transaction(async (tx: any) => {
            const exp = await tx.expense.create({
                data: {
                    amount,
                    description,
                    date: date ? new Date(date) : new Date(),
                    groupId,
                    payerId,
                    splitType,
                }
            })

            // Create splits
            await tx.split.createMany({
                data: splits.map((s: any) => ({
                    expenseId: exp.id,
                    memberId: s.memberId,
                    amount: s.amount,
                }))
            })

            return exp
        })

        return NextResponse.json(expense)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) return NextResponse.json({ error: 'Missing groupId' }, { status: 400 })

    const expenses = await prisma.expense.findMany({
        where: { groupId },
        include: {
            payer: true,
            splits: {
                include: { member: true }
            }
        },
        orderBy: { date: 'desc' }
    })

    return NextResponse.json(expenses)
}
