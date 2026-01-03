# 🗄️ Como Executar Migrations no Railway

Você tem a URL do MySQL: `mysql://root:SJwJofTXnvDyGpuKNKJzKWVSpNbwNONF@mysql.railway.internal:3306/railway`

## ⚠️ Importante

A URL que você tem usa `mysql.railway.internal` - isso é uma URL **interna** do Railway, que só funciona dentro da rede do Railway.

Para executar migrations, você tem **2 opções**:

---

## 🎯 Opção 1: Executar via Terminal do Railway (RECOMENDADO)

Esta é a forma mais fácil e garantida de funcionar.

### Passo 1: Configurar DATABASE_URL no Railway

1. No Railway, vá no serviço do seu app (sunny-youthfulness)
2. Aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Adicione:
   - **Nome**: `DATABASE_URL`
   - **Valor**: `mysql://root:SJwJofTXnvDyGpuKNKJzKWVSpNbwNONF@mysql.railway.internal:3306/railway`
   - **Scope**: Service

### Passo 2: Abrir Terminal do Railway

1. No serviço do seu app, vá na aba **"Deployments"**
2. Clique no deployment mais recente (ou aguarde um novo deploy)
3. Procure por um botão **"Shell"** ou **"Terminal"** ou **"Open Shell"**
4. Se não encontrar, vá em **"Settings"** > **"Service"** e procure por **"Shell"**

**OU** use o método alternativo:

1. No topo do Railway, clique no ícone de **"..."** (três pontos)
2. Procure por **"Open Shell"** ou **"Terminal"**
3. Selecione o serviço do seu app

### Passo 3: Executar Migrations

No terminal do Railway, execute:

```bash
pnpm db:push
```

Ou se `pnpm` não estiver disponível:

```bash
npm install -g pnpm
pnpm db:push
```

**OU** execute diretamente com npx:

```bash
npx drizzle-kit push
```

---

## 🎯 Opção 2: Obter URL Pública e Executar Localmente

Se você quiser executar do seu computador local:

### Passo 1: Obter URL Pública do MySQL

1. No Railway, clique no serviço **MySQL**
2. Vá na aba **"Variables"**
3. Procure por uma variável chamada **`MYSQL_URL`** ou **`PUBLIC_URL`** ou **`DATABASE_URL`**
4. Essa URL deve ser algo como: `mysql://root:senha@containers-us-west-xxx.railway.app:3306/railway`
5. **NÃO** use a URL com `railway.internal` - essa só funciona dentro do Railway

**Se não encontrar URL pública:**

O Railway pode não expor o MySQL publicamente por segurança. Nesse caso, use a **Opção 1** (terminal do Railway).

### Passo 2: Executar Localmente

No seu terminal local:

```bash
# Configure a variável (Linux/Mac)
export DATABASE_URL="mysql://root:SJwJofTXnvDyGpuKNKJzKWVSpNbwNONF@containers-us-west-xxx.railway.app:3306/railway"

# Ou no Windows PowerShell
$env:DATABASE_URL="mysql://root:SJwJofTXnvDyGpuKNKJzKWVSpNbwNONF@containers-us-west-xxx.railway.app:3306/railway"

# Execute as migrations
pnpm db:push
```

---

## 🔧 Opção 3: Adicionar Script de Migration no Deploy

Você pode fazer o Railway executar as migrations automaticamente no deploy:

### Passo 1: Modificar Build Command

No Railway, serviço do app > **Settings** > **Build Command**:

```bash
pnpm install && pnpm build && pnpm db:push
```

**⚠️ CUIDADO**: Isso executará migrations a cada deploy. Use apenas se souber o que está fazendo.

---

## ✅ Verificar se Funcionou

Após executar as migrations, verifique:

1. No terminal, você deve ver mensagens como:
   ```
   ✓ Migration applied successfully
   ```

2. No Railway, vá no serviço MySQL > **"Data"** ou **"Query"**
3. Você deve ver as tabelas criadas:
   - `users`
   - `clients`
   - `sales`
   - `products`
   - `installments`

---

## 🐛 Problemas Comuns

### Erro: "Cannot connect to database"

**Causa**: URL interna sendo usada fora do Railway

**Solução**: Use a Opção 1 (terminal do Railway) ou obtenha URL pública

### Erro: "pnpm: command not found"

**Solução**: 
```bash
npm install -g pnpm
```

Ou use:
```bash
npx drizzle-kit push
```

### Erro: "Table already exists"

**Causa**: Migrations já foram executadas

**Solução**: Isso é normal, as tabelas já existem. Pode ignorar.

---

## 📝 Resumo Rápido

**Método mais fácil:**
1. Adicione `DATABASE_URL` no Railway com a URL que você tem
2. Abra o terminal do Railway (Shell)
3. Execute: `pnpm db:push` ou `npx drizzle-kit push`
4. Pronto! ✅
