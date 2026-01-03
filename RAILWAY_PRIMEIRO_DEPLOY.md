# 🚀 Configurando o Primeiro Deploy no Railway

Você já tem o projeto conectado e o MySQL criado. Agora vamos configurar tudo para o primeiro deploy funcionar.

## 📋 Checklist Antes do Deploy

- [x] Projeto conectado ao GitHub
- [x] MySQL criado
- [ ] Variáveis de ambiente configuradas
- [ ] Build e Start commands configurados
- [ ] Primeiro deploy executado

---

## 🔧 Passo 1: Configurar Variáveis de Ambiente

### 1.1 Adicionar DATABASE_URL

1. No Railway, clique no serviço do seu app (**sunny-youthfulness**)
2. Vá na aba **"Variables"** (ou Settings > Variables)
3. Clique em **"+ New Variable"**
4. Adicione:
   - **Nome**: `DATABASE_URL`
   - **Valor**: `mysql://root:SJwJofTXnvDyGpuKNKJzKWVSpNbwNONF@mysql.railway.internal:3306/railway`
   - **Scope**: Service (deixe como está)

### 1.2 Adicionar JWT_SECRET

1. Na mesma aba **"Variables"**, clique em **"+ New Variable"**
2. Adicione:
   - **Nome**: `JWT_SECRET`
   - **Valor**: Gere uma chave segura (veja abaixo)
   - **Scope**: Service

**Gerar JWT_SECRET:**

No seu terminal local:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Ou use este gerador online: https://generate-secret.vercel.app/32

**Exemplo de valor gerado:**
```
aB3xK9mP2qR7vT5wY8zN1cD4fG6hJ0lM3nB5vC8xZ2qW9eR4tY7uI1oP6aS
```

### 1.3 Adicionar NODE_ENV

1. Na mesma aba **"Variables"**, clique em **"+ New Variable"**
2. Adicione:
   - **Nome**: `NODE_ENV`
   - **Valor**: `production`
   - **Scope**: Service

---

## ⚙️ Passo 2: Configurar Build e Start Commands

1. No serviço **sunny-youthfulness**, vá em **"Settings"**
2. Role até encontrar **"Build & Deploy"** ou **"Deploy"**
3. Configure os seguintes comandos:

### Build Command:
```bash
npm install -g pnpm && pnpm install && pnpm build
```

**OU** se preferir usar npm diretamente:
```bash
npm install && npm run build
```

### Start Command:
```bash
pnpm start
```

**OU** se usar npm:
```bash
npm start
```

### Install Command (se disponível):
```bash
npm install -g pnpm && pnpm install
```

**OU**:
```bash
npm install
```

---

## 🎯 Passo 3: Verificar Configurações do Serviço

1. No serviço **sunny-youthfulness**, vá em **"Settings"**
2. Verifique:

### Service Settings:
- **Name**: sunny-youthfulness (ou o nome que você quiser)
- **Region**: Deixe como está (us-west1)
- **Replicas**: 1 (deixe como está)

### Health Check (opcional):
- Deixe vazio ou configure: `/` (rota raiz)

---

## 🚀 Passo 4: Fazer o Primeiro Deploy

Agora que tudo está configurado:

1. No Railway, você deve ver um botão **"Deploy"** ou **"Deploy the repo Jogramador/sales_management_app"**
2. Clique nele
3. O Railway vai:
   - Clonar o repositório
   - Instalar dependências
   - Executar o build
   - Iniciar o servidor

4. **Aguarde** - o primeiro deploy pode levar alguns minutos

5. **Acompanhe os logs**:
   - Vá em **"Deployments"**
   - Clique no deployment em andamento
   - Veja os logs em tempo real

---

## ✅ Passo 5: Verificar se Funcionou

### 5.1 Verificar Logs

Os logs devem mostrar:
```
✓ Installing dependencies...
✓ Building application...
✓ Starting server...
Server running on http://localhost:3000/
```

### 5.2 Verificar Status

1. No serviço **sunny-youthfulness**, verifique o status
2. Deve mostrar **"Online"** ou **"Deployed"** (com um ponto verde)

### 5.3 Obter URL da Aplicação

1. No serviço **sunny-youthfulness**, vá em **"Settings"**
2. Role até **"Networking"** ou **"Domains"**
3. Clique em **"Generate Domain"**
4. Copie a URL gerada (ex: `sunny-youthfulness-production.up.railway.app`)

### 5.4 Testar a Aplicação

1. Acesse a URL no navegador
2. Você deve ver a página de login
3. Teste fazer login com um nome qualquer

---

## 🐛 Se o Deploy Falhar

### Verificar Logs

1. Vá em **"Deployments"**
2. Clique no deployment que falhou
3. Veja os logs completos
4. Procure por mensagens de erro em vermelho

### Erros Comuns:

#### ❌ "pnpm: command not found"

**Solução**: Use npm no build command:
```bash
npm install && npm run build
```

#### ❌ "Cannot find module"

**Solução**: 
- Verifique se todas as dependências estão no `package.json`
- Certifique-se de que o build command instala as dependências

#### ❌ "DATABASE_URL is required"

**Solução**: 
- Verifique se adicionou a variável `DATABASE_URL`
- Certifique-se de que o valor está correto

#### ❌ "JWT_SECRET is required"

**Solução**: 
- Adicione a variável `JWT_SECRET`
- Certifique-se de que tem pelo menos 32 caracteres

#### ❌ "Build failed"

**Solução**:
1. Veja os logs completos do build
2. Verifique se há erros de TypeScript ou compilação
3. Teste localmente primeiro: `pnpm build`

---

## 📝 Resumo Rápido - O Que Fazer Agora

1. **Variables** → Adicionar:
   - `DATABASE_URL` = `mysql://root:SJwJofTXnvDyGpuKNKJzKWVSpNbwNONF@mysql.railway.internal:3306/railway`
   - `JWT_SECRET` = (gere uma chave de 32+ caracteres)
   - `NODE_ENV` = `production`

2. **Settings** → **Build & Deploy**:
   - Build Command: `npm install -g pnpm && pnpm install && pnpm build`
   - Start Command: `pnpm start`

3. **Deployments** → Clicar em **"Deploy"**

4. Aguardar e verificar logs

5. Obter URL em **Settings** > **Networking** > **Generate Domain**

---

## 🎯 Configuração Mínima Necessária

Para o primeiro deploy funcionar, você PRECISA ter:

✅ **3 Variáveis de Ambiente:**
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

✅ **2 Comandos Configurados:**
- Build Command
- Start Command

✅ **Repositório Conectado:**
- Já está feito ✅

✅ **Banco MySQL Criado:**
- Já está feito ✅

---

## 💡 Dica Importante

Se você não conseguir encontrar onde configurar os comandos:

1. No serviço **sunny-youthfulness**, procure por:
   - **"Settings"** (ícone de engrenagem)
   - **"Deploy"** ou **"Build & Deploy"**
   - **"Configuration"**

2. Se não encontrar, tente:
   - Clicar nos três pontos (**...**) no canto superior direito
   - Procurar por **"Settings"** ou **"Configure"**

---

## 🆘 Ainda Não Funciona?

Se após seguir todos os passos o deploy ainda falhar:

1. **Copie a mensagem de erro completa** dos logs
2. **Verifique se funciona localmente**:
   ```bash
   # No seu computador
   pnpm install
   pnpm build
   pnpm start
   ```

3. Se funcionar localmente mas não no Railway, o problema é de configuração do Railway

4. Verifique se o `package.json` está correto e tem os scripts `build` e `start`

---

**Agora siga os passos acima e tente fazer o deploy novamente!** 🚀
