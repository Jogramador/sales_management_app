# Sales Management App

Aplicação de gerenciamento de vendas full-stack construída com React, Express, tRPC e MySQL.

## 📋 Pré-requisitos

Antes de executar a aplicação, você precisa ter instalado:

1. **Node.js** (versão 18 ou superior)
2. **pnpm** (gerenciador de pacotes) - versão 10.4.1 ou superior
3. **MySQL** (banco de dados) - versão 8.0 ou superior
4. **Git** (opcional, para clonar o repositório)

## 🚀 Instalação

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/nome_do_banco

# Autenticação JWT
JWT_SECRET=sua_chave_secreta_jwt_aqui

# OAuth (opcional, se usar autenticação OAuth)
OAUTH_SERVER_URL=https://seu-servidor-oauth.com
OWNER_OPEN_ID=seu_open_id_aqui

# App ID (opcional)
VITE_APP_ID=seu_app_id

# Forge API (opcional, para funcionalidades específicas)
BUILT_IN_FORGE_API_URL=https://api.forge.com
BUILT_IN_FORGE_API_KEY=sua_chave_api

# Twilio (opcional, para WhatsApp)
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_NUMBER=seu_numero_whatsapp
```

**Variáveis obrigatórias mínimas:**
- `DATABASE_URL` - URL de conexão com o MySQL
- `JWT_SECRET` - Chave secreta para assinatura de tokens JWT

### 3. Configurar o banco de dados

1. Crie um banco de dados MySQL:
```sql
CREATE DATABASE sales_management;
```

2. Execute as migrations:
```bash
pnpm db:push
```

Isso irá criar todas as tabelas necessárias no banco de dados.

## 🏃 Executando a aplicação

### Modo de desenvolvimento

```bash
pnpm dev
```

Isso irá iniciar:
- Servidor backend na porta padrão (geralmente 3000 ou 5000)
- Servidor frontend com Vite (geralmente na porta 5173)

### Modo de produção

1. Build da aplicação:
```bash
pnpm build
```

2. Iniciar o servidor:
```bash
pnpm start
```

## 📁 Estrutura do Projeto

```
sales_management_app/
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── components/ # Componentes React
│   │   └── lib/        # Utilitários
├── server/              # Backend Express + tRPC
│   ├── _core/          # Core do servidor
│   └── routers.ts      # Rotas tRPC
├── shared/              # Código compartilhado
├── drizzle/             # Schema e migrations do banco
└── package.json         # Dependências e scripts
```

## 🛠️ Scripts Disponíveis

- `pnpm dev` - Inicia o servidor em modo desenvolvimento
- `pnpm build` - Compila a aplicação para produção
- `pnpm start` - Inicia o servidor em modo produção
- `pnpm check` - Verifica erros de TypeScript
- `pnpm format` - Formata o código com Prettier
- `pnpm test` - Executa os testes
- `pnpm db:push` - Gera e executa migrations do banco de dados

## 🔧 Tecnologias Utilizadas

- **Frontend:**
  - React 19
  - Vite
  - TypeScript
  - Tailwind CSS
  - tRPC Client
  - React Query
  - Radix UI

- **Backend:**
  - Express
  - tRPC Server
  - TypeScript
  - Drizzle ORM
  - MySQL2

- **Ferramentas:**
  - pnpm
  - Vitest
  - Prettier

## 📝 Notas Importantes

- A aplicação usa **pnpm** como gerenciador de pacotes. Não use `npm` ou `yarn`.
- Certifique-se de que o MySQL está rodando antes de executar a aplicação.
- As variáveis de ambiente são essenciais para o funcionamento correto da aplicação.
- O banco de dados precisa ser criado e as migrations executadas antes de iniciar a aplicação.

## 🐛 Solução de Problemas

### Erro de conexão com o banco de dados
- Verifique se o MySQL está rodando
- Confirme que a `DATABASE_URL` está correta
- Verifique se o banco de dados foi criado

### Erro ao instalar dependências
- Certifique-se de estar usando pnpm: `npm install -g pnpm`
- Tente limpar o cache: `pnpm store prune`

### Erro ao executar migrations
- Verifique se a `DATABASE_URL` está configurada corretamente
- Confirme que o usuário MySQL tem permissões para criar tabelas


