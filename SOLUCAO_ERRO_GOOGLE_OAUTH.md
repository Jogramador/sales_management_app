# 🔧 Solução: Erro ao Autenticar com Google

## 🐛 Problema

Ao tentar fazer login com Google localmente, você recebe o erro:

```json
{
  "error": "Erro ao autenticar com Google",
  "details": "Failed query: select ... from `users` where `users`.`openId` = ?"
}
```

## 🔍 Causa

Este erro geralmente ocorre quando:

1. **O banco de dados local não está configurado corretamente**
   - O `.env` está apontando para o Railway (`mysql.railway.internal`) que não funciona localmente
   - O MySQL local não está rodando
   - O banco de dados local não existe

2. **As migrations não foram executadas localmente**
   - A tabela `users` não existe no banco local
   - A estrutura da tabela está desatualizada

## ✅ Solução

### Passo 1: Verificar Configuração do Banco Local

1. **Verifique se o MySQL está rodando:**
   ```bash
   # Windows (PowerShell)
   Get-Service -Name MySQL*
   
   # Ou tente conectar
   mysql -u root -p
   ```

2. **Verifique o arquivo `.env`:**
   - Abra o arquivo `.env` na raiz do projeto
   - Verifique se `DATABASE_URL` está configurado para MySQL local:
   
   ```env
   # Para desenvolvimento local, use:
   DATABASE_URL=mysql://root:sua_senha@localhost:3306/sales_management
   
   # NÃO use a URL do Railway localmente:
   # DATABASE_URL=mysql://root:...@mysql.railway.internal:3306/railway
   ```

### Passo 2: Criar Banco de Dados Local

1. **Conecte ao MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Crie o banco de dados:**
   ```sql
   CREATE DATABASE sales_management;
   ```

3. **Verifique se foi criado:**
   ```sql
   SHOW DATABASES;
   ```

### Passo 3: Aplicar Migrations

1. **Certifique-se de que o `.env` está correto:**
   ```env
   DATABASE_URL=mysql://root:sua_senha@localhost:3306/sales_management
   ```

2. **Execute as migrations:**
   ```bash
   pnpm db:push
   ```

3. **Verifique se as tabelas foram criadas:**
   ```sql
   USE sales_management;
   SHOW TABLES;
   ```
   
   Você deve ver:
   - `users`
   - `clients`
   - `sales`
   - `products`
   - `installments`

### Passo 4: Testar Novamente

1. **Reinicie o servidor:**
   ```bash
   pnpm dev
   ```

2. **Tente fazer login com Google novamente**

## 🔄 Alternativa: Usar Banco do Railway Localmente

Se você quiser usar o banco do Railway localmente (não recomendado para desenvolvimento):

1. **Obtenha a URL pública do MySQL no Railway:**
   - No Railway, vá no serviço MySQL
   - Aba "Variables" ou "Connect"
   - Procure por `MYSQL_URL` ou `PUBLIC_URL`
   - Deve ser algo como: `mysql://root:senha@containers-us-west-xxx.railway.app:3306/railway`

2. **Atualize o `.env`:**
   ```env
   DATABASE_URL=mysql://root:senha@containers-us-west-xxx.railway.app:3306/railway
   ```

3. **Reinicie o servidor**

**⚠️ Nota:** Usar o banco do Railway localmente não é recomendado porque:
- Pode ser mais lento
- Pode afetar dados de produção
- Pode ter problemas de conexão

## 📝 Checklist de Verificação

Antes de tentar novamente, verifique:

- [ ] MySQL está rodando localmente
- [ ] Banco de dados `sales_management` existe
- [ ] `.env` está configurado com `DATABASE_URL` local
- [ ] Migrations foram executadas (`pnpm db:push`)
- [ ] Tabela `users` existe no banco
- [ ] Servidor foi reiniciado após mudanças no `.env`

## 🐛 Debug Adicional

Se o problema persistir, verifique os logs do servidor:

1. **Procure por mensagens de erro no console:**
   - `[Database] Cannot get user: database not available`
   - `[Database] Error getting user by openId`
   - `[GoogleAuth] Error looking up user`

2. **Teste a conexão com o banco:**
   ```bash
   # No terminal, teste a conexão
   mysql -u root -p -h localhost sales_management
   ```

3. **Verifique se a tabela users tem a estrutura correta:**
   ```sql
   DESCRIBE users;
   ```
   
   Deve mostrar o campo `openId` como `varchar(64)`.

## 💡 Dica

Para desenvolvimento local, sempre use um banco MySQL local. Configure dois arquivos `.env`:

- `.env.local` - Para desenvolvimento local
- `.env.production` - Para produção (não commitar)

Ou use variáveis de ambiente diferentes para cada ambiente.

---

**Última atualização:** Dezembro 2024
