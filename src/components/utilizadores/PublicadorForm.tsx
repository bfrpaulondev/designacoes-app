'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { STATUS_PUBLICADOR, TIPOS_PUBLICADOR, PRIVILEGIOS_SERVICO, TIPOS_RESTRICAO } from '@/lib/constants'
import {
  User, MapPin, Phone, Mail, Calendar, BookOpen, Users, Tag, Settings,
  Plus, X, Loader2, ChevronDown, ChevronUp
} from 'lucide-react'

interface Etiqueta {
  id: string
  nome: string
  icone: string
  cor: string
  descricao?: string
}

interface Publicador {
  id?: string
  nomeCompleto?: string
  nomePrimeiro?: string
  nomeMeio?: string
  nomeUltimo?: string
  sufixo?: string
  etiqueta?: string
  contactoFamilia?: string
  genero?: string
  dataNascimento?: string
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
  dataBatismo?: string
  tipoPublicador?: string
  privilegioServico?: string
  etiquetas?: { id: string; nome: string; icone: string; cor: string }[]
  grupoCampo?: string
  grupoLimpeza?: string
  status?: string
  restricoes?: { tipo: string; descricao: string; ativo: boolean }[]
  observacoes?: string
}

interface PublicadorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicador?: Publicador | null
  onSuccess?: () => void
}

const initialFormData: Publicador = {
  nomePrimeiro: '',
  nomeMeio: '',
  nomeUltimo: '',
  sufixo: '',
  etiqueta: '',
  contactoFamilia: '',
  genero: 'masculino',
  dataNascimento: '',
  telemovel: '',
  telefoneCasa: '',
  outroTelefone: '',
  email: '',
  morada: '',
  morada2: '',
  codigoPostal: '',
  cidade: '',
  latitude: undefined,
  longitude: undefined,
  dataBatismo: '',
  tipoPublicador: 'publicador_batizado',
  privilegioServico: 'nenhum',
  etiquetas: [],
  grupoCampo: '',
  grupoLimpeza: '',
  status: 'ativo',
  restricoes: [],
  observacoes: ''
}

const ICONE_ETIQUETA: { valor: string; preview: string }[] = [
  { valor: 'Tag', preview: '🏷️' },
  { valor: 'Key', preview: '🔑' },
  { valor: 'Users', preview: '👥' },
  { valor: 'Star', preview: '⭐' },
  { valor: 'AlertCircle', preview: '⚠️' },
  { valor: 'Sparkles', preview: '✨' },
]

