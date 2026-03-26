import { NextResponse } from "next/server"
import { User, Privilegio, Parte, Configuracao, connectDB } from "@/lib/db"
import { hash } from "bcryptjs"

export async function POST() {
  try {
    await connectDB()
    
    // Create default privileges - including Superintendente Viajante
    const privilegios = [
      { nome: "Estudante", ordem: 1 },
      { nome: "Publicador Não Batizado", ordem: 2 },
      { nome: "Publicador Batizado", ordem: 3 },
      { nome: "Pioneiro Auxiliar", ordem: 4 },
      { nome: "Pioneiro Regular", ordem: 5 },
      { nome: "Servo Ministerial", ordem: 6 },
      { nome: "Ancião", ordem: 7 },
      { nome: "Superintendente Viajante", ordem: 8 },
    ]

    for (const priv of privilegios) {
      const existing = await Privilegio.findOne({ nome: priv.nome })
      if (!existing) {
        await Privilegio.create(priv)
      } else {
        await Privilegio.findByIdAndUpdate(existing._id, { ordem: priv.ordem })
      }
    }

    // Create default admin user
    const existingAdmin = await User.findOne({ email: "admin@congregacao.local" })

    if (!existingAdmin) {
      const hashedPassword = await hash("admin123", 10)
      await User.create({
        email: "admin@congregacao.local",
        password: hashedPassword,
        name: "Administrador",
        role: "admin",
      })
    }

    // Create default parts
    const partes = [
      { nome: "Presidente", duracaoMinutos: 0, numParticipantes: 1, tipo: "outros", sala: "A", ordem: 1, privilegiosMinimos: JSON.stringify(["Servo Ministerial", "Ancião", "Superintendente Viajante"]) },
      { nome: "Oração Inicial", duracaoMinutos: 1, numParticipantes: 1, tipo: "outros", sala: "A", ordem: 2 },
      { nome: "Cânticos", duracaoMinutos: 5, numParticipantes: 1, tipo: "outros", sala: "ambas", ordem: 3 },
      { nome: "Leitura da Bíblia", duracaoMinutos: 4, numParticipantes: 1, tipo: "leitura", sala: "ambas", ordem: 4, privilegiosMinimos: JSON.stringify(["Publicador Batizado", "Pioneiro Auxiliar", "Pioneiro Regular", "Servo Ministerial", "Ancião", "Superintendente Viajante"]) },
      { nome: "Iniciando conversas", duracaoMinutos: 3, numParticipantes: 2, tipo: "demonstracao", sala: "ambas", ordem: 5 },
      { nome: "Cultivando o interesse", duracaoMinutos: 4, numParticipantes: 2, tipo: "demonstracao", sala: "ambas", ordem: 6 },
      { nome: "Fazendo discípulos", duracaoMinutos: 5, numParticipantes: 2, tipo: "demonstracao", sala: "ambas", ordem: 7 },
      { nome: "Discurso", duracaoMinutos: 30, numParticipantes: 1, tipo: "discurso", sala: "A", ordem: 8, privilegiosMinimos: JSON.stringify(["Servo Ministerial", "Ancião", "Superintendente Viajante"]) },
      { nome: "Estudo Bíblico", duracaoMinutos: 6, numParticipantes: 2, tipo: "demonstracao", sala: "ambas", ordem: 9 },
      { nome: "Conselheiro", duracaoMinutos: 1, numParticipantes: 1, tipo: "outros", sala: "ambas", ordem: 10, privilegiosMinimos: JSON.stringify(["Servo Ministerial", "Ancião", "Superintendente Viajante"]) },
      { nome: "Oração Final", duracaoMinutos: 1, numParticipantes: 1, tipo: "outros", sala: "A", ordem: 11 },
    ]

    for (const parte of partes) {
      const existingParte = await Parte.findOne({ nome: parte.nome })
      if (!existingParte) {
        await Parte.create({
          nome: parte.nome,
          duracaoMinutos: parte.duracaoMinutos,
          numParticipantes: parte.numParticipantes,
          tipo: parte.tipo,
          sala: parte.sala,
          ordem: parte.ordem,
          privilegiosMinimos: parte.privilegiosMinimos,
        })
      }
    }

    // Create default configuration
    const configs = [
      { chave: "nome_congregacao", valor: "Minha Congregação" },
      { chave: "horario_reuniao", valor: "19:00" },
    ]

    for (const config of configs) {
      const existingConfig = await Configuracao.findOne({ chave: config.chave })
      if (!existingConfig) {
        await Configuracao.create(config)
      } else {
        await Configuracao.findByIdAndUpdate(existingConfig._id, { valor: config.valor })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Dados iniciais criados com sucesso! Privilégios incluem: Estudante, Publicador Não Batizado, Publicador Batizado, Pioneiro Auxiliar, Pioneiro Regular, Servo Ministerial, Ancião e Superintendente Viajante." 
    })
  } catch (error) {
    console.error("Erro ao criar dados iniciais:", error)
    return NextResponse.json(
      { error: "Erro ao criar dados iniciais" },
      { status: 500 }
    )
  }
}
