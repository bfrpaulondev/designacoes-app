import { useState, useEffect } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Collapse,
} from '@mui/material'
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  Label as LabelIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Event as EventIcon,
  BarChart as ChartIcon,
  Assignment as ReportIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  TrendingUp as ActivityIcon,
  Schedule as ScheduleIcon,
  Block as BlockIcon,
} from '@mui/icons-material'
import Login from './pages/Login'
import Publicadores from './pages/Publicadores'
import Etiquetas from './pages/Etiquetas'
import MapaGrupos from './pages/MapaGrupos'
import Semanas from './pages/Semanas'
import Configuracoes from './pages/Configuracoes'
import Estatisticas from './pages/Estatisticas'
import RelatoriosCampo from './pages/RelatoriosCampo'
import Atividades from './pages/Atividades'
import HistoricoDesignacoes from './pages/HistoricoDesignacoes'
import ExportarDados from './pages/ExportarDados'
import Programacao from './pages/Programacao'
import Ausencias from './pages/Ausencias'


const drawerWidth = 260

interface User {
  id: string
  email: string
  name: string
  role: string
}

function App() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState('publicadores')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [pessoasOpen, setPessoasOpen] = useState(true)
  const [relatoriosOpen, setRelatoriosOpen] = useState(false)
  const [programacaoOpen, setProgramacaoOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setAnchorEl(null)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNavClick = (view: string) => {
    setCurrentView(view)
    if (isMobile) setMobileOpen(false)
  }

  const menuItems = [
    { 
      id: 'pessoas', 
      label: 'Pessoas', 
      icon: <PeopleIcon />, 
      submenu: [
        { id: 'publicadores', label: 'Publicadores', icon: <PeopleIcon /> },
        { id: 'etiquetas', label: 'Etiquetas', icon: <LabelIcon /> },
        { id: 'mapa', label: 'Mapa de Grupos', icon: <MapIcon /> },
      ]
    },
    { 
      id: 'programacao', 
      label: 'Programação', 
      icon: <ScheduleIcon />, 
      submenu: [
        { id: 'reuniao-semana', label: 'Reunião de Semana', icon: <EventIcon /> },
        { id: 'ausencias', label: 'Ausências', icon: <BlockIcon /> },
        { id: 'config-programacao', label: 'Configurações', icon: <SettingsIcon /> },
      ]
    },
    { 
      id: 'relatorios', 
      label: 'Relatórios', 
      icon: <ReportIcon />, 
      submenu: [
        { id: 'relatorios-campo', label: 'Relatórios de Campo', icon: <ReportIcon /> },
        { id: 'atividades', label: 'Atividades', icon: <ActivityIcon /> },
        { id: 'historico', label: 'Histórico Designações', icon: <HistoryIcon /> },
      ]
    },
    { id: 'estatisticas', label: 'Estatísticas', icon: <ChartIcon /> },
    { id: 'semanas', label: 'Semanas', icon: <EventIcon /> },
    { id: 'exportar', label: 'Exportar Dados', icon: <DownloadIcon /> },
    { id: 'configuracoes', label: 'Configurações', icon: <SettingsIcon /> },
  ]

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Designações
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          item.submenu ? (
            <Box key={item.id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  if (item.id === 'pessoas') setPessoasOpen(!pessoasOpen)
                  if (item.id === 'relatorios') setRelatoriosOpen(!relatoriosOpen)
                  if (item.id === 'programacao') setProgramacaoOpen(!programacaoOpen)
                }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {(item.id === 'pessoas' ? pessoasOpen : item.id === 'programacao' ? programacaoOpen : relatoriosOpen) ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={item.id === 'pessoas' ? pessoasOpen : item.id === 'programacao' ? programacaoOpen : relatoriosOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItemButton
                      key={subItem.id}
                      selected={currentView === subItem.id}
                      onClick={() => handleNavClick(subItem.id)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                      <ListItemText primary={subItem.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          ) : (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={currentView === item.id}
                onClick={() => handleNavClick(item.id)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </Box>
  )

  const renderContent = () => {
    switch (currentView) {
      case 'publicadores':
        return <Publicadores />
      case 'etiquetas':
        return <Etiquetas />
      case 'mapa':
        return <MapaGrupos />
      case 'relatorios-campo':
        return <RelatoriosCampo />
      case 'atividades':
        return <Atividades />
      case 'historico':
        return <HistoricoDesignacoes />
      case 'reuniao-semana':
        return <Programacao />
      case 'ausencias':
        return <Ausencias />
      case 'config-programacao':
        return <Configuracoes />
      case 'estatisticas':
        return <Estatisticas />
      case 'semanas':
        return <Semanas />
      case 'exportar':
        return <ExportarDados />
      case 'configuracoes':
        return <Configuracoes />
      default:
        return <Publicadores />
    }
  }

  const getCurrentViewLabel = () => {
    for (const item of menuItems) {
      if (item.id === currentView) return item.label
      if (item.submenu) {
        const sub = item.submenu.find(s => s.id === currentView)
        if (sub) return sub.label
      }
    }
    return 'Dashboard'
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getCurrentViewLabel()}
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user.email}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  )
}

export default App
