import { NextRequest, NextResponse } from "next/server"

// Simple session-based auth without NextAuth
export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value
  
  if (!sessionToken) {
    return NextResponse.json({ authenticated: false })
  }
  
  try {
    // Decode session token (base64 encoded JSON)
    const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
    
    // Check if session is still valid (24 hours)
    if (Date.now() - sessionData.timestamp > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ authenticated: false })
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role
      }
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

export async function POST() {
  // Logout - handled by login route
  return NextResponse.json({ success: true })
}
