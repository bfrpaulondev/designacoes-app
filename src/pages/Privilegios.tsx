import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material'
import api from '../api'
import {
  Role,
  UserWithPrivileges,
  AuditLog,
  PermissionRequest,
  USER_ROLES,
  RESOURCES,
  ACTIONS,
  Resource,
  Action,
  UserRole,
} from '../types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export default function Privilegios() {
  const [tabValue, setTabValue] = useState(0)
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<UserWithPrivileges[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [requests, setRequests] = useState<PermissionRequest[]>([])
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Dialogs
  const [userRoleDialog, setUserRoleDialog] = useState(false)
  const [permissionDialog, setPermissionDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithPrivileges | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('publicador')
  const [newPermission, setNewPermission] = useState<{ resource: Resource; action: Action }>({
    resource: 'publicadores',
    action: 'read',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [rolesRes, usersRes, auditRes, requestsRes] = await Promise.all([
        api.get('/privilegios/roles'),
        api.get('/privilegios/usuarios'),
        api.get('/privilegios/audit?limit=50'),
        api.get('/privilegios/solicitacoes'),
      ])
      setRoles(rolesRes.data.roles || [])
      setUsers(usersRes.data.users || [])
      setAuditLogs(auditRes.data.logs || [])
      setRequests(requestsRes.data.solicitacoes || [])
    } catch (error: any) {
      showSnackbar('Erro ao carregar dados: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleUpdateUserRole = async () => {
    if (!selectedUser) return
    try {
      await api.patch(`/privilegios/usuarios/${selectedUser._id || selectedUser.id}/role`, {
        role: newRole,
      })
      showSnackbar('Papel atualizado com sucesso!', 'success')
      setUserRoleDialog(false)
      loadData()
    } catch (error: any) {
      showSnackbar('Erro ao atualizar papel: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleAddPermission = async () => {
    if (!selectedUser) return
    try {
      await api.post(`/privilegios/usuarios/${selectedUser._id || selectedUser.id}/permissions`, {
        permissions: [newPermission],
      })
      showSnackbar('Permissão adicionada com sucesso!', 'success')
      setPermissionDialog(false)
      loadData()
    } catch (error: any) {
      showSnackbar('Erro ao adicionar permissão: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleApproveRequest = async (requestId: string, approve: boolean) => {
    try {
      await api.patch(`/privilegios/solicitacoes/${requestId}`, {
        status: approve ? 'approved' : 'rejected',
      })
      showSnackbar(`Solicitação ${approve ? 'aprovada' : 'rejeitada'}!`, 'success')
      loadData()
    } catch (error: any) {
      showSnackbar('Erro ao processar solicitação: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: '#d32f2f',
      admin: '#f57c00',
      anciao: '#388e3c',
      servo_ministerial: '#1976d2',
      publicador: '#7b1fa2',
      publicador_nao_batizado: '#00796b',
      convidado: '#757575',
    }
    return colors[role] || '#757575'
  }

  const getRoleLabel = (roleId: string) => {
    const role = USER_ROLES.find(r => r.value === roleId)
    return role?.label || roleId
  }

  const getResourceLabel = (resource: Resource) => {
    const r = RESOURCES.find(res => res.value === resource)
    return r?.label || resource
  }

  const getActionLabel = (action: Action) => {
    const a = ACTIONS.find(act => act.value === action)
    return a?.label || action
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon sx={{ fontSize: 32 }} />
        Sistema de Privilégios
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab icon={<ShieldIcon />} label="Papéis" />
          <Tab icon={<PeopleIcon />} label="Usuários" />
          <Tab icon={<HistoryIcon />} label="Auditoria" />
          <Tab icon={<AdminIcon />} label="Solicitações" />
        </Tabs>
      </Paper>

      {/* Tab: Papéis */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          {roles.map(role => (
            <Grid item xs={12} md={6} key={role.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={role.name}
                        sx={{
                          bgcolor: getRoleColor(role.id),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Nível: {role.level}
                      </Typography>
                    </Box>
                    {role.isSystem && (
                      <Chip label="Sistema" size="small" color="primary" variant="outlined" />
                    )}
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {role.description}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Permissões ({role.permissions.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {role.permissions.slice(0, 5).map((p, i) => (
                      <Chip
                        key={i}
                        size="small"
                        label={`${getResourceLabel(p.resource)}: ${getActionLabel(p.action)}`}
                        variant="outlined"
                      />
                    ))}
                    {role.permissions.length > 5 && (
                      <Chip
                        size="small"
                        label={`+${role.permissions.length - 5} mais`}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab: Usuários */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Papel</TableCell>
                <TableCell>Permissões Extras</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id || user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      size="small"
                      sx={{
                        bgcolor: getRoleColor(user.role),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {user.customPermissions && user.customPermissions.length > 0 ? (
                      <Chip
                        label={`${user.customPermissions.length} permissões`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isActive !== false ? (
                      <Chip icon={<LockOpenIcon />} label="Ativo" size="small" color="success" />
                    ) : (
                      <Chip icon={<LockIcon />} label="Inativo" size="small" color="error" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Alterar Papel">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user)
                          setNewRole(user.role)
                          setUserRoleDialog(true)
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Adicionar Permissão">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user)
                          setPermissionDialog(true)
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab: Auditoria */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Ação</TableCell>
                <TableCell>Recurso</TableCell>
                <TableCell>Detalhes</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>
                    <Chip label={log.action} size="small" />
                  </TableCell>
                  <TableCell>{getResourceLabel(log.resource)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {JSON.stringify(log.details).substring(0, 50)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{log.ipAddress}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab: Solicitações */}
      <TabPanel value={tabValue} index={3}>
        {requests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">Nenhuma solicitação pendente</Typography>
          </Paper>
        ) : (
          <List>
            {requests.map((req) => (
              <Paper key={req.id} sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{req.reason}</Typography>
                        <Chip
                          label={
                            req.status === 'pending'
                              ? 'Pendente'
                              : req.status === 'approved'
                              ? 'Aprovada'
                              : 'Rejeitada'
                          }
                          size="small"
                          color={
                            req.status === 'pending'
                              ? 'warning'
                              : req.status === 'approved'
                              ? 'success'
                              : 'error'
                          }
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        {req.requestedRole && `Papel solicitado: ${getRoleLabel(req.requestedRole)}`}
                        {req.requestedPermissions && req.requestedPermissions.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            Permissões:{' '}
                            {req.requestedPermissions.map((p, i) => (
                              <Chip
                                key={i}
                                size="small"
                                label={`${getResourceLabel(p.resource)}: ${getActionLabel(p.action)}`}
                                sx={{ mr: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                        <br />
                        Criada em: {formatDate(req.createdAt)}
                      </Typography>
                    }
                  />
                  {req.status === 'pending' && (
                    <ListItemSecondaryAction>
                      <Tooltip title="Aprovar">
                        <IconButton
                          color="success"
                          onClick={() => handleApproveRequest(req.id, true)}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rejeitar">
                        <IconButton
                          color="error"
                          onClick={() => handleApproveRequest(req.id, false)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Dialog: Alterar Papel */}
      <Dialog open={userRoleDialog} onClose={() => setUserRoleDialog(false)}>
        <DialogTitle>Alterar Papel do Usuário</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Usuário: {selectedUser?.name}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Novo Papel</InputLabel>
            <Select
              value={newRole}
              label="Novo Papel"
              onChange={(e) => setNewRole(e.target.value as UserRole)}
            >
              {USER_ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getRoleColor(role.value),
                      }}
                    />
                    {role.label} (Nível {role.level})
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateUserRole}>
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Adicionar Permissão */}
      <Dialog open={permissionDialog} onClose={() => setPermissionDialog(false)}>
        <DialogTitle>Adicionar Permissão Customizada</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Usuário: {selectedUser?.name}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Recurso</InputLabel>
                <Select
                  value={newPermission.resource}
                  label="Recurso"
                  onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value as Resource })}
                >
                  {RESOURCES.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Ação</InputLabel>
                <Select
                  value={newPermission.action}
                  label="Ação"
                  onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value as Action })}
                >
                  {ACTIONS.map((a) => (
                    <MenuItem key={a.value} value={a.value}>
                      {a.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddPermission}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
