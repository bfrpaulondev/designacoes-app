from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import inch, cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/relatorio_testes_designacoes.pdf",
    pagesize=A4,
    title="Relatório de Testes - Sistema de Designações",
    author='Z.ai',
    creator='Z.ai',
    subject='Relatório completo de testes do sistema de designações'
)

styles = getSampleStyleSheet()

# Define styles
title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='SimHei',
    fontSize=24,
    leading=30,
    alignment=TA_CENTER,
    spaceAfter=24
)

heading1_style = ParagraphStyle(
    name='Heading1Style',
    fontName='SimHei',
    fontSize=16,
    leading=22,
    alignment=TA_LEFT,
    spaceBefore=18,
    spaceAfter=12
)

heading2_style = ParagraphStyle(
    name='Heading2Style',
    fontName='SimHei',
    fontSize=13,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=12,
    spaceAfter=8
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='SimHei',
    fontSize=10,
    leading=16,
    alignment=TA_LEFT,
    wordWrap='CJK'
)

header_style = ParagraphStyle(
    name='TableHeader',
    fontName='SimHei',
    fontSize=10,
    textColor=colors.white,
    alignment=TA_CENTER
)

cell_style = ParagraphStyle(
    name='TableCell',
    fontName='SimHei',
    fontSize=9,
    textColor=colors.black,
    alignment=TA_CENTER,
    wordWrap='CJK'
)

cell_left_style = ParagraphStyle(
    name='TableCellLeft',
    fontName='SimHei',
    fontSize=9,
    textColor=colors.black,
    alignment=TA_LEFT,
    wordWrap='CJK'
)

story = []

# Cover Page
story.append(Spacer(1, 120))
story.append(Paragraph("Relatório de Testes", title_style))
story.append(Paragraph("Sistema de Designações", title_style))
story.append(Spacer(1, 36))
story.append(Paragraph("Validação Completa da Aplicação em Produção", ParagraphStyle(
    name='Subtitle',
    fontName='SimHei',
    fontSize=14,
    leading=20,
    alignment=TA_CENTER
)))
story.append(Spacer(1, 48))
story.append(Paragraph("https://designacoes-app.vercel.app/", ParagraphStyle(
    name='URL',
    fontName='Times New Roman',
    fontSize=12,
    leading=18,
    alignment=TA_CENTER
)))
story.append(Spacer(1, 60))
story.append(Paragraph("Data: 27 de Março de 2026", ParagraphStyle(
    name='Date',
    fontName='SimHei',
    fontSize=12,
    leading=18,
    alignment=TA_CENTER
)))
story.append(PageBreak())

# Executive Summary
story.append(Paragraph("1. Resumo Executivo", heading1_style))
story.append(Paragraph(
    "Este relatório documenta a execução de 25 testes sistemáticos realizados na aplicação de Designações "
    "implantada em produção. A aplicação foi desenvolvida como uma alternativa ao sistema Hourglass, oferecendo "
    "funcionalidades avançadas como suporte a dias específicos de ausência (não apenas períodos contínuos), "
    "integração completa entre módulos, e um sistema de privilégios diferenciados para Anciãos, Servos Ministeriais "
    "e Publicadores.",
    body_style
))
story.append(Spacer(1, 12))
story.append(Paragraph(
    "Os testes abrangem todas as funcionalidades críticas: autenticação, gestão de publicadores, sistema de ausências "
    "com três tipos distintos, configurações de programação com 10 abas, designações com 5 categorias, algoritmo de "
    "sugestões baseado em score, e integração entre todos os módulos. A aplicação demonstrou funcionamento correto "
    "em todos os cenários testados.",
    body_style
))

# Test Summary Table
story.append(Paragraph("2. Resumo dos Testes", heading1_style))

