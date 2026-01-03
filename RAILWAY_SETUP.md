# 🚂 Guia Passo a Passo - Railway

Você já tem o projeto conectado e o banco MySQL criado. Agora siga estes passos:

## 📋 Passo 1: Conectar o Serviço ao Banco MySQL

1. No Railway, clique no serviço **MySQL** (o banco de dados)
2. Vá na aba **"Variables"**
3. Copie a variável **`MYSQL_URL`** ou **`DATABASE_URL`** (o Railway cria automaticamente)
4. Volte para o serviço do seu app (sunny-youthfulness)
5. Vá na aba **"Variables"**
6. Clique em **"+ New Variable"**
7. Adicione:
   - **Nome**: `DATABASE_URL`
   - **Valor**: Cole a URL que você copiou do MySQL
   - **Scope**: Deixe como está (Service)

**OU** use a opção mais fácil:
1. No serviço do MySQL, clique em **"Connect"** ou **"Add to Project"**
2. O Railway pode criar automaticamente a variável `DATABASE_URL` no seu serviço

## 🔐 Passo 2: Adicionar JWT_SECRET

1. No serviço do seu app, aba **"Variables"**
2. Clique em **"+ New Variable"**
3. Adicione:
   - **Nome**: `JWT_SECRET`
   - **Valor**: Gere uma chave segura (veja abaixo)
   - **Scope**: Service

**Gerar JWT_SECRET:**

No terminal local (ou use um gerador online):
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Ou use este gerador online: https://generate-secret.vercel.app/32

**Exemplo de valor**: `aB3xK9mP2qR7vT5wY8zN1cD4fG6hJ0lM3nB5vC8xZ2qW9eR4tY7uI1oP6aS`

## ⚙️ Passo 3: Adicionar NODE_ENV

1. Na mesma aba **"Variables"**
2. Clique em **"+ New Variable"**
3. Adicione:
   - **Nome**: `NODE_ENV`
   - **Valor**: `production`
   - **Scope**: Service

## 🔧 Passo 4: Verificar Configurações de Build

1. No serviço do seu app, vá na aba **"Settings"**
2. Verifique se está configurado:
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Root Directory**: (deixe vazio ou `/`)

Se não estiver configurado, adicione manualmente.

## 🗄️ Passo 5: Executar Migrations do Banco

Você precisa executar as migrations para criar as tabelas. Duas opções:

### Opção A: Via Terminal do Railway (Recomendado)

1. No serviço do seu app, clique em **"Deployments"**
2. Clique no deployment mais recente
3. Abra o terminal (ícone de terminal ou "View Logs" > "Shell")
4. Execute:
   ```bash
   pnpm db:push
   ```

### Opção B: Via Terminal Local

1. No terminal local, configure a variável:
   ```bash
   export DATABASE_URL="mysql://usuario:senha@host:porta/banco"
   ```
   (Use a URL que você copiou do Railway)

2. Execute:
   ```bash
   pnpm db:push
   ```

## 🚀 Passo 6: Fazer Deploy

1. No Railway, clique em **"Deploy"** ou **"Deploy ↑+Enter"**
2. O Railway vai:
   - Instalar dependências (`pnpm install`)
   - Fazer build (`pnpm build`)
   - Iniciar o servidor (`pnpm start`)

3. Aguarde o deploy terminar (veja os logs)

## 🌐 Passo 7: Obter URL da Aplicação

1. No serviço do seu app, vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"** (se ainda não tiver)
4. Copie a URL gerada (ex: `sunny-youthfulness-production.up.railway.app`)

## ✅ Verificar se Está Funcionando

1. Acesse a URL gerada no navegador
2. Você deve ver a página de login
3. Teste fazer login com um nome qualquer

## 🐛 Problemas Comuns

### Erro: "Cannot connect to database"

**Solução**:
- Verifique se a variável `DATABASE_URL` está correta
- Certifique-se de que copiou a URL completa do MySQL
- Verifique se o banco MySQL está "Online" (status verde)

### Erro: "JWT_SECRET is required"

**Solução**:
- Verifique se adicionou a variável `JWT_SECRET`
- Certifique-se de que tem pelo menos 32 caracteres
- Reinicie o deploy após adicionar

### Erro: "Table doesn't exist"

**Solução**:
- Execute as migrations: `pnpm db:push`
- Verifique os logs para ver se houve erro na migration

### Build falha

**Solução**:
- Verifique os logs do build
- Certifique-se de que o `package.json` tem os scripts corretos
- Verifique se todas as dependências estão no `package.json`

## 📝 Checklist Final

- [ ] Variável `DATABASE_URL` configurada (copiada do MySQL)
- [ ] Variável `JWT_SECRET` configurada (mínimo 32 caracteres)
- [ ] Variável `NODE_ENV=production` configurada
- [ ] Build Command: `pnpm install && pnpm build`
- [ ] Start Command: `pnpm start`
- [ ] Migrations executadas (`pnpm db:push`)
- [ ] Deploy concluído com sucesso
- [ ] URL da aplicação funcionando

## 🎉 Pronto!

Sua aplicação deve estar no ar! Acesse a URL gerada pelo Railway e teste.

---

**Dica**: Você pode adicionar um domínio customizado depois em Settings > Networking > Custom Domain
