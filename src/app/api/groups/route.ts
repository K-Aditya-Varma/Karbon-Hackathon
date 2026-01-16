import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const groups = await prisma.group.findMany({
        where: {
            members: {
                some: { userId: user.id }
            }
        },
        include: {
            members: true,
            _count: {
                select: { expenses: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(groups)
}

export async function POST(req: Request) {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, members } = await req.json() // members: [{ name, email? }]

    const group = await prisma.group.create({
        data: {
            name,
            members: {
                create: [
                    { name: user.name || 'Admin', userId: user.id, color: '#00ffa3' },
                    ...members.map((m: any) => ({
                        name: m.name,
                        color: m.color || '#7b61ff'
                    }))
                ]
            }
        },
        include: { members: true }
    })

    return NextResponse.json(group)
}
