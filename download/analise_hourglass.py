from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Registrar fontes
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Criar documento
doc = SimpleDocTemplate(
    "/home/z/my-project/download/analise_sistema_ausencias_hourglass.pdf",
    pagesize=A4,
    title="Análise do Sistema de Ausências do Hourglass",
    author='Z.ai',
    creator='Z.ai',
    subject='Análise do funcionamento e limitações do sistema de ausências'
)

story = []
styles = getSampleStyleSheet()

# Estilos
title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='Times New Roman',
    fontSize=24,
    leading=30,
    alignment=TA_CENTER,
    spaceAfter=20
)

heading1_style = ParagraphStyle(
    name='Heading1Style',
    fontName='Times New Roman',
    fontSize=16,
    leading=22,
    alignment=TA_LEFT,
    spaceBefore=18,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

heading2_style = ParagraphStyle(
    name='Heading2Style',
    fontName='Times New Roman',
    fontSize=13,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=12,
    spaceAfter=8,
    textColor=colors.HexColor('#2E75B6')
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='Times New Roman',
    fontSize=11,
    leading=16,
    alignment=TA_JUSTIFY,
    spaceAfter=10
)

cell_style = ParagraphStyle(
    name='CellStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_LEFT
)

header_style = ParagraphStyle(
    name='HeaderStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    textColor=colors.white
)

# Título
story.append(Spacer(1, 60))
story.append(Paragraph("<b>Análise do Sistema de Ausências do Hourglass</b>", title_style))
story.append(Paragraph("Funcionamento, Limitações e Possíveis Melhorias", ParagraphStyle(
    name='Subtitle',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 40))

# 1. Introdução
story.append(Paragraph("<b>1. Introdução</b>", heading1_style))
story.append(Paragraph(
    "O Hourglass é uma aplicação amplamente utilizada para gestão de escalas e designações em congregações das Testemunhas de Jeová. "
    "Um dos módulos essenciais deste sistema é a funcionalidade de <b>Ausências</b> (encontrada no menu Programação), que permite aos "
    "coordenadores registrar períodos em que determinados publicadores não estarão disponíveis para receber designações. Esta análise "
    "tem como objetivo detalhar o funcionamento atual do sistema, identificar suas principais limitações operacionais e propor possíveis "
    "melhorias que poderiam tornar a gestão de ausências mais flexível e eficiente para os usuários.",
    body_style
))

# 2. Como Funciona o Sistema Atual
story.append(Paragraph("<b>2. Como Funciona o Sistema Atual</b>", heading1_style))

story.append(Paragraph("<b>2.1 Estrutura de Dados</b>", heading2_style))
story.append(Paragraph(
    "O sistema de ausências do Hourglass opera com uma estrutura de dados relativamente simples. Cada registro de ausência contém "
    "os seguintes campos principais: o nome do publicador que estará ausente, uma data de início (campo \"De\"), uma data de término "
    "(campo \"Até\"), uma opção para indicar se a ausência se aplica apenas ao Testemunho Público (campo \"Só Testemunho Público\"), "
    "e um campo de notas para observações adicionais. Esta estrutura baseia-se no conceito de períodos contínuos, o que significa que "
    "cada registro representa um intervalo ininterrupto de tempo durante o qual a pessoa não está disponível.",
    body_style
))

story.append(Paragraph("<b>2.2 Lógica de Funcionamento</b>", heading2_style))
story.append(Paragraph(
    "Quando um registro de ausência é criado, o sistema automaticamente exclui o publicador das listas de disponíveis durante todo "
    "o período especificado. Isso significa que, ao gerar escalas ou fazer designações manuais, o coordenador não verá aquele "
    "publicador como opção disponível. A intenção por trás deste design é evitar que pessoas que estão viajando ou temporariamente "
    "indisponíveis recebam designações, o que causaria problemas de preenchimento de designações e necessidade de substituições "
    "de última hora. O sistema também oferece filtros por gênero, privilégio de serviço, tipo de publicador e outros critérios para "
    "facilitar a gestão dos registros.",
    body_style
))

# Tabela de estrutura
story.append(Spacer(1, 12))
data = [
    [Paragraph('<b>Campo</b>', header_style), Paragraph('<b>Descrição</b>', header_style), Paragraph('<b>Tipo</b>', header_style)],
    [Paragraph('Nome', cell_style), Paragraph('Nome do publicador ausente', cell_style), Paragraph('Texto', cell_style)],
    [Paragraph('De', cell_style), Paragraph('Data inicial do período de ausência', cell_style), Paragraph('Data', cell_style)],
    [Paragraph('Até', cell_style), Paragraph('Data final do período de ausência', cell_style), Paragraph('Data', cell_style)],
    [Paragraph('Só Testemunho Público', cell_style), Paragraph('Indica se ausência é apenas para Testemunho Público', cell_style), Paragraph('Booleano', cell_style)],
    [Paragraph('Notas', cell_style), Paragraph('Observações adicionais sobre a ausência', cell_style), Paragraph('Texto', cell_style)],
]

t = Table(data, colWidths=[100, 250, 80])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(Spacer(1, 6))
story.append(Paragraph("<b>Tabela 1.</b> Estrutura de dados do sistema de ausências", ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#666666')
)))

# 3. Limitações Identificadas
story.append(Paragraph("<b>3. Limitações Identificadas</b>", heading1_style))

story.append(Paragraph("<b>3.1 Impossibilidade de Marcar Dias Isolados</b>", heading2_style))
story.append(Paragraph(
    "A limitação mais significativa do sistema atual é a impossibilidade de registrar ausências para dias específicos e não contíguos. "
    "O sistema foi projetado para aceitar apenas intervalos contínuos de datas (de segunda a sexta, por exemplo), mas não consegue lidar "
    "com cenários comuns onde uma pessoa pode estar disponível em alguns dias da semana e indisponível em outros. Esta é uma necessidade "
    "frequente em congregações, onde muitos publicadores têm compromissos variáveis ao longo da semana.",
    body_style
))

story.append(Paragraph("<b>3.2 Cenário Problema Típico</b>", heading2_style))
story.append(Paragraph(
    "Considere o seguinte cenário prático: um irmão precisa viajar na terça-feira de uma determinada semana, mas retorna e estará "
    "disponível para as reuniões e designações no sábado da mesma semana. Com o sistema atual, o coordenador enfrenta um dilema "
    "insolúvel dentro da própria aplicação. Se registrar a ausência de terça a sábado, o irmão será excluído indevidamente das "
    "designações de sábado. Se não registrar nenhuma ausência, corre o risco de o sistema designar automaticamente aquele irmão "
    "para a terça-feira, criando um problema de escala que precisará ser resolvido manualmente posteriormente.",
    body_style
))

story.append(Paragraph("<b>3.3 Consequências Operacionais</b>", heading2_style))
story.append(Paragraph(
    "Esta limitação gera diversos problemas operacionais para os coordenadores de escala. Primeiro, há um aumento significativo "
    "no trabalho manual, pois é necessário verificar e ajustar escalas que foram geradas automaticamente com designações inadequadas. "
    "Segundo, existe o risco de esquecimento, já que ausências que não podem ser registradas adequadamente no sistema podem ser "
    "esquecidas, resultando em designações para pessoas ausentes. Terceiro, há perda de confiança no sistema, uma vez que os "
    "coordenadores passam a não confiar nas escalas geradas automaticamente, revertendo a processos manuais. Quarto, a comunicação "
    "informal passa a ser necessária, exigindo que os coordenadores mantenham listas paralelas de ausências \"não registráveis\" "
    "em papel ou outros sistemas.",
    body_style
))

# 4. Exemplos Práticos
story.append(Paragraph("<b>4. Exemplos Práticos do Problema</b>", heading1_style))

story.append(Paragraph("<b>4.1 Exemplo 1: Viagem de Meia Semana</b>", heading2_style))
story.append(Paragraph(
    "Um publicador precisa viajar de terça a quinta-feira por motivos de trabalho, mas estará presente e disponível para o "
    "Testemunho Público no sábado. No sistema atual, seria necessário criar um registro de ausência de terça a quinta. Porém, "
    "se o coordenador esquecer de criar um registro separado para designações de sábado, o sistema não saberá que aquela pessoa "
    "está disponível especificamente no sábado. Esta fragmentação de informações torna a gestão de escalas mais complexa e "
    "propensa a erros.",
    body_style
))

story.append(Paragraph("<b>4.2 Exemplo 2: Compromissos Recorrentes</b>", heading2_style))
story.append(Paragraph(
    "Um ancião tem uma reunião de trabalho toda quarta-feira à noite, mas está disponível para todas as outras atividades da "
    "congregação. Atualmente, não há forma de registrar este tipo de ausência recorrente parcial. O coordenador teria que criar "
    "múltiplos registros de ausência (um para cada quarta-feira) ou simplesmente lembrar manualmente desta restrição ao fazer "
    "as escalas. Ambas as soluções são ineficientes e propensas a erros, especialmente em congregações com muitos publicadores "
    "e múltiplas restrições de disponibilidade.",
    body_style
))

# Tabela de comparação
story.append(Spacer(1, 12))
data2 = [
    [Paragraph('<b>Situação</b>', header_style), 
     Paragraph('<b>Comportamento Atual</b>', header_style), 
     Paragraph('<b>Comportamento Ideal</b>', header_style)],
    [Paragraph('Ausência de 1 dia isolado', cell_style), 
     Paragraph('Precisa marcar o dia inteiro ou período maior', cell_style), 
     Paragraph('Permitir seleção de dias específicos', cell_style)],
    [Paragraph('Disponível em alguns dias da semana', cell_style), 
     Paragraph('Não há como registrar parcialmente', cell_style), 
     Paragraph('Seleção múltipla de dias disponíveis', cell_style)],
    [Paragraph('Ausência recorrente semanal', cell_style), 
     Paragraph('Precisa criar múltiplos registros', cell_style), 
     Paragraph('Opção de recorrência automática', cell_style)],
    [Paragraph('Ausência apenas para certain tipo', cell_style), 
     Paragraph('Apenas opção "Só Testemunho Público"', cell_style), 
     Paragraph('Seleção por tipo de designação', cell_style)],
]

t2 = Table(data2, colWidths=[130, 150, 150])
t2.setStyle(TableStyle([
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
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t2)
story.append(Spacer(1, 6))
story.append(Paragraph("<b>Tabela 2.</b> Comparação entre comportamento atual e ideal", ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#666666')
)))

# 5. Sugestões de Melhoria
story.append(Paragraph("<b>5. Sugestões de Melhoria</b>", heading1_style))

story.append(Paragraph("<b>5.1 Seleção de Dias Específicos</b>", heading2_style))
story.append(Paragraph(
    "A melhoria mais impactante seria a implementação de um seletor de dias específicos, similar ao encontrado em calendários "
    "modernos. Em vez de apenas dois campos de data (início e fim), o sistema poderia oferecer uma visualização de calendário "
    "onde o usuário pudesse selecionar individualmente cada dia de ausência. Esta abordagem permitiria marcar terça e quinta "
    "como dias de ausência, mantendo quarta e sábado como dias disponíveis, tudo em um único registro. A interface poderia "
    "manter o formato atual de período para compatibilidade, mas adicionar uma opção \"Selecionar dias específicos\" para casos "
    "mais complexos.",
    body_style
))

story.append(Paragraph("<b>5.2 Sistema de Disponibilidade Granular</b>", heading2_style))
story.append(Paragraph(
    "Uma abordagem mais abrangente seria inverter a lógica do sistema: em vez de registrar ausências, registrar disponibilidades. "
    "Cada publicador poderia ter um perfil de disponibilidade padrão (ex: \"Disponível terças, quartas e sábados\") e o sistema "
    "automaticamente saberia em quais dias aquela pessoa pode ou não receber designações. Ausências temporárias poderiam ser "
    "adicionadas sobrepostas a este perfil base. Esta abordagem espelharia melhor a realidade de muitos publicadores que têm "
    "disponibilidade fixa e previsível ao longo do tempo.",
    body_style
))

story.append(Paragraph("<b>5.3 Ausências Recorrentes</b>", heading2_style))
story.append(Paragraph(
    "Para situações como a do ancião que tem reuniões todas as quartas-feiras, seria extremamente útil um sistema de recorrência. "
    "O usuário poderia criar uma ausência com padrão de repetição (\"Toda quarta-feira\", \"Primeiro sábado do mês\", etc.) com "
    "datas de início e fim para a recorrência. Isso reduziria drasticamente o trabalho administrativo de criar múltiplos registros "
    "idênticos e garantiria que o sistema sempre considerasse estas restrições ao gerar escalas automaticamente.",
    body_style
))

story.append(Paragraph("<b>5.4 Categorias de Ausência por Tipo de Designação</b>", heading2_style))
story.append(Paragraph(
    "Atualmente, o sistema oferece apenas a opção \"Só Testemunho Público\" para restringir o escopo da ausência. Uma melhoria "
    "significativa seria permitir a seleção de múltiplas categorias de designação para cada ausência. Por exemplo, um publicador "
    "poderia estar indisponível para leitura na reunião de meio de semana, mas disponível para Testemunho Público. Outro poderia "
    "estar disponível para todas as designações exceto orações. Esta granularidade permitiria um uso muito mais eficiente dos "
    "recursos humanos da congregação.",
    body_style
))

# 6. Conclusão
story.append(Paragraph("<b>6. Conclusão</b>", heading1_style))
story.append(Paragraph(
    "O sistema de ausências do Hourglass cumpre sua função básica de impedir que pessoas ausentes recebam designações, mas sua "
    "arquitetura baseada exclusivamente em períodos contínuos apresenta limitações significativas para cenários do mundo real. "
    "A impossibilidade de marcar dias isolados ou indisponibilidades parciais dentro de uma mesma semana força os coordenadores "
    "a recorrer a soluções alternativas e processos manuais, reduzindo a eficácia do sistema como ferramenta de gestão.",
    body_style
))
story.append(Paragraph(
    "As melhorias propostas – seleção de dias específicos, sistema de disponibilidade granular, ausências recorrentes e categorias "
    "por tipo de designação – transformariam o sistema em uma ferramenta muito mais poderosa e alinhada com as necessidades "
    "reais das congregações. A implementação destas funcionalidades exigiria mudanças na estrutura de dados e interface do usuário, "
    "mas o benefício em termos de redução de trabalho administrativo e aumento da confiabilidade do sistema seria significativo.",
    body_style
))

# Construir PDF
doc.build(story)
print("PDF criado com sucesso!")
