# 🔧 Corrigindo Erro de Deploy no Railway

Se você está vendo "There was an error deploying from source", siga estes passos:

## 🔍 Passo 1: Verificar Logs do Deploy

1. No Railway, clique no serviço **sunny-youthfulness**
2. Vá na aba **"Deployments"**
3. Clique no deployment que falhou (deve ter um ícone de erro)
4. Veja os **logs** para identificar o erro específico

Os erros mais comuns são:
- ❌ "Build command not found"
- ❌ "pnpm: command not found"
- ❌ "Cannot find module"
- ❌ "Port already in use"
- ❌ "DATABASE_URL is required"

---

## ✅ Passo 2: Configurar Build e Start Commands

No Railway, você precisa configurar os comandos de build e start:

1. No serviço **sunny-youthfulness**, vá em **"Settings"**
2. Role até **"Build & Deploy"** ou **"Deploy"**
3. Configure:

### Build Command:
```bash
pnpm install && pnpm build
```

### Start Command:
```bash
pnpm start
```

### Install Command (se disponível):
```bash
pnpm install
```

**OU** se pnpm não estiver disponível, use npm:

### Build Command:
```bash
npm install && npm run build
```

### Start Command:
```bash
npm start
```

---

## 🔐 Passo 3: Verificar Variáveis de Ambiente

Certifique-se de que todas as variáveis estão configuradas:

1. No serviço **sunny-youthfulness**, vá em **"Variables"**
2. Verifique se tem:

### Variáveis Obrigatórias:

✅ **DATABASE_URL**
- Valor: `mysql://root:SJwJofTXnvDyGpuKNKJzKWVSpNbwNONF@mysql.railway.internal:3306/railway`

✅ **JWT_SECRET**
- Valor: Uma chave de pelo menos 32 caracteres
- Gere com: `openssl rand -base64 32`
- Exemplo: `aB3xK9mP2qR7vT5wY8zN1cD4fG6hJ0lM3nB5vC8xZ2qW9eR4tY7uI1oP6aS`

✅ **NODE_ENV**
- Valor: `production`

### Variáveis Opcionais (mas recomendadas):

✅ **PORT**
- Valor: `3000` (ou deixe o Railway escolher automaticamente)

---

## 🛠️ Passo 4: Verificar se pnpm está Instalado

O Railway pode não ter pnpm instalado por padrão. Duas opções:

### Opção A: Usar npm (mais compatível)

Altere os comandos para usar npm:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### Opção B: Instalar pnpm no Build

**Build Command:**
```bash
npm install -g pnpm && pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start
```

---

## 📦 Passo 5: Verificar package.json

Certifique-se de que o `package.json` tem os scripts corretos:

```json
{
  "scripts": {
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "cross-env NODE_ENV=production node dist/index.js"
  }
}
```

---

## 🚀 Passo 6: Configuração Completa no Railway

### Settings > Build & Deploy:

**Build Command:**
```bash
npm install -g pnpm && pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start
```

**OR** (se preferir npm):

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### Settings > Variables:

```
DATABASE_URL=mysql://root:SJwJofTXnvDyGpuKNKJzKWVSpNbwNONF@mysql.railway.internal:3306/railway
JWT_SECRET=sua_chave_secreta_aqui_minimo_32_caracteres
NODE_ENV=production
```

---

## 🐛 Erros Comuns e Soluções

### Erro: "pnpm: command not found"

**Solução**: Use npm ou instale pnpm no build command:
```bash
npm install -g pnpm && pnpm install && pnpm build
```

### Erro: "Cannot find module 'dist/index.js'"

**Causa**: Build não foi executado ou falhou

**Solução**: 
1. Verifique se o build command está correto
2. Verifique os logs do build
3. Certifique-se de que `pnpm build` ou `npm run build` está funcionando

### Erro: "DATABASE_URL is required"

**Solução**: Adicione a variável `DATABASE_URL` nas Settings > Variables

### Erro: "JWT_SECRET is required"

**Solução**: Adicione a variável `JWT_SECRET` nas Settings > Variables

### Erro: "Port 3000 is already in use"

**Solução**: 
1. Adicione variável `PORT` com valor diferente (ex: `3001`)
2. OU deixe o Railway escolher automaticamente (remova a variável PORT)

### Erro: "Build failed"

**Solução**:
1. Verifique os logs completos do build
2. Certifique-se de que todas as dependências estão no `package.json`
3. Verifique se não há erros de TypeScript: `pnpm check`

---

## ✅ Checklist Antes de Deploy

Antes de tentar fazer deploy novamente, verifique:

- [ ] Build Command configurado: `pnpm install && pnpm build` (ou com npm)
- [ ] Start Command configurado: `pnpm start` (ou `npm start`)
- [ ] Variável `DATABASE_URL` adicionada
- [ ] Variável `JWT_SECRET` adicionada (mínimo 32 caracteres)
- [ ] Variável `NODE_ENV=production` adicionada
- [ ] `package.json` tem os scripts `build` e `start`
- [ ] Não há erros de TypeScript localmente (`pnpm check`)

---

## 🎯 Passo a Passo Rápido

1. **Settings** > **Build & Deploy**
   - Build Command: `npm install -g pnpm && pnpm install && pnpm build`
   - Start Command: `pnpm start`

2. **Settings** > **Variables** (ou aba Variables)
   - `DATABASE_URL` = `mysql://root:SJwJofTXnvDyGpuKNKJzKWVSpNbwNONF@mysql.railway.internal:3306/railway`
   - `JWT_SECRET` = (gere uma chave de 32+ caracteres)
   - `NODE_ENV` = `production`

3. Clique em **"Deploy"** ou **"Redeploy"**

4. Aguarde o build e verifique os logs

---

## 📝 Se Ainda Não Funcionar

1. **Veja os logs completos** do deploy (aba Deployments > clique no deployment > logs)
2. **Copie a mensagem de erro completa**
3. **Verifique se funciona localmente**:
   ```bash
   pnpm install
   pnpm build
   pnpm start
   ```

Se funcionar localmente mas não no Railway, o problema é de configuração do Railway.

---

## 💡 Dica Extra

Se você quiser ver o que está acontecendo em tempo real:

1. Vá em **Deployments**
2. Clique no deployment
3. Veja os logs em tempo real
4. Isso mostra exatamente onde está falhando
