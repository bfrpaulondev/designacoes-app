import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb()
    const { id } = await params
    
    const collection = db.collection('designacaos')
    await collection.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir designação:", error)
    return NextResponse.json(
      { error: "Erro ao excluir designação" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb()
    const { id } = await params
    const body = await request.json()
    const { publicadorId, observacoes } = body

    const collection = db.collection('designacaos')
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          publicadorId: publicadorId ? new ObjectId(publicadorId) : null,
          observacoes: observacoes || null,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json(
        { error: "Designação não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: result._id.toString(),
      publicadorId: result.publicadorId?.toString(),
      parteId: result.parteId?.toString()
    })
  } catch (error) {
    console.error("Erro ao atualizar designação:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar designação" },
      { status: 500 }
    )
  }
}