summary_data = [
    [Paragraph('<b>Categoria</b>', header_style), Paragraph('<b>Testes</b>', header_style), Paragraph('<b>Status</b>', header_style)],
    [Paragraph('Autenticação', cell_style), Paragraph('2', cell_style), Paragraph('Passou', cell_style)],
    [Paragraph('APIs Backend', cell_style), Paragraph('8', cell_style), Paragraph('Passou', cell_style)],
    [Paragraph('Interface do Utilizador', cell_style), Paragraph('5', cell_style), Paragraph('Passou', cell_style)],
    [Paragraph('Sistema de Ausências', cell_style), Paragraph('4', cell_style), Paragraph('Passou', cell_style)],
    [Paragraph('Sistema de Designações', cell_style), Paragraph('4', cell_style), Paragraph('Passou', cell_style)],
    [Paragraph('Integração', cell_style), Paragraph('2', cell_style), Paragraph('Passou', cell_style)],
]

summary_table = Table(summary_data, colWidths=[5*cm, 3*cm, 3*cm])
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(summary_table)
story.append(Spacer(1, 18))

# Detailed Tests
story.append(Paragraph("3. Testes Detalhados", heading1_style))

# Authentication Tests
story.append(Paragraph("3.1 Testes de Autenticação", heading2_style))

auth_tests = [
    [Paragraph('<b>#</b>', header_style), Paragraph('<b>Teste</b>', header_style), Paragraph('<b>Resultado</b>', header_style), Paragraph('<b>Detalhes</b>', header_style)],
    [Paragraph('1', cell_style), Paragraph('Login com credenciais válidas', cell_left_style), Paragraph('PASSOU', cell_style), Paragraph('Token JWT retornado com sucesso', cell_left_style)],
    [Paragraph('2', cell_style), Paragraph('Proteção de rotas', cell_left_style), Paragraph('PASSOU', cell_style), Paragraph('Redirecionamento para login quando não autenticado', cell_left_style)],
]

auth_table = Table(auth_tests, colWidths=[1*cm, 4.5*cm, 2*cm, 6*cm])
auth_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(auth_table)
story.append(Spacer(1, 18))

# API Tests
story.append(Paragraph("3.2 Testes de API Backend", heading2_style))

api_tests = [
    [Paragraph('<b>#</b>', header_style), Paragraph('<b>Endpoint</b>', header_style), Paragraph('<b>Método</b>', header_style), Paragraph('<b>Status</b>', header_style)],
    [Paragraph('3', cell_style), Paragraph('POST /api/auth/login', cell_left_style), Paragraph('POST', cell_style), Paragraph('200 OK', cell_style)],
    [Paragraph('4', cell_style), Paragraph('GET /api/publicadores', cell_left_style), Paragraph('GET', cell_style), Paragraph('200 OK - 10 publicadores', cell_style)],
    [Paragraph('5', cell_style), Paragraph('GET /api/config-programacao', cell_left_style), Paragraph('GET', cell_style), Paragraph('200 OK - Config completa', cell_style)],
    [Paragraph('6', cell_style), Paragraph('POST /api/ausencias', cell_left_style), Paragraph('POST', cell_style), Paragraph('201 Created', cell_style)],
    [Paragraph('7', cell_style), Paragraph('GET /api/ausencias', cell_left_style), Paragraph('GET', cell_style), Paragraph('200 OK', cell_style)],
    [Paragraph('8', cell_style), Paragraph('POST /api/designacoes', cell_left_style), Paragraph('POST', cell_style), Paragraph('201 Created', cell_style)],
    [Paragraph('9', cell_style), Paragraph('POST /api/designacoes (batch)', cell_left_style), Paragraph('POST', cell_style), Paragraph('200 OK - 2 criadas', cell_style)],
    [Paragraph('10', cell_style), Paragraph('POST /api/config-programacao', cell_left_style), Paragraph('POST', cell_style), Paragraph('200 OK', cell_style)],
]

api_table = Table(api_tests, colWidths=[1*cm, 5*cm, 2*cm, 5.5*cm])
api_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(api_table)
story.append(Spacer(1, 18))

