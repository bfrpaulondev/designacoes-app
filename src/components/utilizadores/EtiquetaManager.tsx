'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus, Edit, Trash2, Tag, Loader2, Palette, Shapes, Check
} from 'lucide-react'

// Ícones disponíveis para etiquetas
const ICONE_ETIQUETA = [
  { valor: 'Tag', label: 'Etiqueta', preview: '🏷️' },
  { valor: 'Key', label: 'Chave', preview: '🔑' },
  { valor: 'Home', label: 'Casa', preview: '🏠' },
  { valor: 'Users', label: 'Grupo', preview: '👥' },
  { valor: 'MapPin', label: 'Localização', preview: '📍' },
  { valor: 'Phone', label: 'Telefone', preview: '📞' },
  { valor: 'Mail', label: 'Email', preview: '📧' },
  { valor: 'Calendar', label: 'Calendário', preview: '📅' },
  { valor: 'Clock', label: 'Relógio', preview: '⏰' },
  { valor: 'Star', label: 'Estrela', preview: '⭐' },
  { valor: 'Heart', label: 'Coração', preview: '❤️' },
  { valor: 'AlertCircle', label: 'Alerta', preview: '⚠️' },
  { valor: 'CheckCircle', label: 'Confirmado', preview: '✅' },
  { valor: 'XCircle', label: 'Cancelado', preview: '❌' },
  { valor: 'Shield', label: 'Escudo', preview: '🛡️' },
  { valor: 'Zap', label: 'Rápido', preview: '⚡' },
  { valor: 'Flag', label: 'Bandeira', preview: '🚩' },
  { valor: 'Book', label: 'Livro', preview: '📖' },
  { valor: 'Briefcase', label: 'Trabalho', preview: '💼' },
  { valor: 'Building', label: 'Prédio', preview: '🏢' },
  { valor: 'Car', label: 'Carro', preview: '🚗' },
  { valor: 'Truck', label: 'Caminhão', preview: '🚚' },
  { valor: 'Wrench', label: 'Ferramenta', preview: '🔧' },
  { valor: 'Sparkles', label: 'Especial', preview: '✨' },
  { valor: 'UserX', label: 'Inativo', preview: '👤' },
  { valor: 'UserMinus', label: 'Removido', preview: '➖' },
  { valor: 'Ban', label: 'Proibido', preview: '🚫' },
  { valor: 'Lock', label: 'Bloqueado', preview: '🔒' },
  { valor: 'Unlock', label: 'Desbloqueado', preview: '🔓' },
  { valor: 'Eye', label: 'Visível', preview: '👁️' },
  { valor: 'EyeOff', label: 'Oculto', preview: '🙈' },
]

// Cores disponíveis para etiquetas
const CORES_ETIQUETA = [
  { valor: '#EF4444', label: 'Vermelho' },
  { valor: '#F97316', label: 'Laranja' },
  { valor: '#F59E0B', label: 'Âmbar' },
  { valor: '#EAB308', label: 'Amarelo' },
  { valor: '#84CC16', label: 'Lima' },
  { valor: '#22C55E', label: 'Verde' },
  { valor: '#10B981', label: 'Esmeralda' },
  { valor: '#14B8A6', label: 'Turquesa' },
  { valor: '#06B6D4', label: 'Ciano' },
  { valor: '#0EA5E9', label: 'Sky' },
  { valor: '#3B82F6', label: 'Azul' },
  { valor: '#6366F1', label: 'Índigo' },
  { valor: '#8B5CF6', label: 'Violeta' },
  { valor: '#A855F7', label: 'Púrpura' },
  { valor: '#D946EF', label: 'Fúcsia' },
  { valor: '#EC4899', label: 'Rosa' },
  { valor: '#F43F5E', label: 'Rosa Vermelho' },
  { valor: '#6B7280', label: 'Cinza' },
  { valor: '#78716C', label: 'Pedra' },
  { valor: '#71717A', label: 'Zinco' },
]

interface EtiquetaResponse {
  id: string
  nome: string
  icone: string
  cor: string
  descricao?: string
  ordem: number
  ativo: boolean
}

interface EtiquetaManagerProps {
  onRefresh?: () => void
}

