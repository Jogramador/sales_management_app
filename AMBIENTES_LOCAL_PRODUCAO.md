# 🌍 Guia de Ambientes: Desenvolvimento Local vs Produção

Este guia explica quando e como usar a aplicação em desenvolvimento local e em produção.

## 📋 Quando Usar Cada Ambiente

### 🏠 Desenvolvimento Local

Use o ambiente local quando:
- ✅ Estiver desenvolvendo novas funcionalidades
- ✅ Testando mudanças antes de fazer deploy
- ✅ Debugando problemas
- ✅ Executando migrations do banco de dados
- ✅ Testando integrações (Google OAuth, etc.)
- ✅ Trabalhando com dados de teste

**Vantagens:**
- Desenvolvimento rápido e iterativo
- Debug mais fácil
- Não afeta usuários reais
- Testes sem custos de infraestrutura

### 🚀 Produção (Railway)

Use o ambiente de produção quando:
- ✅ Aplicação está pronta para usuários reais
- ✅ Precisa estar disponível 24/7
- ✅ Dados reais devem ser persistidos
- ✅ Múltiplos usuários precisam acessar

**Vantagens:**
- Disponibilidade constante
- Escalabilidade automática
- Backup automático do banco de dados
- Domínio público acessível

---

## 🔧 Configuração do Ambiente Local

### Pré-requisitos

