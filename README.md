# Sistema de Designações - Congregação

Sistema para gerenciamento de designações congregacionais.

## Estrutura do Projeto

```
├── client/           # Frontend React + Vite + Material UI
│   ├── src/
│   │   ├── pages/    # Páginas da aplicação
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── App.tsx   # Componente principal
│   │   └── main.tsx  # Entrada da aplicação
│   └── package.json
│
├── server/           # Backend Express + MongoDB
│   ├── src/
│   │   ├── routes/   # Rotas da API REST
│   │   ├── db.ts     # Conexão MongoDB
│   │   └── index.ts  # Servidor Express
│   └── package.json
│
└── package.json      # Configuração workspace
```

## Instalação

```bash
# Instalar todas as dependências
npm install

# Iniciar em desenvolvimento (frontend + backend)
npm run dev

# Ou iniciar individualmente
npm run dev:client   # Frontend em http://localhost:5173
npm run dev:server   # Backend em http://localhost:3001
```

## Variáveis de Ambiente

Crie um arquivo `server/.env` com:

```
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=sua_chave_secreta
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Usuário atual

### Publicadores
- `GET /api/publicadores` - Listar todos
- `GET /api/publicadores/:id` - Buscar por ID
- `POST /api/publicadores` - Criar
- `PUT /api/publicadores/:id` - Atualizar
- `DELETE /api/publicadores/:id` - Remover

### Etiquetas
- `GET /api/etiquetas` - Listar todas
- `POST /api/etiquetas` - Criar
- `PUT /api/etiquetas/:id` - Atualizar
- `DELETE /api/etiquetas/:id` - Remover

### Semanas e Designações
- `GET /api/semanas` - Listar semanas
- `POST /api/semanas` - Criar semana
- `GET /api/designacoes` - Listar designações
- `POST /api/designacoes` - Criar designação

## Tecnologias

**Frontend:**
- React 18
- Vite
- Material UI
- TypeScript
- Leaflet (mapas)
- Axios

**Backend:**
- Express.js
- MongoDB (driver nativo)
- TypeScript
- JWT (autenticação)
- bcryptjs (senhas)

## Credenciais Padrão

```
Email: admin@congregacao.local
Senha: admin123
```
