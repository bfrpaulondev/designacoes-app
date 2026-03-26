'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { STATUS_PUBLICADOR, TIPOS_PUBLICADOR, PRIVILEGIOS_SERVICO } from '@/lib/constants'
import PublicadorForm from './PublicadorForm'
import {
  Search, Plus, Edit, Trash2, Users, Phone, Mail, MapPin, Calendar,
  BookOpen, Tag, Crown, Star, Shield, AlertCircle, Eye, Filter, X
} from 'lucide-react'

interface EtiquetaResponse {
  id: string
  nome: string
  icone: string
  cor: string
  descricao?: string
  ordem: number
  ativo: boolean
}

interface PublicadorResponse {
  id: string
  nomeCompleto: string
  nomePrimeiro?: string
  nomeMeio?: string
  nomeUltimo?: string
  sufixo?: string
  etiqueta?: string
  contactoFamilia?: string
  genero: string
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
  tipoPublicador: string
  privilegioServico: string
  privilegios: { id: string; nome: string }[]
  etiquetas: { id: string; nome: string; icone: string; cor: string }[]
  grupoCampo?: string
  grupoLimpeza?: string
  status: string
  restricoes: { tipo: string; descricao: string; ativo: boolean }[]
  observacoes?: string
  foto?: string
}

const ICONE_ETIQUETA: { valor: string; label: string; preview: string }[] = [
  { valor: 'Tag', label: 'Etiqueta', preview: '🏷️' },
  { valor: 'Key', label: 'Chave', preview: '🔑' },
  { valor: 'Users', label: 'Grupo', preview: '👥' },
  { valor: 'Star', label: 'Estrela', preview: '⭐' },
  { valor: 'AlertCircle', label: 'Alerta', preview: '⚠️' },
  { valor: 'Sparkles', label: 'Especial', preview: '✨' },
]

interface PublicadorListProps {
  onRefresh?: () => void
}