1. **MySQL instalado localmente**
   - Windows: Baixe do [site oficial](https://dev.mysql.com/downloads/mysql/)
   - Mac: `brew install mysql`
   - Linux: `sudo apt-get install mysql-server`

2. **Node.js e pnpm instalados**
   ```bash
   node --version  # Deve ser 18+
   pnpm --version  # Deve ser 10.4.1+
   ```

### Passo 1: Configurar Banco de Dados Local

1. **Criar banco de dados:**
   ```sql
   CREATE DATABASE sales_management;
   ```

2. **Configurar usuário (opcional):**
   ```sql
   CREATE USER 'sales_user'@'localhost' IDENTIFIED BY 'sua_senha';
   GRANT ALL PRIVILEGES ON sales_management.* TO 'sales_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Passo 2: Configurar Arquivo `.env` Local

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# Banco de Dados Local
DATABASE_URL=mysql://root:sua_senha@localhost:3306/sales_management

# Autenticação JWT
JWT_SECRET=sua_chave_secreta_local_aqui

# Google OAuth - DESENVOLVIMENTO LOCAL

GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
BASE_URL=http://localhost:3000

# OAuth Manus (opcional - deixe vazio se não usar)
OAUTH_SERVER_URL=
OWNER_OPEN_ID=
VITE_OAUTH_PORTAL_URL=

# App ID (opcional)
VITE_APP_ID=

# Node Environment
NODE_ENV=development
```

**⚠️ Importante:** 
- Use `localhost` ou `127.0.0.1` no `DATABASE_URL`
- Use `http://localhost:3000` nas URLs do Google OAuth
- Configure a mesma URI no Google Cloud Console

### Passo 3: Configurar Google OAuth para Local

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs e Serviços** > **Credenciais**
3. Clique no seu **ID do cliente OAuth**
4. Em **"URIs de redirecionamento autorizados"**, adicione:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Clique em **Salvar**

### Passo 4: Executar Migrations Localmente

```bash
# Aplicar migrations
pnpm db:push
```

### Passo 5: Iniciar Aplicação Local

```bash
# Instalar dependências (se ainda não instalou)
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em: `http://localhost:3000`

---

## 🚀 Configuração do Ambiente de Produção (Railway)

### Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Projeto conectado ao GitHub
3. Serviço MySQL criado no Railway

### Passo 1: Configurar Variáveis de Ambiente no Railway

No Railway, vá no serviço da sua aplicação e configure as variáveis:

#### Variáveis Obrigatórias:

```env
# Banco de Dados (URL interna do Railway)
DATABASE_URL=mysql://root:SENHA@mysql.railway.internal:3306/railway

# Autenticação JWT
JWT_SECRET=sua_chave_secreta_producao_aqui

# Node Environment
NODE_ENV=production
```

#### Variáveis do Google OAuth (Produção):





**⚠️ Importante:**
- URL de produção: `https://sunny-youthfulness-production.up.railway.app`
- Use `https://` (não `http://`) em produção
- A URL deve corresponder exatamente ao domínio do Railway

### Passo 2: Configurar Google OAuth para Produção

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs e Serviços** > **Credenciais**
3. Clique no seu **ID do cliente OAuth**
4. Em **"URIs de redirecionamento autorizados"**, adicione:
   ```
   https://sunny-youthfulness-production.up.railway.app/api/auth/google/callback
   ```
5. Clique em **Salvar**

### Passo 3: Configurar Build e Start Commands

No Railway, vá em **Settings** > **Build & Deploy**:

**Build Command:**
```bash
pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start
```

### Passo 4: Executar Migrations em Produção

**Opção 1: Via Terminal do Railway (Recomendado)**

1. No Railway, abra o **Terminal/Shell** do serviço
2. Execute:
   ```bash
   pnpm db:push
   ```

**Opção 2: Via Deploy Automático**

As migrations podem ser executadas automaticamente se você adicionar ao script de build (não recomendado para produção).

### Passo 5: Verificar Deploy

1. Após o deploy, verifique os logs no Railway
2. Acesse a URL pública do seu app
3. Teste o login com Google

---

## 🔄 Fluxo de Trabalho Recomendado

### Desenvolvimento de Nova Funcionalidade

1. **Desenvolver localmente:**
   ```bash
   # No seu computador
   git checkout -b feature/nova-funcionalidade
   # ... fazer alterações ...
   pnpm dev  # Testar localmente
   ```

2. **Testar localmente:**
   - Testar todas as funcionalidades
   - Verificar se não há erros
   - Testar login com Google

3. **Commit e Push:**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade"
   git push origin feature/nova-funcionalidade
   ```

4. **Deploy em Produção:**
   - Criar Pull Request no GitHub
   - Após aprovação, fazer merge na branch principal
   - O Railway fará deploy automático
   - Verificar logs e testar em produção

### Aplicar Migrations do Banco de Dados

**Local:**
```bash
# 1. Fazer alterações no schema (drizzle/schema.ts)
# 2. Gerar e aplicar migration
pnpm db:push
```

**Produção:**
```bash
# 1. Fazer alterações no schema
# 2. Commit e push
git add .
git commit -m "chore: atualiza schema do banco"
git push

# 3. Após deploy, executar no terminal do Railway:
pnpm db:push
```

---

## 📊 Comparação: Local vs Produção

| Aspecto | Desenvolvimento Local | Produção (Railway) |
|---------|----------------------|-------------------|
| **Banco de Dados** | MySQL local | MySQL Railway |
| **URL** | `http://localhost:3000` | `https://sunny-youthfulness-production.up.railway.app` |
| **DATABASE_URL** | `mysql://...@localhost:3306/...` | `mysql://...@mysql.railway.internal:3306/...` |
| **Google Redirect** | `http://localhost:3000/api/auth/google/callback` | `https://sunny-youthfulness-production.up.railway.app/api/auth/google/callback` |
| **NODE_ENV** | `development` | `production` |
| **Hot Reload** | ✅ Sim (Vite) | ❌ Não |
| **Logs** | Terminal local | Dashboard Railway |
| **Acesso** | Apenas você | Público na internet |
| **Dados** | Dados de teste | Dados reais |

---

## ⚠️ Boas Práticas

### Segurança

1. **Nunca commite o arquivo `.env`**
   - O `.env` já está no `.gitignore`
   - Use variáveis de ambiente no Railway

2. **Use JWT_SECRET diferentes**
   - Local: chave de desenvolvimento
   - Produção: chave forte e única

3. **Mantenha credenciais seguras**
   - Não compartilhe `GOOGLE_CLIENT_SECRET` publicamente
   - Use variáveis de ambiente no Railway

### Desenvolvimento

1. **Sempre teste localmente antes de fazer deploy**
   - Economiza tempo e evita problemas em produção

2. **Use branches para features**
   - `feature/nome-da-feature`
   - `fix/nome-do-bug`

3. **Faça commits descritivos**
   ```bash
   git commit -m "feat: adiciona login com Google"
   git commit -m "fix: corrige erro de autenticação"
   ```

### Produção

1. **Monitore os logs do Railway**
   - Verifique erros regularmente
   - Configure alertas se possível

2. **Faça backups regulares**
   - O Railway faz backup automático do MySQL
   - Considere backups adicionais para dados críticos

3. **Teste após cada deploy**
   - Verifique se a aplicação está funcionando
   - Teste login e funcionalidades principais

---

## 🐛 Solução de Problemas

### Problema: Erro ao conectar ao banco local

**Solução:**
- Verifique se o MySQL está rodando: `mysql --version`
- Confirme a senha no `DATABASE_URL`
- Verifique se o banco existe: `SHOW DATABASES;`

### Problema: Google OAuth não funciona localmente

**Solução:**
- Verifique se a URI está configurada no Google Cloud Console
- Confirme que está usando `http://localhost:3000` (não `https://`)
- Verifique se as variáveis estão no `.env`

### Problema: Erro ao fazer deploy no Railway

**Solução:**
- Verifique os logs do deploy no Railway
- Confirme que todas as variáveis estão configuradas
- Verifique se o Build Command está correto
- Confirme que `pnpm` está disponível (pode precisar instalar)

### Problema: Migration não funciona em produção

**Solução:**
- Use o terminal do Railway (não tente executar localmente com URL do Railway)
- Verifique se `DATABASE_URL` está configurada corretamente
- Confirme que tem permissões no banco

---

## 📝 Checklist de Deploy

Antes de fazer deploy em produção, verifique:

- [ ] Código testado localmente
- [ ] Migrations aplicadas localmente (se houver)
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Google OAuth configurado com URL de produção
- [ ] Build e Start commands configurados
- [ ] Logs do Railway verificados após deploy
- [ ] Aplicação testada em produção

---

## 🔗 Links Úteis

- [Railway Dashboard](https://railway.app/dashboard)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Documentação Railway](https://docs.railway.app)
- [Documentação Drizzle ORM](https://orm.drizzle.team)

---

## 💡 Dicas Finais

1. **Mantenha ambientes separados:** Nunca misture configurações de local e produção
2. **Documente mudanças:** Anote alterações importantes no código
3. **Teste sempre:** Teste localmente antes de fazer deploy
4. **Monitore produção:** Verifique logs e métricas regularmente
5. **Backup:** Sempre tenha backup dos dados importantes

---

**Última atualização:** Dezembro 2024
