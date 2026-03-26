'use server'

import { User, Privilegio, Etiqueta, connectDB } from '@/lib/db'
import { hash } from 'bcryptjs'
import { criarPrivilegiosPadrao } from './privilegios'
import { criarEtiquetasPadrao } from './etiquetas'

// Verificar se o sistema está inicializado
export async function verificarSistema(): Promise<{ 
  success: boolean
  initialized: boolean
  hasAdmin: boolean
  hasPrivilegios: boolean
  hasEtiquetas: boolean
  error?: string 
}> {
  try {
    await connectDB()
    
    const adminCount = await User.countDocuments({ role: 'admin' })
    const privilegiosCount = await Privilegio.countDocuments()
    const etiquetasCount = await Etiqueta.countDocuments()
    
    return {
      success: true,
      initialized: adminCount > 0,
      hasAdmin: adminCount > 0,
      hasPrivilegios: privilegiosCount > 0,
      hasEtiquetas: etiquetasCount > 0
    }
  } catch (error: any) {
    console.error('Erro ao verificar sistema:', error)
    return { 
      success: false,
      initialized: false,
      hasAdmin: false,
      hasPrivilegios: false,
      hasEtiquetas: false,
      error: error.message || 'Erro ao conectar com o banco de dados'
    }
  }
}

// Inicializar o sistema
export async function inicializarSistema(): Promise<{ 
  success: boolean
  message?: string
  adminCredentials?: { email: string; password: string }
  error?: string 
}> {
  try {
    await connectDB()
    
    // Criar privilégios
    await criarPrivilegiosPadrao()
    
    // Criar etiquetas padrão
    await criarEtiquetasPadrao()
    
    // Verificar se já existe admin
    const existingAdmin = await User.findOne({ role: 'admin' })
    
    if (existingAdmin) {
      return {
        success: true,
        message: 'Sistema já está inicializado'
      }
    }
    
    // Criar admin padrão
    const hashedPassword = await hash('admin123', 10)
    await User.create({
      email: 'admin@congregacao.local',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin'
    })
    
    return {
      success: true,
      message: 'Sistema inicializado com sucesso!',
      adminCredentials: {
        email: 'admin@congregacao.local',
        password: 'admin123'
      }
    }
  } catch (error: any) {
    console.error('Erro ao inicializar sistema:', error)
    return { 
      success: false, 
      error: error.message || 'Erro ao inicializar sistema'
    }
  }
}
