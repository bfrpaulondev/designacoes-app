'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type Publicador, type Parte, type SemanaDesignacao, type User } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Users, BookOpen, Calendar, Settings, LogOut, Plus, Edit, Trash2, Search,
  Download, FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  Clock, UserCheck, Building2, Menu, X, Eye, EyeOff, History, Sparkles,
  TrendingUp, Star, Award, Crown, Shield, Heart, Map, LayoutDashboard, Tag
} from 'lucide-react'

// Import new components
import PublicadorList from '@/components/utilizadores/PublicadorList'
import EtiquetaManager from '@/components/utilizadores/EtiquetaManager'
import MapaPublicadores from '@/components/utilizadores/MapaPublicadores'

// Utility functions
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; class?: string }> = {
    ativo: { label: 'Ativo', variant: 'default', class: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    inativo: { label: 'Inativo', variant: 'secondary', class: 'bg-slate-500/10 text-slate-600 border-slate-200' },
    mudou: { label: 'Mudou', variant: 'outline', class: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    faleceu: { label: 'Faleceu', variant: 'destructive' },
    restricto: { label: 'Restricto', variant: 'destructive', class: 'bg-red-500/10 text-red-700 border-red-200' }
  }
  const config = statusConfig[status] || { label: status, variant: 'outline' }
  return <Badge variant={config.variant} className={config.class}>{config.label}</Badge>
}

const getTipoParteBadge = (tipo: string) => {
  const tipoConfig: Record<string, { label: string; class: string }> = {
    presidente: { label: 'Presidente', class: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    conselheiro: { label: 'Conselheiro', class: 'bg-blue-500/10 text-blue-700 border-blue-200' },
    leitura: { label: 'Leitura', class: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    demonstracao: { label: 'Demonstração', class: 'bg-purple-500/10 text-purple-700 border-purple-200' },
    discurso: { label: 'Discurso', class: 'bg-orange-500/10 text-orange-700 border-orange-200' },
    outros: { label: 'Outros', class: 'bg-slate-500/10 text-slate-600 border-slate-200' }
  }
  const config = tipoConfig[tipo] || tipoConfig.outros
  return <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.class}`}>{config.label}</span>
}

const getPrivilegioIcon = (nome: string) => {
  switch (nome) {
    case 'Ancião': return <Crown className="w-3 h-3" />
    case 'Servo Ministerial': return <Shield className="w-3 h-3" />
    case 'Pioneiro Regular':
    case 'Pioneiro Auxiliar': return <Star className="w-3 h-3" />
    case 'Superintendente Viajante': return <TrendingUp className="w-3 h-3" />
    default: return null
  }
}

// Icons
const ChevronRight = ChevronDown
const ChevronLeft = ChevronUp

// Login Component
function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState<boolean | null>(null)
  
  const { setUser, setCurrentView } = useAppStore()
  
  useEffect(() => {
    fetch('/api/init')
      .then(res => res.json())
      .then(data => setInitialized(data.initialized))
      .catch(() => setInitialized(false))
  }, [])
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login')
        return
      }
      
      setUser(data.user)
      setCurrentView('dashboard')
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }
  
  const handleInit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/init', { method: 'POST' })
      const data = await res.json()
      if (data.adminCredentials) {
        setEmail(data.adminCredentials.email)
        setPassword(data.adminCredentials.password)
        setInitialized(true)
        toast.success('Sistema inicializado! Use as credenciais abaixo para entrar.')
      }
    } catch {
      toast.error('Erro ao inicializar sistema')
    } finally {
      setLoading(false)
    }
  }
  
  if (initialized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }
  
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
            <CardDescription className="text-slate-300">
              O sistema precisa ser inicializado. Clique abaixo para começar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInit} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25">
              {loading ? 'Inicializando...' : 'Inicializar Sistema'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Designações</CardTitle>
          <CardDescription className="text-slate-300">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Sidebar Content Component
interface SidebarContentProps {
  collapsed: boolean
  currentView: string
  setCurrentView: (view: string) => void
  user: User | null
  config: { nomeCongregacao: string; logo: string | null }
  setMobileOpen: (open: boolean) => void
}

function SidebarContent({ collapsed, currentView, setCurrentView, user, config, setMobileOpen }: SidebarContentProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'utilizadores', label: 'Utilizadores', icon: Users },
    { id: 'partes', label: 'Partes', icon: BookOpen },
    { id: 'designacoes', label: 'Designações', icon: FileText },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, adminOnly: true }
  ]
  
  const filteredItems = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  )
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25">
            <Users className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="font-semibold text-white truncate">{config.nomeCongregacao}</h2>
              <p className="text-xs text-slate-400">Sistema de Designações</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        {filteredItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-white/5 ${
              currentView === item.id ? 'bg-white/10 text-white border-l-2 border-amber-500' : ''
            } ${collapsed ? 'px-3' : ''}`}
            onClick={() => {
              setCurrentView(item.id)
              setMobileOpen(false)
            }}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role === 'admin' ? 'Administrador' : 'Designador'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Sidebar Component
function Sidebar() {
  const { currentView, setCurrentView, user, config } = useAppStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white hover:bg-slate-700"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
      
      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-64 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <SidebarContent 
              collapsed={false}
              currentView={currentView}
              setCurrentView={setCurrentView}
              user={user}
              config={config}
              setMobileOpen={setMobileOpen}
            />
          </aside>
        </div>
      )}
      
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col transition-all duration-300 relative ${collapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent 
          collapsed={collapsed}
          currentView={currentView}
          setCurrentView={setCurrentView}
          user={user}
          config={config}
          setMobileOpen={setMobileOpen}
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-slate-800 border border-white/10 text-white hover:bg-slate-700 rounded-full w-6 h-6 p-0 hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>
      </aside>
    </>
  )
}

