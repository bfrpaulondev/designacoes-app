import mongoose from 'mongoose'
import { Schema, model, models } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

// Log para debug (apenas no servidor)
if (typeof window === 'undefined') {
  console.log('[DB] MONGODB_URI configured:', !!MONGODB_URI, MONGODB_URI ? `(${MONGODB_URI.length} chars, prefix: ${MONGODB_URI.substring(0, 30)}...)` : '(empty)')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
}

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectDB() {
  if (!MONGODB_URI) {
    console.error('[DB] MONGODB_URI is not configured!')
    throw new Error('MONGODB_URI environment variable is not set. Please configure it in your Vercel project settings.')
  }
  
  // Check if we have a valid connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log('[DB] Using existing MongoDB connection')
    return cached.conn
  }

  // If connection was closed, reset the promise
  if (mongoose.connection.readyState === 0) {
    cached.promise = null
  }

  if (!cached.promise) {
    console.log('[DB] Creating new MongoDB connection...')
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // 15 seconds
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 1,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((conn) => {
        console.log('[DB] MongoDB connected successfully!')
        console.log('[DB] Host:', conn.connection.host)
        console.log('[DB] Database:', conn.connection.name)
        return conn
      })
      .catch((err) => {
        console.error('[DB] MongoDB connection error:', err.message)
        console.error('[DB] Error name:', err.name)
        cached.promise = null
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('[DB] Failed to establish connection:', e)
    throw e
  }

  return cached.conn
}

// ============================================
// ETIQUETA SCHEMA - Tags personalizáveis
// ============================================
const EtiquetaSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  icone: { type: String, default: 'Tag' }, // Nome do ícone Lucide
  cor: { type: String, default: '#6B7280' }, // Cor da etiqueta
  descricao: { type: String },
  ordem: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// ============================================
// PRIVILÉGIO SCHEMA
// ============================================
const PrivilegioSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  ordem: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

// ============================================
// PUBLICADOR SCHEMA - Completo com todos os campos
// ============================================
const PublicadorSchema = new Schema({
  // Nome completo
  nomePrimeiro: { type: String, required: true },
  nomeMeio: { type: String },
  nomeUltimo: { type: String, required: true },
  sufixo: { type: String }, // Jr, Sr, etc.
  nomeCompleto: { type: String }, // Calculado automaticamente
  
  // Identificação
  etiqueta: { type: String }, // Nome de exibição/etiqueta
  contactoFamilia: { type: String }, // Nome do contato de família
  
  // Dados pessoais
  genero: { type: String, enum: ['masculino', 'feminino'], required: true },
  dataNascimento: { type: Date },
  
  // Contactos
  telemovel: { type: String },
  telefoneCasa: { type: String },
  outroTelefone: { type: String },
  email: { type: String },
  
  // Morada
  morada: { type: String },
  morada2: { type: String },
  codigoPostal: { type: String },
  cidade: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  
  // Dados espirituais
  dataBatismo: { type: Date },
  tipoPublicador: { 
    type: String, 
    enum: ['estudante', 'publicador_nao_batizado', 'publicador_batizado', 'pioneiro_auxiliar', 'pioneiro_regular'],
    default: 'publicador_batizado'
  },
  privilegioServico: {
    type: String,
    enum: ['nenhum', 'ungido', 'anciao', 'servo_ministerial', 'superintendente_viajante'],
    default: 'nenhum'
  },
  
  // Relacionamentos
  privilegios: [{ type: Schema.Types.ObjectId, ref: 'Privilegio' }],
  etiquetas: [{ type: Schema.Types.ObjectId, ref: 'Etiqueta' }], // Tags personalizáveis
  
  // Grupo
  grupoCampo: { type: String },
  grupoLimpeza: { type: String },
  
  // Status e restrições
  status: { 
    type: String, 
    enum: ['ativo', 'inativo', 'mudou', 'faleceu', 'restrito'],
    default: 'ativo' 
  },
  restricoes: [{
    tipo: { type: String },
    descricao: { type: String },
    ativo: { type: Boolean, default: true }
  }],
  
  // Observações
  observacoes: { type: String },
  
  // Foto
  foto: { type: String },
  
  // Metadados
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Middleware para calcular nomeCompleto antes de salvar
PublicadorSchema.pre('save', function(next) {
  const parts = [this.nomePrimeiro, this.nomeMeio, this.nomeUltimo].filter(Boolean)
  this.nomeCompleto = parts.join(' ')
  if (this.sufixo) {
    this.nomeCompleto += ` ${this.sufixo}`
  }
  next()
})

// ============================================
// USER SCHEMA - Usuários do sistema
// ============================================
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'designador' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// ============================================
// PARTE SCHEMA
// ============================================
const ParteSchema = new Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  duracaoMinutos: { type: Number, required: true },
  numParticipantes: { type: Number, default: 1 },
  tipo: { type: String, default: 'outros' },
  sala: { type: String, default: 'ambas' },
  privilegiosMinimos: { type: String },
  ordem: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// ============================================
// SEMANA DESIGNAÇÃO SCHEMA
// ============================================
const SemanaDesignacaoSchema = new Schema({
  dataInicio: { type: Date, required: true },
  dataFim: { type: Date, required: true },
  observacoes: { type: String },
  status: { type: String, default: 'rascunho' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// ============================================
// DESIGNAÇÃO SCHEMA
// ============================================
const DesignacaoSchema = new Schema({
  semanaId: { type: Schema.Types.ObjectId, ref: 'SemanaDesignacao', required: true },
  parteId: { type: Schema.Types.ObjectId, ref: 'Parte', required: true },
  sala: { type: String, required: true },
  publicadorId: { type: Schema.Types.ObjectId, ref: 'Publicador', required: true },
  observacoes: { type: String },
  ordem: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// ============================================
// CONFIGURAÇÃO SCHEMA
// ============================================
const ConfiguracaoSchema = new Schema({
  chave: { type: String, required: true, unique: true },
  valor: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// ============================================
// EXPORT MODELS
// ============================================
export const User = models.User || model('User', UserSchema)
export const Etiqueta = models.Etiqueta || model('Etiqueta', EtiquetaSchema)
export const Privilegio = models.Privilegio || model('Privilegio', PrivilegioSchema)
export const Publicador = models.Publicador || model('Publicador', PublicadorSchema)
export const Parte = models.Parte || model('Parte', ParteSchema)
export const SemanaDesignacao = models.SemanaDesignacao || model('SemanaDesignacao', SemanaDesignacaoSchema)
export const Designacao = models.Designacao || model('Designacao', DesignacaoSchema)
export const Configuracao = models.Configuracao || model('Configuracao', ConfiguracaoSchema)

// Tipos TypeScript
export interface IEtiqueta {
  _id: string
  nome: string
  icone: string
  cor: string
  descricao?: string
  ordem: number
  ativo: boolean
}

export interface IPublicador {
  _id: string
  nomePrimeiro: string
  nomeMeio?: string
  nomeUltimo: string
  sufixo?: string
  nomeCompleto: string
  etiqueta?: string
  contactoFamilia?: string
  genero: 'masculino' | 'feminino'
  dataNascimento?: Date
  telemovel?: string
  telefoneCasa?: string
  outroTelefone?: string
  email?: string
  morada?: string
  morada2?: string
  codigoPostal?: string
  cidade?: string
  latitude?: number
  longitude?: number
  dataBatismo?: Date
  tipoPublicador: string
  privilegioServico: string
  privilegios: string[]
  etiquetas: string[]
  grupoCampo?: string
  grupoLimpeza?: string
  status: string
  restricoes: { tipo: string; descricao: string; ativo: boolean }[]
  observacoes?: string
  foto?: string
}
