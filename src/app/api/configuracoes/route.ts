import { NextRequest, NextResponse } from "next/server"
import { Configuracao, connectDB } from "@/lib/db"

export async function GET() {
  try {
    await connectDB()
    
    const configuracoes = await Configuracao.find({})
    const configMap: Record<string, string> = {}
    for (const config of configuracoes) {
      configMap[config.chave] = config.valor
    }
    return NextResponse.json(configMap)
  } catch (error) {
    console.error("Erro ao buscar configurações:", error)
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { chave, valor } = body

    const config = await Configuracao.findOneAndUpdate(
      { chave },
      { chave, valor, updatedAt: new Date() },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      id: config._id.toString(),
      chave: config.chave,
      valor: config.valor
    })
  } catch (error) {
    console.error("Erro ao salvar configuração:", error)
    return NextResponse.json(
      { error: "Erro ao salvar configuração" },
      { status: 500 }
    )
  }
}
