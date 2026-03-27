import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Paper,
  Snackbar,
  useTheme,
} from '@mui/material'
import {
  Download as DownloadIcon,
  TableChart as CsvIcon,
  PictureAsPdf as PdfIcon,
  Description as ExcelIcon,
  People as PeopleIcon,
  Assignment as ReportIcon,
  Event as EventIcon,
  Folder as FolderIcon,
} from '@mui/icons-material'
import api from '../api'

interface ExportOption {
  id: string
  label: string
  icon: React.ReactNode
  description: string
}

const exportOptions: ExportOption[] = [
  { id: 'publicadores', label: 'Publicadores', icon: <PeopleIcon />, description: 'Lista completa de publicadores com todos os dados' },
  { id: 'relatorios', label: 'Relatórios de Campo', icon: <ReportIcon />, description: 'Relatórios mensais de atividade' },
  { id: 'designacoes', label: 'Designações', icon: <EventIcon />, description: 'Histórico de designações' },
  { id: 'familias', label: 'Famílias', icon: <FolderIcon />, description: 'Agrupamentos familiares' },
]

export default function ExportarDados() {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Export selections
  const [selectedItems, setSelectedItems] = useState<string[]>(['publicadores'])
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [filterAno, setFilterAno] = useState(new Date().getFullYear().toString())
  const [filterMes, setFilterMes] = useState('')
  
  // Data counts
  const [dataCounts, setDataCounts] = useState({
    publicadores: 0,
    relatorios: 0,
    designacoes: 0,
    familias: 0,
  })

  useEffect(() => {
    loadDataCounts()
  }, [])

  const loadDataCounts = async () => {
    try {
      const [pubRes, relRes, desRes, famRes] = await Promise.all([
        api.get('/publicadores').catch(() => ({ data: { publicadores: [] } })),
        api.get('/relatorios').catch(() => ({ data: { relatorios: [] } })),
        api.get('/designacoes').catch(() => ({ data: { designacoes: [] } })),
        api.get('/familias').catch(() => ({ data: { familias: [] } })),
      ])
      setDataCounts({
        publicadores: pubRes.data.publicadores?.length || 0,
        relatorios: relRes.data.relatorios?.length || 0,
        designacoes: desRes.data.designacoes?.length || 0,
        familias: famRes.data.familias?.length || 0,
      })
    } catch (err) {
      console.error('Erro ao carregar contagens:', err)
    }
  }

  // Gerar anos para filtro
  const anos = []
  const currentYear = new Date().getFullYear()
  for (let y = currentYear; y >= currentYear - 5; y--) {
    anos.push(y.toString())
  }

  const meses = [
    { value: '', label: 'Todos os meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]

  const handleToggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === exportOptions.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(exportOptions.map(o => o.id))
    }
  }

  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(';'),
      ...data.map(row => headers.map(h => {
        const value = row[h]
        if (typeof value === 'string' && (value.includes(';') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(';'))
    ].join('\n')
    
    return csvContent
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    if (selectedItems.length === 0) {
      setError('Selecione pelo menos um item para exportar')
      return
    }

    setLoading(true)
    setError('')

    try {
      const timestamp = new Date().toISOString().split('T')[0]
      
      for (const item of selectedItems) {
        let data: any[] = []
        let headers: string[] = []
        let filename = ''

        switch (item) {
          case 'publicadores':
            const pubRes = await api.get('/publicadores')
            data = pubRes.data.publicadores || []
            headers = ['nomeCompleto', 'email', 'telemovel', 'genero', 'dataNascimento', 'dataBatismo', 'tipoPublicador', 'privilegioServico', 'grupoCampo', 'morada', 'cidade', 'status']
            filename = `publicadores_${timestamp}`
            break

          case 'relatorios':
            const relRes = await api.get('/relatorios')
            let relatorios = relRes.data.relatorios || []
            
            // Aplicar filtros
            if (filterAno) {
              relatorios = relatorios.filter((r: any) => r.mes.startsWith(filterAno))
            }
            if (filterMes) {
              relatorios = relatorios.filter((r: any) => r.mes.endsWith(filterMes))
            }
            
            data = relatorios
            headers = ['mes', 'publicadorNome', 'horas', 'revisitas', 'estudos', 'videos', 'publicacoes', 'observacoes']
            filename = `relatorios_${filterAno}${filterMes ? '_' + filterMes : ''}_${timestamp}`
            break

          case 'designacoes':
            const desRes = await api.get('/designacoes')
            data = desRes.data.designacoes || []
            headers = ['data', 'publicadorNome', 'tipo', 'reuniao', 'status', 'substitutoNome', 'observacoes']
            filename = `designacoes_${timestamp}`
            break

          case 'familias':
            const famRes = await api.get('/familias')
            data = famRes.data.familias || []
            headers = ['nome', 'membros']
            filename = `familias_${timestamp}`
            break
        }

        if (exportFormat === 'csv') {
          const csv = generateCSV(data, headers)
          downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
        } else if (exportFormat === 'json') {
          const json = JSON.stringify(data, null, 2)
          downloadFile(json, `${filename}.json`, 'application/json')
        }
      }

      setSuccess(`${selectedItems.length} arquivo(s) exportado(s) com sucesso!`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao exportar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (selectedItems.length === 0) {
      setError('Selecione pelo menos um item para exportar')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Para PDF, vamos gerar um HTML simples que pode ser impresso como PDF
      const timestamp = new Date().toISOString().split('T')[0]
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório - ${timestamp}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
            h2 { color: #333; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1976d2; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { text-align: center; margin-bottom: 30px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Congregação</h1>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-PT')}</p>
          </div>
      `

      for (const item of selectedItems) {
        let data: any[] = []
        let headers: string[] = []
        let title = ''

        switch (item) {
          case 'publicadores':
            const pubRes = await api.get('/publicadores')
            data = pubRes.data.publicadores || []
            headers = ['Nome', 'Email', 'Telefone', 'Gênero', 'Tipo', 'Grupo']
            title = 'Publicadores'
            break

          case 'relatorios':
            const relRes = await api.get('/relatorios')
            let relatorios = relRes.data.relatorios || []
            if (filterAno) {
              relatorios = relatorios.filter((r: any) => r.mes.startsWith(filterAno))
            }
            data = relatorios
            headers = ['Mês', 'Publicador', 'Horas', 'Revisitas', 'Estudos', 'Vídeos', 'Publicações']
            title = 'Relatórios de Campo'
            break

          case 'designacoes':
            const desRes = await api.get('/designacoes')
            data = desRes.data.designacoes || []
            headers = ['Data', 'Publicador', 'Tipo', 'Reunião', 'Status']
            title = 'Designações'
            break

          case 'familias':
            const famRes = await api.get('/familias')
            data = famRes.data.familias || []
            headers = ['Nome da Família', 'Membros']
            title = 'Famílias'
            break
        }

        htmlContent += `<h2>${title}</h2>`
        htmlContent += '<table><thead><tr>'
        headers.forEach(h => {
          htmlContent += `<th>${h}</th>`
        })
        htmlContent += '</tr></thead><tbody>'

        data.forEach((row: any) => {
          htmlContent += '<tr>'
          switch (item) {
            case 'publicadores':
              htmlContent += `<td>${row.nomeCompleto || ''}</td>`
              htmlContent += `<td>${row.email || ''}</td>`
              htmlContent += `<td>${row.telemovel || ''}</td>`
              htmlContent += `<td>${row.genero || ''}</td>`
              htmlContent += `<td>${row.tipoPublicador || ''}</td>`
              htmlContent += `<td>${row.grupoCampo || ''}</td>`
              break
            case 'relatorios':
              htmlContent += `<td>${row.mes || ''}</td>`
              htmlContent += `<td>${row.publicadorNome || ''}</td>`
              htmlContent += `<td>${row.horas || 0}</td>`
              htmlContent += `<td>${row.revisitas || 0}</td>`
              htmlContent += `<td>${row.estudos || 0}</td>`
              htmlContent += `<td>${row.videos || 0}</td>`
              htmlContent += `<td>${row.publicacoes || 0}</td>`
              break
            case 'designacoes':
              htmlContent += `<td>${row.data || ''}</td>`
              htmlContent += `<td>${row.publicadorNome || ''}</td>`
              htmlContent += `<td>${row.tipo || ''}</td>`
              htmlContent += `<td>${row.reuniao || ''}</td>`
              htmlContent += `<td>${row.status || ''}</td>`
              break
            case 'familias':
              htmlContent += `<td>${row.nome || ''}</td>`
              htmlContent += `<td>${Array.isArray(row.membros) ? row.membros.length : 0}</td>`
              break
          }
          htmlContent += '</tr>'
        })

        htmlContent += '</tbody></table>'
      }

      htmlContent += `
          <div class="footer">
            <p>Sistema de Designações - Congregação</p>
          </div>
        </body>
        </html>
      `

      // Abrir em nova janela para impressão
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.print()
      }

      setSuccess('Relatório PDF gerado! Use a opção de impressão para salvar.')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao gerar PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      
      <Typography variant="h5" gutterBottom>
        Exportação de Dados
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecione os dados que deseja exportar e o formato desejado
      </Typography>

      <Grid container spacing={3}>
        {/* Seleção de Dados */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Dados para Exportar
                </Typography>
                <Button size="small" onClick={handleSelectAll}>
                  {selectedItems.length === exportOptions.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </Button>
              </Box>
              
              <List>
                {exportOptions.map((option) => (
                  <Paper 
                    key={option.id} 
                    variant="outlined" 
                    sx={{ 
                      mb: 1, 
                      cursor: 'pointer',
                      border: selectedItems.includes(option.id) ? `2px solid ${theme.palette.primary.main}` : undefined,
                      bgcolor: selectedItems.includes(option.id) ? 'primary.50' : undefined,
                    }}
                    onClick={() => handleToggleItem(option.id)}
                  >
                    <ListItem>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedItems.includes(option.id)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemIcon>
                        {option.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={option.label}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                            <Chip 
                              label={`${dataCounts[option.id as keyof typeof dataCounts]} registros`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Opções de Exportação */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Opções de Exportação
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Formato</InputLabel>
                    <Select
                      value={exportFormat}
                      label="Formato"
                      onChange={(e) => setExportFormat(e.target.value as any)}
                    >
                      <MenuItem value="csv">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CsvIcon color="success" />
                          CSV (Excel compatível)
                        </Box>
                      </MenuItem>
                      <MenuItem value="json">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ExcelIcon color="primary" />
                          JSON
                        </Box>
                      </MenuItem>
                      <MenuItem value="pdf">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PdfIcon color="error" />
                          PDF (imprimir)
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {selectedItems.includes('relatorios') && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Ano</InputLabel>
                        <Select
                          value={filterAno}
                          label="Ano"
                          onChange={(e) => setFilterAno(e.target.value)}
                        >
                          {anos.map(ano => (
                            <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Mês</InputLabel>
                        <Select
                          value={filterMes}
                          label="Mês"
                          onChange={(e) => setFilterMes(e.target.value)}
                        >
                          {meses.map(mes => (
                            <MenuItem key={mes.value} value={mes.value}>{mes.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
            
            <Divider />
            
            <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {selectedItems.length} item(s) selecionado(s)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {exportFormat === 'pdf' ? (
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
                    onClick={handleExportPDF}
                    disabled={loading || selectedItems.length === 0}
                  >
                    Gerar PDF
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                    onClick={handleExport}
                    disabled={loading || selectedItems.length === 0}
                  >
                    Exportar
                  </Button>
                )}
              </Box>
            </CardActions>
          </Card>
        </Grid>

        {/* Informações */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Informações sobre os formatos
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CsvIcon color="success" />
                    <Typography variant="subtitle2">CSV</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Formato compatível com Excel, Google Sheets e outros programas de planilha. 
                    Ideal para importar em outros sistemas.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ExcelIcon color="primary" />
                    <Typography variant="subtitle2">JSON</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Formato estruturado de dados. Ideal para desenvolvedores ou backup completo 
                    dos dados.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PdfIcon color="error" />
                    <Typography variant="subtitle2">PDF</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Formato para impressão e arquivamento. Abre uma janela de impressão 
                    onde você pode salvar como PDF.
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}
