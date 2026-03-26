import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material'
import axios from 'axios'

interface Config {
  nomeCongregacao: string
  enderecoSalao: string
  telefoneSalao: string
  emailCongregacao: string
}

export default function Configuracoes() {
  const [config, setConfig] = useState<Config>({
    nomeCongregacao: '',
    enderecoSalao: '',
    telefoneSalao: '',
    emailCongregacao: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/config')
      if (res.data.config) {
        setConfig({
          nomeCongregacao: res.data.config.nomeCongregacao || '',
          enderecoSalao: res.data.config.enderecoSalao || '',
          telefoneSalao: res.data.config.telefoneSalao || '',
          emailCongregacao: res.data.config.emailCongregacao || ''
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await axios.post('/api/config', config)
      setSuccess('Configurações salvas com sucesso!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configurações
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dados da Congregação
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nome da Congregação"
                value={config.nomeCongregacao}
                onChange={(e) => setConfig({ ...config, nomeCongregacao: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email da Congregação"
                type="email"
                value={config.emailCongregacao}
                onChange={(e) => setConfig({ ...config, emailCongregacao: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Telefone do Salão"
                value={config.telefoneSalao}
                onChange={(e) => setConfig({ ...config, telefoneSalao: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Endereço do Salão"
                value={config.enderecoSalao}
                onChange={(e) => setConfig({ ...config, enderecoSalao: e.target.value })}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sobre o Sistema
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Sistema de Designações para Congregação
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Versão 2.0.0
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Desenvolvido para gerenciar designações de publicadores em reuniões congregacionais.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