export default function PublicadorForm({ open, onOpenChange, publicador, onSuccess }: PublicadorFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [formData, setFormData] = useState<Publicador>(initialFormData)
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    nome: true,
    pessoais: true,
    morada: false,
    espiritual: true,
    grupos: false,
    etiquetas: false,
    status: false
  })

  // Load etiquetas on mount
  useEffect(() => {
    const loadEtiquetas = async () => {
      try {
        const res = await fetch('/api/etiquetas')
        const data = await res.json()
        setEtiquetas(Array.isArray(data.etiquetas) ? data.etiquetas : [])
      } catch (error) {
        console.error('Erro ao carregar etiquetas:', error)
        setEtiquetas([])
      }
    }
    loadEtiquetas()
  }, [])

  // Initialize form when dialog opens
  const prevPublicadorRef = useRef<Publicador | null | undefined>(undefined)
  
  useEffect(() => {
    if (open && prevPublicadorRef.current !== publicador) {
      prevPublicadorRef.current = publicador
      
      if (publicador) {
        setFormData({
          nomePrimeiro: publicador.nomePrimeiro || '',
          nomeMeio: publicador.nomeMeio || '',
          nomeUltimo: publicador.nomeUltimo || '',
          sufixo: publicador.sufixo || '',
          etiqueta: publicador.etiqueta || '',
          contactoFamilia: publicador.contactoFamilia || '',
          genero: publicador.genero || 'masculino',
          dataNascimento: publicador.dataNascimento ? publicador.dataNascimento.split('T')[0] : '',
          telemovel: publicador.telemovel || '',
          telefoneCasa: publicador.telefoneCasa || '',
          outroTelefone: publicador.outroTelefone || '',
          email: publicador.email || '',
          morada: publicador.morada || '',
          morada2: publicador.morada2 || '',
          codigoPostal: publicador.codigoPostal || '',
          cidade: publicador.cidade || '',
          latitude: publicador.latitude,
          longitude: publicador.longitude,
          dataBatismo: publicador.dataBatismo ? publicador.dataBatismo.split('T')[0] : '',
          tipoPublicador: publicador.tipoPublicador || 'publicador_batizado',
          privilegioServico: publicador.privilegioServico || 'nenhum',
          etiquetas: publicador.etiquetas?.map(e => e.id) || [],
          grupoCampo: publicador.grupoCampo || '',
          grupoLimpeza: publicador.grupoLimpeza || '',
          status: publicador.status || 'ativo',
          restricoes: publicador.restricoes || [],
          observacoes: publicador.observacoes || ''
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [open, publicador])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSubmit = async () => {
    if (!formData.nomePrimeiro?.trim() || !formData.nomeUltimo?.trim()) {
      toast.error('Nome e Sobrenome são obrigatórios')
      return
    }

    setIsPending(true)
    try {
      const url = publicador?.id ? `/api/publicadores/${publicador.id}` : '/api/publicadores'
      const method = publicador?.id ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await res.json()
      
      if (res.ok) {
        toast.success(publicador?.id ? 'Publicador atualizado com sucesso!' : 'Publicador criado com sucesso!')
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.error || 'Erro ao salvar publicador')
      }
    } catch (error) {
      toast.error('Erro ao salvar publicador')
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const handleEtiquetaToggle = (etiquetaId: string) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: Array.isArray(prev.etiquetas) && prev.etiquetas.includes(etiquetaId)
        ? prev.etiquetas.filter(id => id !== etiquetaId)
        : [...(prev.etiquetas || []), etiquetaId]
    }))
  }

  const addRestricao = () => {
    setFormData(prev => ({
      ...prev,
      restricoes: [...(prev.restricoes || []), { tipo: 'outros', descricao: '', ativo: true }]
    }))
  }

  const removeRestricao = (index: number) => {
    setFormData(prev => ({
      ...prev,
      restricoes: prev.restricoes?.filter((_, i) => i !== index) || []
    }))
  }

  const updateRestricao = (index: number, field: 'tipo' | 'descricao', value: string) => {
    setFormData(prev => ({
      ...prev,
      restricoes: prev.restricoes?.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      ) || []
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5 text-amber-500" />
            {publicador?.id ? 'Editar Publicador' : 'Novo Publicador'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do publicador. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(95vh-180px)]">
          <div className="p-6 space-y-4">
            {/* Seção Nome */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('nome')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    Nome
                  </span>
                  {expandedSections.nome ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.nome && (
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomePrimeiro">Primeiro Nome *</Label>
                      <Input
                        id="nomePrimeiro"
                        value={formData.nomePrimeiro || ''}
                        onChange={(e) => setFormData({ ...formData, nomePrimeiro: e.target.value })}
                        placeholder="João"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nomeMeio">Nome do Meio</Label>
                      <Input
                        id="nomeMeio"
                        value={formData.nomeMeio || ''}
                        onChange={(e) => setFormData({ ...formData, nomeMeio: e.target.value })}
                        placeholder="Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nomeUltimo">Último Nome *</Label>
                      <Input
                        id="nomeUltimo"
                        value={formData.nomeUltimo || ''}
                        onChange={(e) => setFormData({ ...formData, nomeUltimo: e.target.value })}
                        placeholder="Santos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sufixo">Sufixo</Label>
                      <Input
                        id="sufixo"
                        value={formData.sufixo || ''}
                        onChange={(e) => setFormData({ ...formData, sufixo: e.target.value })}
                        placeholder="Jr, Sr"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="etiqueta">Etiqueta (Nome de Exibição)</Label>
                      <Input
                        id="etiqueta"
                        value={formData.etiqueta || ''}
                        onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                        placeholder="Como prefere ser chamado"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactoFamilia">Contacto de Família</Label>
                      <Input
                        id="contactoFamilia"
                        value={formData.contactoFamilia || ''}
                        onChange={(e) => setFormData({ ...formData, contactoFamilia: e.target.value })}
                        placeholder="Nome do contato familiar"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Seção Dados Pessoais */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('pessoais')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-500" />
                    Dados Pessoais
                  </span>
                  {expandedSections.pessoais ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.pessoais && (
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genero">Gênero *</Label>
                      <Select
                        value={formData.genero || 'masculino'}
                        onValueChange={(v) => setFormData({ ...formData, genero: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={formData.dataNascimento || ''}
                        onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telemovel">Telemóvel</Label>
                      <Input
                        id="telemovel"
                        value={formData.telemovel || ''}
                        onChange={(e) => setFormData({ ...formData, telemovel: e.target.value })}
                        placeholder="+351 912 345 678"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefoneCasa">Telefone Casa</Label>
                      <Input
                        id="telefoneCasa"
                        value={formData.telefoneCasa || ''}
                        onChange={(e) => setFormData({ ...formData, telefoneCasa: e.target.value })}
                        placeholder="+351 21 123 4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outroTelefone">Outro Telefone</Label>
                      <Input
                        id="outroTelefone"
                        value={formData.outroTelefone || ''}
                        onChange={(e) => setFormData({ ...formData, outroTelefone: e.target.value })}
                        placeholder="+351 96 123 4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Seção Morada */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('morada')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    Morada
                  </span>
                  {expandedSections.morada ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.morada && (
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="morada">Morada</Label>
                      <Input
                        id="morada"
                        value={formData.morada || ''}
                        onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                        placeholder="Rua, número, andar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="morada2">Morada 2</Label>
                      <Input
                        id="morada2"
                        value={formData.morada2 || ''}
                        onChange={(e) => setFormData({ ...formData, morada2: e.target.value })}
                        placeholder="Complemento"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="codigoPostal">Código Postal</Label>
                      <Input
                        id="codigoPostal"
                        value={formData.codigoPostal || ''}
                        onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                        placeholder="1234-567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade || ''}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        placeholder="Lisboa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude ?? ''}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="38.7223"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude ?? ''}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="-9.1393"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Seção Espiritual */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('espiritual')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    Dados Espirituais
                  </span>
                  {expandedSections.espiritual ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.espiritual && (
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataBatismo">Data de Batismo</Label>
                      <Input
                        id="dataBatismo"
                        type="date"
                        value={formData.dataBatismo || ''}
                        onChange={(e) => setFormData({ ...formData, dataBatismo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoPublicador">Tipo de Publicador</Label>
                      <Select
                        value={formData.tipoPublicador || 'publicador_batizado'}
                        onValueChange={(v) => setFormData({ ...formData, tipoPublicador: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_PUBLICADOR.map(tipo => (
                            <SelectItem key={tipo.valor} value={tipo.valor}>{tipo.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="privilegioServico">Privilégio de Serviço</Label>
                      <Select
                        value={formData.privilegioServico || 'nenhum'}
                        onValueChange={(v) => setFormData({ ...formData, privilegioServico: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIVILEGIOS_SERVICO.map(priv => (
                            <SelectItem key={priv.valor} value={priv.valor}>{priv.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Seção Grupos */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('grupos')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    Grupos
                  </span>
                  {expandedSections.grupos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.grupos && (
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grupoCampo">Grupo de Campo</Label>
                      <Input
                        id="grupoCampo"
                        value={formData.grupoCampo || ''}
                        onChange={(e) => setFormData({ ...formData, grupoCampo: e.target.value })}
                        placeholder="Grupo 1, Grupo A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grupoLimpeza">Grupo de Limpeza</Label>
                      <Input
                        id="grupoLimpeza"
                        value={formData.grupoLimpeza || ''}
                        onChange={(e) => setFormData({ ...formData, grupoLimpeza: e.target.value })}
                        placeholder="Equipa 1, Equipa A"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Seção Etiquetas */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('etiquetas')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    Etiquetas
                  </span>
                  {expandedSections.etiquetas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.etiquetas && (
                <CardContent className="pt-0">
                  {etiquetas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma etiqueta disponível. Crie etiquetas nas configurações.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {etiquetas.map(etiqueta => {
                        const isSelected = Array.isArray(formData.etiquetas) && formData.etiquetas.includes(etiqueta.id)
                        const iconInfo = ICONE_ETIQUETA.find(i => i.valor === etiqueta.icone)
                        return (
                          <Badge
                            key={etiqueta.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all hover:scale-105 ${isSelected ? 'text-white' : ''}`}
                            style={{
                              backgroundColor: isSelected ? etiqueta.cor : 'transparent',
                              borderColor: etiqueta.cor,
                              color: isSelected ? 'white' : etiqueta.cor
                            }}
                            onClick={() => handleEtiquetaToggle(etiqueta.id)}
                          >
                            <span className="mr-1">{iconInfo?.preview || '🏷️'}</span>
                            {etiqueta.nome}
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Seção Status e Restrições */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('status')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-500" />
                    Status e Restrições
                  </span>
                  {expandedSections.status ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.status && (
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status || 'ativo'}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_PUBLICADOR.map(st => (
                          <SelectItem key={st.valor} value={st.valor}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.cor }} />
                              {st.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Restrições</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addRestricao}>
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {formData.restricoes && formData.restricoes.length > 0 && (
                      <div className="space-y-3">
                        {formData.restricoes.map((restricao, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <Select
                              value={restricao.tipo}
                              onValueChange={(v) => updateRestricao(index, 'tipo', v)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_RESTRICAO.map(tipo => (
                                  <SelectItem key={tipo.valor} value={tipo.valor}>{tipo.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Descrição"
                              value={restricao.descricao}
                              onChange={(e) => updateRestricao(index, 'descricao', e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRestricao(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes || ''}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Notas adicionais sobre o publicador..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t bg-slate-50/50">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {publicador?.id ? 'Atualizar' : 'Criar'} Publicador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
