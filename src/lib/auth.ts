import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return null

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true }
        })
        return user
    } catch (error) {
        return null
    }
}
