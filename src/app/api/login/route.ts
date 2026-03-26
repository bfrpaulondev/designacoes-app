import { NextRequest, NextResponse } from "next/server"
import { User, connectDB } from "@/lib/db"
import { hash, compare } from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { email, password, name, action } = body

    if (action === "register") {
      // Register new user
      const existingUser = await User.findOne({ email })

      if (existingUser) {
        return NextResponse.json(
          { error: "Email já cadastrado" },
          { status: 400 }
        )
      }

      const hashedPassword = await hash(password, 10)
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role: "designador",
      })

      return NextResponse.json({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      })
    }

    // Login
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      )
    }

    const isValid = await compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      )
    }

    // Create session token (base64 encoded JSON)
    const sessionData = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      timestamp: Date.now()
    }
    
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64')

    const response = NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Set session cookie (24 hours)
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return NextResponse.json(
      { error: "Erro na autenticação" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  // Logout
  const response = NextResponse.json({ success: true })
  response.cookies.delete("session_token")
  return response
}