export default function PublicadorList({ onRefresh }: PublicadorListProps) {
  const [publicadores, setPublicadores] = useState<PublicadorResponse[]>([])
  const [etiquetas, setEtiquetas] = useState<EtiquetaResponse[]>([])
  const [gruposCampo, setGruposCampo] = useState<string[]>([])
  const [gruposLimpeza, setGruposLimpeza] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterGenero, setFilterGenero] = useState('todos')
  const [filterEtiqueta, setFilterEtiqueta] = useState('todos')
  const [filterGrupoCampo, setFilterGrupoCampo] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)

  // Dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [selectedPublicador, setSelectedPublicador] = useState<PublicadorResponse | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [publicadorToDelete, setPublicadorToDelete] = useState<PublicadorResponse | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pubRes, etqRes] = await Promise.all([
        fetch('/api/publicadores'),
        fetch('/api/etiquetas')
      ])
      
      const pubData = await pubRes.json()
      const etqData = await etqRes.json()
      
      setPublicadores(Array.isArray(pubData.publicadores) ? pubData.publicadores : [])
      setEtiquetas(Array.isArray(etqData.etiquetas) ? etqData.etiquetas : [])
      
      // Extrair grupos únicos dos publicadores
      const gruposC = new Set<string>()
      const gruposL = new Set<string>()
      if (Array.isArray(pubData.publicadores)) {
        pubData.publicadores.forEach((p: PublicadorResponse) => {
          if (p.grupoCampo) gruposC.add(p.grupoCampo)
          if (p.grupoLimpeza) gruposL.add(p.grupoLimpeza)
        })
      }
      setGruposCampo(Array.from(gruposC).sort())
      setGruposLimpeza(Array.from(gruposL).sort())
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar publicadores')
      setPublicadores([])
      setEtiquetas([])
      setGruposCampo([])
      setGruposLimpeza([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter publicadores
  const filteredPublicadores = publicadores.filter(p => {
    const matchSearch = search === '' ||
      p.nomeCompleto.toLowerCase().includes(search.toLowerCase()) ||
      (p.email?.toLowerCase().includes(search.toLowerCase())) ||
      (p.telemovel?.includes(search)) ||
      (p.cidade?.toLowerCase().includes(search.toLowerCase()))

    const matchStatus = filterStatus === 'todos' || p.status === filterStatus
    const matchGenero = filterGenero === 'todos' || p.genero === filterGenero
    const matchEtiqueta = filterEtiqueta === 'todos' ||
      Array.isArray(p.etiquetas) && p.etiquetas.some(e => e.id === filterEtiqueta)
    const matchGrupoCampo = filterGrupoCampo === 'todos' || p.grupoCampo === filterGrupoCampo
    const matchTipo = filterTipo === 'todos' || p.tipoPublicador === filterTipo

    return matchSearch && matchStatus && matchGenero && matchEtiqueta && matchGrupoCampo && matchTipo
  }).sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto))

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('todos')
    setFilterGenero('todos')
    setFilterEtiqueta('todos')
    setFilterGrupoCampo('todos')
    setFilterTipo('todos')
  }

  const hasActiveFilters = search || filterStatus !== 'todos' || filterGenero !== 'todos' ||
    filterEtiqueta !== 'todos' || filterGrupoCampo !== 'todos' || filterTipo !== 'todos'

  const handleOpenForm = (publicador?: PublicadorResponse) => {
    setSelectedPublicador(publicador || null)
    setFormOpen(true)
  }

  const handleViewDetails = (publicador: PublicadorResponse) => {
    setSelectedPublicador(publicador)
    setDetailsOpen(true)
  }

  const handleDeleteConfirm = (publicador: PublicadorResponse) => {
    setPublicadorToDelete(publicador)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!publicadorToDelete) return

    try {
      const res = await fetch(`/api/publicadores/${publicadorToDelete.id}`, {
        method: 'DELETE'
      })
      const result = await res.json()
      
      if (res.ok) {
        toast.success('Publicador excluído com sucesso')
        loadData()
        onRefresh?.()
      } else {
        toast.error(result.error || 'Erro ao excluir publicador')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir publicador')
    } finally {
      setDeleteConfirmOpen(false)
      setPublicadorToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    setFormOpen(false)
    setSelectedPublicador(null)
    loadData()
    onRefresh?.()
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = STATUS_PUBLICADOR.find(s => s.valor === status)
    return (
      <Badge
        variant="outline"
        style={{
          backgroundColor: `${statusInfo?.cor || '#6B7280'}15`,
          color: statusInfo?.cor || '#6B7280',
          borderColor: statusInfo?.cor || '#6B7280'
        }}
      >
        {statusInfo?.label || status}
      </Badge>
    )
  }

  const getPrivilegioIcon = (nome: string) => {
    switch (nome) {
      case 'Ancião': return <Crown className="w-3 h-3" />
      case 'Servo Ministerial': return <Shield className="w-3 h-3" />
      case 'Pioneiro Regular':
      case 'Pioneiro Auxiliar': return <Star className="w-3 h-3" />
      default: return null
    }
  }

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-PT')
  }

  const getTipoLabel = (tipo: string) => {
    return TIPOS_PUBLICADOR.find(t => t.valor === tipo)?.label || tipo
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lista de Publicadores</h2>
          <p className="text-slate-500">{filteredPublicadores.length} de {publicadores.length} publicadores</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Publicador
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou cidade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    {STATUS_PUBLICADOR.map(s => (
                      <SelectItem key={s.valor} value={s.valor}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.cor }} />
                          {s.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterGenero} onValueChange={setFilterGenero}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterEtiqueta} onValueChange={setFilterEtiqueta}>
                  <SelectTrigger>
                    <SelectValue placeholder="Etiqueta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Etiquetas</SelectItem>
                    {etiquetas.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: e.cor }}
                          />
                          {e.nome}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterGrupoCampo} onValueChange={setFilterGrupoCampo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Grupo Campo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Grupos</SelectItem>
                    {gruposCampo.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    {TIPOS_PUBLICADOR.map(t => (
                      <SelectItem key={t.valor} value={t.valor}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {filteredPublicadores.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">
              {hasActiveFilters
                ? 'Nenhum publicador encontrado com os filtros aplicados'
                : 'Nenhum publicador cadastrado'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            ) : (
              <Button onClick={() => handleOpenForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Publicador
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-3 pr-4">
            {filteredPublicadores.map((publicador) => (
              <Card
                key={publicador.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600">
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white font-medium">
                        {getInitials(publicador.nomeCompleto)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800 truncate">
                          {publicador.etiqueta || publicador.nomeCompleto}
                        </h3>
                        {getStatusBadge(publicador.status)}
                        {Array.isArray(publicador.restricoes) && publicador.restricoes.length > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Restrições
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.isArray(publicador.etiquetas) && publicador.etiquetas.map(e => {
                          const iconInfo = ICONE_ETIQUETA.find(i => i.valor === e.icone)
                          return (
                            <Badge
                              key={e.id}
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: e.cor,
                                color: e.cor
                              }}
                            >
                              {iconInfo?.preview} {e.nome}
                            </Badge>
                          )
                        })}
                        {publicador.privilegioServico && publicador.privilegioServico !== 'nenhum' && (
                          <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                            {getPrivilegioIcon(publicador.privilegioServico)}
                            <span className="ml-1">
                              {PRIVILEGIOS_SERVICO.find(p => p.valor === publicador.privilegioServico)?.label || publicador.privilegioServico}
                            </span>
                          </Badge>
                        )}
                        {publicador.grupoCampo && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {publicador.grupoCampo}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                        {publicador.telemovel && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {publicador.telemovel}
                          </span>
                        )}
                        {publicador.email && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3" />
                            {publicador.email}
                          </span>
                        )}
                        {publicador.cidade && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {publicador.cidade}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(publicador)}
                              className="hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver Detalhes</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenForm(publicador)}
                              className="hover:bg-amber-50 hover:text-amber-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteConfirm(publicador)}
                              className="hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Form Dialog */}
      <PublicadorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        publicador={selectedPublicador}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Detalhes do Publicador
            </DialogTitle>
          </DialogHeader>
          {selectedPublicador && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600">
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xl font-medium">
                    {getInitials(selectedPublicador.nomeCompleto)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedPublicador.nomeCompleto}</h3>
                  {selectedPublicador.etiqueta && (
                    <p className="text-slate-500">({selectedPublicador.etiqueta})</p>
                  )}
                  <div className="flex gap-2 mt-1">
                    {getStatusBadge(selectedPublicador.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500">Dados Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Gênero:</strong> {selectedPublicador.genero === 'masculino' ? 'Masculino' : 'Feminino'}</p>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <strong>Nascimento:</strong> {formatDate(selectedPublicador.dataNascimento)}
                    </p>
                    {selectedPublicador.telemovel && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <strong>Telemóvel:</strong> {selectedPublicador.telemovel}
                      </p>
                    )}
                    {selectedPublicador.email && (
                      <p className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <strong>Email:</strong> {selectedPublicador.email}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500">Dados Espirituais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <strong>Batismo:</strong> {formatDate(selectedPublicador.dataBatismo)}
                    </p>
                    <p><strong>Tipo:</strong> {getTipoLabel(selectedPublicador.tipoPublicador)}</p>
                    <p><strong>Privilégio:</strong> {
                      PRIVILEGIOS_SERVICO.find(p => p.valor === selectedPublicador.privilegioServico)?.label || 'Nenhum'
                    }</p>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500">Morada</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedPublicador.morada && <p className="flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedPublicador.morada}</p>}
                    {selectedPublicador.morada2 && <p>{selectedPublicador.morada2}</p>}
                    {(selectedPublicador.codigoPostal || selectedPublicador.cidade) && (
                      <p>{selectedPublicador.codigoPostal} {selectedPublicador.cidade}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500">Grupos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Grupo de Campo:</strong> {selectedPublicador.grupoCampo || '-'}</p>
                    <p><strong>Grupo de Limpeza:</strong> {selectedPublicador.grupoLimpeza || '-'}</p>
                  </CardContent>
                </Card>
              </div>

              {Array.isArray(selectedPublicador.etiquetas) && selectedPublicador.etiquetas.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Etiquetas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPublicador.etiquetas.map(e => {
                      const iconInfo = ICONE_ETIQUETA.find(i => i.valor === e.icone)
                      return (
                        <Badge
                          key={e.id}
                          style={{
                            backgroundColor: e.cor,
                            color: 'white'
                          }}
                        >
                          {iconInfo?.preview} {e.nome}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {Array.isArray(selectedPublicador.restricoes) && selectedPublicador.restricoes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-orange-700">Restrições</h4>
                  <div className="space-y-2">
                    {selectedPublicador.restricoes.map((r, i) => (
                      <div key={i} className="p-2 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                        <strong>{r.tipo}:</strong> {r.descricao || 'Sem descrição'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPublicador.observacoes && (
                <div>
                  <h4 className="font-medium mb-2">Observações</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {selectedPublicador.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setDetailsOpen(false)
              handleOpenForm(selectedPublicador!)
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o publicador <strong>{publicadorToDelete?.nomeCompleto}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
