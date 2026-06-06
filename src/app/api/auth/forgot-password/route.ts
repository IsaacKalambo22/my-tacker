import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    // In production, you would send an actual email with a reset token
    if (user) {
      // TODO: Implement actual email sending with reset token
      // For now, we'll just log it
      console.log(`Password reset requested for: ${email}`)
    }

    return NextResponse.json({ 
      message: "If an account exists with this email, a password reset link has been sent." 
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