// Dashboard Component
function Dashboard() {
  const { publicadores, semanas, setCurrentView, setPublicadores, setSemanas } = useAppStore()
  
  // Carregar dados ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pubRes, semRes] = await Promise.all([
          fetch('/api/publicadores'),
          fetch('/api/semanas')
        ])
        const pubData = await pubRes.json()
        const semData = await semRes.json()
        
        if (Array.isArray(pubData.publicadores)) {
          setPublicadores(pubData.publicadores)
        }
        if (Array.isArray(semData.semanas)) {
          setSemanas(semData.semanas)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    loadData()
  }, [setPublicadores, setSemanas])
  
  const stats = {
    totalPublicadores: Array.isArray(publicadores) ? publicadores.filter(p => p.status === 'ativo').length : 0,
    anciaos: Array.isArray(publicadores) ? publicadores.filter(p => p.status === 'ativo' && Array.isArray(p.privilegios) && p.privilegios.some(priv => priv.nome === 'Ancião')).length : 0,
    servos: Array.isArray(publicadores) ? publicadores.filter(p => p.status === 'ativo' && Array.isArray(p.privilegios) && p.privilegios.some(priv => priv.nome === 'Servo Ministerial')).length : 0,
    pioneiros: Array.isArray(publicadores) ? publicadores.filter(p => p.status === 'ativo' && Array.isArray(p.privilegios) && p.privilegios.some(priv => priv.nome && priv.nome.includes('Pioneiro'))).length : 0,
    semanasPendentes: Array.isArray(semanas) ? semanas.filter(s => s.status === 'rascunho').length : 0
  }
  
  const proximasSemanas = Array.isArray(semanas) 
    ? semanas
        .filter(s => new Date(s.dataInicio) >= new Date())
        .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
        .slice(0, 3)
    : []
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Visão geral do sistema de designações</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" onClick={() => setCurrentView('utilizadores')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">Publicadores Ativos</CardTitle>
            <Users className="h-4 w-4 text-emerald-200 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPublicadores}</div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white" onClick={() => setCurrentView('utilizadores')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">Anciãos e Servos</CardTitle>
            <Crown className="h-4 w-4 text-amber-200 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.anciaos + stats.servos}</div>
            <p className="text-xs text-amber-200 mt-1">{stats.anciaos} anciãos, {stats.servos} servos</p>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white" onClick={() => setCurrentView('utilizadores')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Pioneiros</CardTitle>
            <Star className="h-4 w-4 text-purple-200 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pioneiros}</div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white" onClick={() => setCurrentView('designacoes')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Semanas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-blue-200 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.semanasPendentes}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Próximas Semanas
            </CardTitle>
            <CardDescription>Semanas com designações pendentes ou recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {proximasSemanas.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma semana cadastrada</p>
                <Button className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" onClick={() => setCurrentView('designacoes')}>
                  Criar Designação
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {proximasSemanas.map((semana) => (
                  <div key={semana.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-amber-50 hover:to-amber-100 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {formatDateShort(semana.dataInicio)} - {formatDateShort(semana.dataFim)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {semana.designacoes.length} designações
                      </p>
                    </div>
                    <Badge variant={semana.status === 'finalizada' ? 'default' : 'secondary'} className={semana.status === 'finalizada' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}>
                      {semana.status === 'finalizada' ? 'Finalizada' : 'Rascunho'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>Acesso rápido às funções principais</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start gap-3 h-12 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors" onClick={() => setCurrentView('designacoes')}>
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-amber-600" />
              </div>
              Nova Designação
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors" onClick={() => setCurrentView('utilizadores')>>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              Gerenciar Utilizadores
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors" onClick={() => setCurrentView('partes')}>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              Configurar Partes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Utilizadores View with Tabs
function UtilizadoresView() {
  const [activeTab, setActiveTab] = useState('lista')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Utilizadores</h1>
        <p className="text-slate-500">Gerencie os utilizadores da congregação</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="mapa" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Mapa
          </TabsTrigger>
          <TabsTrigger value="etiquetas" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Etiquetas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-6">
          <PublicadorList />
        </TabsContent>

        <TabsContent value="mapa" className="mt-6">
          <MapaPublicadores />
        </TabsContent>

        <TabsContent value="etiquetas" className="mt-6">
          <EtiquetaManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Partes View
function PartesView() {
  const { partes, setPartes } = useAppStore()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingParte, setEditingParte] = useState<Parte | null>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracaoMinutos: 5,
    numParticipantes: 1,
    tipo: 'outros',
    sala: 'ambas',
    privilegiosMinimos: '',
    ativo: true
  })

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      if (!mounted) return
      
      try {
        const res = await fetch('/api/partes')
        if (!mounted) return
        
        const data = await res.json()
        setPartes(data.partes || [])
      } catch {
        if (mounted) {
          toast.error('Erro ao carregar partes')
        }
      }
    }
    
    loadData()
    
    return () => {
      mounted = false
    }
  }, [setPartes])

  const filteredPartes = partes.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase())
  )

  const openNewDialog = () => {
    setEditingParte(null)
    setFormData({
      nome: '',
      descricao: '',
      duracaoMinutos: 5,
      numParticipantes: 1,
      tipo: 'outros',
      sala: 'ambas',
      privilegiosMinimos: '',
      ativo: true
    })
    setDialogOpen(true)
  }

  const openEditDialog = (parte: Parte) => {
    setEditingParte(parte)
    setFormData({
      nome: parte.nome,
      descricao: parte.descricao || '',
      duracaoMinutos: parte.duracaoMinutos,
      numParticipantes: parte.numParticipantes,
      tipo: parte.tipo,
      sala: parte.sala,
      privilegiosMinimos: parte.privilegiosMinimos || '',
      ativo: parte.ativo
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    try {
      const url = editingParte ? `/api/partes/${editingParte.id}` : '/api/partes'
      const method = editingParte ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar')
        return
      }
      
      toast.success(editingParte ? 'Parte atualizada!' : 'Parte criada!')
      setDialogOpen(false)
      
      // Reload
      const partesRes = await fetch('/api/partes')
      const partesData = await partesRes.json()
      setPartes(partesData.partes || [])
    } catch {
      toast.error('Erro ao salvar parte')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta parte?')) return
    
    try {
      await fetch(`/api/partes/${id}`, { method: 'DELETE' })
      toast.success('Parte excluída')
      
      const res = await fetch('/api/partes')
      const data = await res.json()
      setPartes(data.partes || [])
    } catch {
      toast.error('Erro ao excluir parte')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Partes</h1>
          <p className="text-slate-500">Configure as partes do programa</p>
        </div>
        <Button onClick={openNewDialog} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Parte
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar partes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="divide-y divide-slate-100">
              {filteredPartes.map((parte) => (
                <div key={parte.id} className="p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-amber-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800">{parte.nome}</h3>
                        {getTipoParteBadge(parte.tipo)}
                        {!parte.ativo && (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-500">Inativo</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>{parte.duracaoMinutos} min</span>
                        <span>{parte.numParticipantes} participante(s)</span>
                        <span>Sala: {parte.sala === 'ambas' ? 'Ambas' : parte.sala === 'principal' ? 'Principal' : 'B'}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(parte)} className="hover:bg-amber-100 hover:text-amber-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(parte.id)} className="hover:bg-red-100 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPartes.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Nenhuma parte encontrada
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingParte ? 'Editar Parte' : 'Nova Parte'}</DialogTitle>
            <DialogDescription>
              Configure os detalhes da parte
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracaoMinutos">Duração (min)</Label>
                <Input
                  id="duracaoMinutos"
                  type="number"
                  min="1"
                  value={formData.duracaoMinutos}
                  onChange={(e) => setFormData({ ...formData, duracaoMinutos: parseInt(e.target.value) || 5 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numParticipantes">Participantes</Label>
                <Input
                  id="numParticipantes"
                  type="number"
                  min="1"
                  max="4"
                  value={formData.numParticipantes}
                  onChange={(e) => setFormData({ ...formData, numParticipantes: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presidente">Presidente</SelectItem>
                    <SelectItem value="conselheiro">Conselheiro</SelectItem>
                    <SelectItem value="leitura">Leitura</SelectItem>
                    <SelectItem value="demonstracao">Demonstração</SelectItem>
                    <SelectItem value="discurso">Discurso</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sala">Sala</Label>
                <Select value={formData.sala} onValueChange={(v) => setFormData({ ...formData, sala: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambas">Ambas</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="b">Sala B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked as boolean })}
              />
              <Label htmlFor="ativo">Parte ativa</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-amber-600">
              {editingParte ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Designações View
function DesignacoesView() {
  const { semanas, setSemanas, selectedSemana, setSelectedSemana, publicadores, partes } = useAppStore()
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      if (!mounted) return
      
      try {
        const res = await fetch('/api/semanas')
        if (!mounted) return
        
        const data = await res.json()
        setSemanas(data.semanas || [])
      } catch {
        if (mounted) {
          toast.error('Erro ao carregar designações')
        }
      }
    }
    
    loadData()
    
    return () => {
      mounted = false
    }
  }, [setSemanas])

  const filteredSemanas = semanas.filter(s => 
    s.status.includes(search) || 
    formatDateShort(s.dataInicio).includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Designações</h1>
          <p className="text-slate-500">Gerencie as designações semanais</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Semana
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar semanas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="divide-y divide-slate-100">
              {filteredSemanas.map((semana) => (
                <div key={semana.id} className="p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-amber-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">
                          {formatDateShort(semana.dataInicio)} - {formatDateShort(semana.dataFim)}
                        </h3>
                        <Badge variant={semana.status === 'finalizada' ? 'default' : 'secondary'} 
                          className={semana.status === 'finalizada' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}>
                          {semana.status === 'finalizada' ? 'Finalizada' : 'Rascunho'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {semana.designacoes.length} designações
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="hover:bg-amber-100 hover:text-amber-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredSemanas.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Nenhuma semana encontrada
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// Configurações View
function ConfiguracoesView() {
  const { config, setConfig, user } = useAppStore()
  const [formData, setFormData] = useState({
    nomeCongregacao: config.nomeCongregacao,
    emailNotificacoes: ''
  })

  const handleSave = async () => {
    setConfig({ ...config, nomeCongregacao: formData.nomeCongregacao })
    toast.success('Configurações salvas!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500">Configure o sistema de designações</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              Congregação
            </CardTitle>
            <CardDescription>Informações da congregação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCongregacao">Nome da Congregação</Label>
              <Input
                id="nomeCongregacao"
                value={formData.nomeCongregacao}
                onChange={(e) => setFormData({ ...formData, nomeCongregacao: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-amber-600">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-500" />
              Usuário Logado
            </CardTitle>
            <CardDescription>Informações do usuário atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <p className="text-slate-700">{user?.name}</p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-slate-700">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                {user?.role === 'admin' ? 'Administrador' : 'Designador'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main App Component
export default function App() {
  const { user, currentView, setCurrentView } = useAppStore()

  useEffect(() => {
    if (!user) {
      setCurrentView('login')
    }
  }, [user, setCurrentView])

  if (!user || currentView === 'login') {
    return <LoginScreen />
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'utilizadores':
        return <UtilizadoresView />
      case 'partes':
        return <PartesView />
      case 'designacoes':
        return <DesignacoesView />
      case 'configuracoes':
        return <ConfiguracoesView />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}