export default function EtiquetaManager({ onRefresh }: EtiquetaManagerProps) {
  const [etiquetas, setEtiquetas] = useState<EtiquetaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEtiqueta, setSelectedEtiqueta] = useState<EtiquetaResponse | null>(null)
  const [etiquetaToDelete, setEtiquetaToDelete] = useState<EtiquetaResponse | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    nome: '',
    icone: 'Tag',
    cor: '#6B7280',
    descricao: ''
  })

  const loadEtiquetas = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/etiquetas')
      const data = await res.json()
      setEtiquetas(Array.isArray(data.etiquetas) ? data.etiquetas : [])
    } catch (error) {
      console.error('Erro ao carregar etiquetas:', error)
      toast.error('Erro ao carregar etiquetas')
      setEtiquetas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEtiquetas()
  }, [])

  const openNewDialog = () => {
    setSelectedEtiqueta(null)
    setFormData({
      nome: '',
      icone: 'Tag',
      cor: '#6B7280',
      descricao: ''
    })
    setDialogOpen(true)
  }

  const openEditDialog = (etiqueta: EtiquetaResponse) => {
    setSelectedEtiqueta(etiqueta)
    setFormData({
      nome: etiqueta.nome,
      icone: etiqueta.icone,
      cor: etiqueta.cor,
      descricao: etiqueta.descricao || ''
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setSaving(true)
    try {
      const url = selectedEtiqueta 
        ? `/api/etiquetas/${selectedEtiqueta.id}` 
        : '/api/etiquetas'
      const method = selectedEtiqueta ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          icone: formData.icone,
          cor: formData.cor,
          descricao: formData.descricao.trim() || undefined
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(selectedEtiqueta ? 'Etiqueta atualizada!' : 'Etiqueta criada!')
        setDialogOpen(false)
        loadEtiquetas()
        onRefresh?.()
      } else {
        toast.error(data.error || 'Erro ao salvar etiqueta')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar etiqueta')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = (etiqueta: EtiquetaResponse) => {
    setEtiquetaToDelete(etiqueta)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!etiquetaToDelete) return

    setSaving(true)
    try {
      const res = await fetch(`/api/etiquetas/${etiquetaToDelete.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Etiqueta excluída!')
        setDeleteDialogOpen(false)
        setEtiquetaToDelete(null)
        loadEtiquetas()
        onRefresh?.()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao excluir etiqueta')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir etiqueta')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Etiquetas</h2>
          <p className="text-slate-500">{etiquetas.length} etiquetas cadastradas</p>
        </div>
        <Button
          onClick={openNewDialog}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Etiqueta
        </Button>
      </div>

      {/* Etiquetas Grid */}
      {etiquetas.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Tag className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">Nenhuma etiqueta cadastrada</p>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Etiqueta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {etiquetas.map((etiqueta) => {
            const iconInfo = ICONE_ETIQUETA.find(i => i.valor === etiqueta.icone)
            const colorInfo = CORES_ETIQUETA.find(c => c.valor === etiqueta.cor)

            return (
              <Card key={etiqueta.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: etiqueta.cor }}
                      >
                        {iconInfo?.preview || '🏷️'}
                      </div>
                      <div>
                        <CardTitle className="text-base">{etiqueta.nome}</CardTitle>
                        <p className="text-xs text-slate-500">{colorInfo?.label || 'Cor personalizada'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(etiqueta)}
                        className="hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteConfirm(etiqueta)}
                        className="hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {etiqueta.descricao && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-slate-500">{etiqueta.descricao}</p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              {selectedEtiqueta ? 'Editar Etiqueta' : 'Nova Etiqueta'}
            </DialogTitle>
            <DialogDescription>
              Configure o nome, ícone e cor da etiqueta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Chave do Salão"
              />
            </div>

            {/* Ícone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shapes className="w-4 h-4" />
                Ícone
              </Label>
              <ScrollArea className="h-40 rounded-md border p-3">
                <div className="grid grid-cols-6 gap-2">
                  {ICONE_ETIQUETA.map((icone) => (
                    <button
                      key={icone.valor}
                      type="button"
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 relative ${
                        formData.icone === icone.valor
                          ? 'bg-amber-100 ring-2 ring-amber-500'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                      onClick={() => setFormData({ ...formData, icone: icone.valor })}
                    >
                      {icone.preview}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Cor
              </Label>
              <div className="grid grid-cols-10 gap-2">
                {CORES_ETIQUETA.map((cor) => (
                  <button
                    key={cor.valor}
                    type="button"
                    className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
                      formData.cor === cor.valor ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                    }`}
                    style={{ backgroundColor: cor.valor }}
                    onClick={() => setFormData({ ...formData, cor: cor.valor })}
                    title={cor.label}
                  >
                    {formData.cor === cor.valor && (
                      <Check className="w-4 h-4 mx-auto text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Pré-visualização</Label>
              <div className="p-4 bg-slate-50 rounded-lg flex items-center justify-center">
                <Badge
                  className="text-white px-4 py-2 text-sm"
                  style={{
                    backgroundColor: formData.cor,
                  }}
                >
                  <span className="mr-2">
                    {ICONE_ETIQUETA.find(i => i.valor === formData.icone)?.preview}
                  </span>
                  {formData.nome || 'Nome da Etiqueta'}
                </Badge>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Uma breve descrição sobre esta etiqueta..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedEtiqueta ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a etiqueta <strong>{etiquetaToDelete?.nome}</strong>?
              Esta ação não pode ser desfeita. Publicadores com esta etiqueta não serão afetados,
              mas a etiqueta será removida deles.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