# UI Tests
story.append(Paragraph("3.3 Testes de Interface do Utilizador", heading2_style))

ui_tests = [
    [Paragraph('<b>#</b>', header_style), Paragraph('<b>Teste</b>', header_style), Paragraph('<b>Resultado</b>', header_style), Paragraph('<b>Observações</b>', header_style)],
    [Paragraph('11', cell_style), Paragraph('Navegação para Designações', cell_left_style), Paragraph('PASSOU', cell_style), Paragraph('Menu Programação > Designações funcional', cell_left_style)],
    [Paragraph('12', cell_style), Paragraph('Tabs de categorias (5)', cell_left_style), Paragraph('PASSOU', cell_style), Paragraph('Fim de Semana, Meio de Semana, A/V, Limpeza, Test. Público', cell_left_style)],
    [Paragraph('13', cell_style), Paragraph('Seleção de data', cell_left_style), Paragraph('PASSOU', cell_style), Paragraph('DatePicker funcional com cálculo de semana', cell_left_style)],
    [Paragraph('14', cell_style), Paragraph('Navegação para Ausências', cell_left_style), Paragraph('PASSOU', cell_style), Paragraph('Página carrega com dados de exemplo', cell_left_style)],
    [Paragraph('15', cell_style), Paragraph('Navegação para Configurações', cell_left_style), Paragraph('PASSOU', cell_style), Paragraph('10 abas de configuração disponíveis', cell_left_style)],
]

ui_table = Table(ui_tests, colWidths=[1*cm, 4.5*cm, 2*cm, 6*cm])
ui_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(ui_table)
story.append(Spacer(1, 18))

# Absence Tests
story.append(Paragraph("3.4 Testes do Sistema de Ausências", heading2_style))

story.append(Paragraph(
    "O sistema de ausências foi desenvolvido como uma melhoria significativa em relação ao Hourglass, "
    "que apenas permite períodos contínuos. A aplicação suporta três tipos de ausência:",
    body_style
))
story.append(Spacer(1, 8))
story.append(Paragraph("• Período: Data inicial e data final (tradicional)", body_style))
story.append(Paragraph("• Dias Específicos: Seleção individual de datas (NOVO)", body_style))
story.append(Paragraph("• Recorrente: Dias da semana fixos (ex: toda quarta-feira)", body_style))
story.append(Spacer(1, 12))

abs_tests = [
    [Paragraph('<b>#</b>', header_style), Paragraph('<b>Teste</b>', header_style), Paragraph('<b>Resultado</b>', header_style)],
    [Paragraph('16', cell_style), Paragraph('Criar ausência por período', cell_left_style), Paragraph('PASSOU - API retorna objeto criado', cell_style)],
    [Paragraph('17', cell_style), Paragraph('Calendário visual para dias específicos', cell_left_style), Paragraph('PASSOU - Interface renderiza calendário', cell_style)],
    [Paragraph('18', cell_style), Paragraph('Ausência recorrente semanal', cell_left_style), Paragraph('PASSOU - Seleção de dias da semana', cell_style)],
    [Paragraph('19', cell_style), Paragraph('Tipos de designação afetados', cell_left_style), Paragraph('PASSOU - Múltiplas opções disponíveis', cell_style)],
]

abs_table = Table(abs_tests, colWidths=[1*cm, 5.5*cm, 6*cm])
abs_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(abs_table)
story.append(Spacer(1, 18))

# Designation Tests
story.append(Paragraph("3.5 Testes do Sistema de Designações", heading2_style))

story.append(Paragraph(
    "O sistema de designações oferece 5 categorias distintas, cada uma com tipos específicos de designação. "
    "O algoritmo de sugestões utiliza um sistema de score (0-100) baseado em múltiplos fatores como tempo "
    "sem designar, privilégio de serviço, e disponibilidade verificada contra ausências.",
    body_style
))
story.append(Spacer(1, 12))

des_tests = [
    [Paragraph('<b>#</b>', header_style), Paragraph('<b>Teste</b>', header_style), Paragraph('<b>Resultado</b>', header_style)],
    [Paragraph('20', cell_style), Paragraph('Gerar escala semanal automática', cell_left_style), Paragraph('PASSOU - Algoritmo cria designações', cell_style)],
    [Paragraph('21', cell_style), Paragraph('Sugestões de publicadores', cell_left_style), Paragraph('PASSOU - Score calculado corretamente', cell_style)],
    [Paragraph('22', cell_style), Paragraph('Verificação de disponibilidade', cell_left_style), Paragraph('PASSOU - Ausências são consideradas', cell_style)],
    [Paragraph('23', cell_style), Paragraph('Remoção de designação', cell_left_style), Paragraph('PASSOU - DELETE funciona', cell_style)],
]

des_table = Table(des_tests, colWidths=[1*cm, 5.5*cm, 6*cm])
des_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(des_table)
story.append(Spacer(1, 18))

# Integration Tests
story.append(Paragraph("3.6 Testes de Integração", heading2_style))

int_tests = [
    [Paragraph('<b>#</b>', header_style), Paragraph('<b>Teste</b>', header_style), Paragraph('<b>Resultado</b>', header_style)],
    [Paragraph('24', cell_style), Paragraph('Ausências → Designações', cell_left_style), Paragraph('PASSOU - Publicadores ausentes não sugeridos', cell_style)],
    [Paragraph('25', cell_style), Paragraph('Configurações → Designações', cell_left_style), Paragraph('PASSOU - Horários aplicados às datas', cell_style)],
]

int_table = Table(int_tests, colWidths=[1*cm, 5.5*cm, 6*cm])
int_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(int_table)
story.append(Spacer(1, 18))

# Privilege System
story.append(Paragraph("4. Sistema de Privilégios", heading1_style))

story.append(Paragraph(
    "A aplicação implementa um sistema de privilégios baseado no tipo de serviço do publicador. "
    "Os dados de teste incluem 10 publicadores distribuídos da seguinte forma:",
    body_style
))
story.append(Spacer(1, 12))

priv_data = [
    [Paragraph('<b>Privilégio</b>', header_style), Paragraph('<b>Quantidade</b>', header_style), Paragraph('<b>Permissões</b>', header_style)],
    [Paragraph('Ancião', cell_style), Paragraph('3', cell_style), Paragraph('Presidente, todas as designações', cell_left_style)],
    [Paragraph('Servo Ministerial', cell_style), Paragraph('3', cell_style), Paragraph('Conselheiro, AV, Indicador', cell_left_style)],
    [Paragraph('Publicador', cell_style), Paragraph('4', cell_style), Paragraph('Designações gerais', cell_left_style)],
]

priv_table = Table(priv_data, colWidths=[4*cm, 3*cm, 5.5*cm])
priv_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(priv_table)
story.append(Spacer(1, 18))

# Conclusion
story.append(Paragraph("5. Conclusão", heading1_style))

story.append(Paragraph(
    "A aplicação de Designações foi testada extensivamente em ambiente de produção. Todos os 25 testes "
    "executados passaram com sucesso, demonstrando que o sistema está funcionando corretamente. "
    "As principais funcionalidades implementadas representam melhorias significativas em relação ao sistema "
    "Hourglass anteriormente utilizado.",
    body_style
))
story.append(Spacer(1, 12))

story.append(Paragraph(
    "Os pontos fortes identificados incluem: o sistema de ausências com suporte a dias específicos, "
    "a integração completa entre configurações e designações, o algoritmo de sugestões baseado em score, "
    "e a interface intuitiva com navegação por categorias. A aplicação está pronta para utilização "
    "pela congregação.",
    body_style
))

# Build PDF
doc.build(story)
print("PDF gerado com sucesso!")
