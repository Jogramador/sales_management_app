# 🚀 Guia de Deploy - Colocando a Aplicação no Ar

Este guia explica passo a passo como colocar a aplicação Sales Management em produção.

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. **Servidor/Cloud Provider** (escolha uma opção):
   - [Vercel](https://vercel.com) - Recomendado para fácil deploy
   - [Railway](https://railway.app) - Simples e com banco incluído
   - [Render](https://render.com) - Gratuito com limitações
   - [DigitalOcean](https://www.digitalocean.com) - VPS completo
   - [AWS](https://aws.amazon.com) - Infraestrutura completa
   - [Heroku](https://www.heroku.com) - Pago, mas simples

2. **Banco de Dados MySQL**:
   - [PlanetScale](https://planetscale.com) - MySQL serverless (recomendado)
   - [Railway MySQL](https://railway.app) - MySQL gerenciado
   - [AWS RDS](https://aws.amazon.com/rds) - MySQL gerenciado
   - [DigitalOcean Managed Database](https://www.digitalocean.com/products/managed-databases)
   - Ou seu próprio servidor MySQL

3. **Domínio** (opcional, mas recomendado):
   - [Namecheap](https://www.namecheap.com)
   - [Google Domains](https://domains.google)
   - [Cloudflare](https://www.cloudflare.com)

## 🎯 Opção 1: Deploy no Railway (Mais Fácil)

Railway é uma das opções mais simples para deploy full-stack.

### Passo 1: Criar Conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"

### Passo 2: Conectar Repositório

1. Selecione "Deploy from GitHub repo"
2. Escolha seu repositório
3. Railway detectará automaticamente o projeto

### Passo 3: Adicionar Banco de Dados MySQL

1. No projeto, clique em "+ New"
2. Selecione "Database" > "Add MySQL"
3. Railway criará automaticamente um banco MySQL
4. Copie a URL de conexão (DATABASE_URL)

### Passo 4: Configurar Variáveis de Ambiente

No Railway, vá em "Variables" e adicione:

```env
DATABASE_URL=mysql://usuario:senha@host:porta/banco
JWT_SECRET=sua_chave_secreta_jwt_minimo_32_caracteres
NODE_ENV=production
PORT=3000
```

**Importante**: Gere uma chave JWT segura:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Passo 5: Executar Migrations

1. No Railway, vá em "Settings"
2. Adicione um script de build:
   ```bash
   pnpm install && pnpm build
   ```
3. Adicione um comando de start:
   ```bash
   pnpm start
   ```

### Passo 6: Executar Migrations do Banco

No terminal do Railway ou localmente com DATABASE_URL configurada:

```bash
pnpm db:push
```

### Passo 7: Configurar Domínio (Opcional)

1. No Railway, vá em "Settings" > "Domains"
2. Clique em "Generate Domain" ou adicione seu domínio customizado
3. Configure DNS se necessário

## 🎯 Opção 2: Deploy no Vercel + PlanetScale

### Passo 1: Deploy do Frontend no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Importe seu repositório
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

### Passo 2: Criar Banco no PlanetScale

1. Acesse [planetscale.com](https://planetscale.com)
2. Crie uma conta gratuita
3. Crie um novo banco de dados
4. Copie a URL de conexão

### Passo 3: Deploy do Backend

**Nota**: Vercel é otimizado para frontend. Para backend, considere Railway ou Render.

Se quiser usar Vercel para backend também:
1. Crie um projeto separado no Vercel
2. Configure como Serverless Functions
3. Adicione variáveis de ambiente

### Passo 4: Configurar Variáveis

No Vercel, vá em "Settings" > "Environment Variables":

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
NODE_ENV=production
```

## 🎯 Opção 3: Deploy no Render

### Passo 1: Criar Conta

1. Acesse [render.com](https://render.com)
2. Faça login com GitHub

### Passo 2: Criar Banco MySQL

1. Clique em "New +" > "PostgreSQL" (ou MySQL se disponível)
2. Configure o banco
3. Copie a URL de conexão interna

### Passo 3: Deploy do Serviço Web

1. Clique em "New +" > "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: sales-management-app
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: Free ou Paid

### Passo 4: Variáveis de Ambiente

Adicione em "Environment":

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
NODE_ENV=production
PORT=10000
```

## 🎯 Opção 4: Deploy Manual (VPS)

Se você tem um servidor próprio (DigitalOcean, AWS EC2, etc.):

### Passo 1: Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Instalar pnpm
npm install -g pnpm

# Instalar MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

### Passo 2: Configurar MySQL

```bash
# Criar banco de dados
sudo mysql -u root -p
```

```sql
CREATE DATABASE sales_management;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON sales_management.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Passo 3: Clonar e Configurar Aplicação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/sales-management-app.git
cd sales-management-app

# Instalar dependências
pnpm install

# Criar arquivo .env
nano .env
```

Adicione no `.env`:
```env
DATABASE_URL=mysql://app_user:senha_segura@localhost:3306/sales_management
JWT_SECRET=sua_chave_secreta_jwt_minimo_32_caracteres
NODE_ENV=production
PORT=3000
```

### Passo 4: Build e Deploy

```bash
# Executar migrations
pnpm db:push

# Build da aplicação
pnpm build

# Iniciar com PM2 (gerenciador de processos)
npm install -g pm2
pm2 start dist/index.js --name sales-management
pm2 save
pm2 startup
```

### Passo 5: Configurar Nginx (Reverso Proxy)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/sales-management
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sales-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Passo 6: Configurar SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com
```

## 📝 Checklist de Deploy

Antes de colocar no ar, verifique:

- [ ] Banco de dados MySQL criado e acessível
- [ ] Variável `DATABASE_URL` configurada corretamente
- [ ] Variável `JWT_SECRET` configurada (mínimo 32 caracteres)
- [ ] Variável `NODE_ENV=production` configurada
- [ ] Migrations do banco executadas (`pnpm db:push`)
- [ ] Build da aplicação executado (`pnpm build`)
- [ ] Porta configurada corretamente (se necessário)
- [ ] Domínio configurado (se usando domínio customizado)
- [ ] SSL/HTTPS configurado (obrigatório em produção)
- [ ] Variáveis de ambiente não estão no código (usar .env ou variáveis do provider)

## 🔒 Segurança em Produção

### 1. Variáveis de Ambiente

**NUNCA** commite o arquivo `.env` no Git. Adicione ao `.gitignore`:
```
.env
.env.local
.env.production
```

### 2. JWT Secret

Use uma chave forte e única:
```bash
openssl rand -base64 32
```

### 3. Banco de Dados

- Use senhas fortes
- Configure firewall para permitir apenas conexões necessárias
- Use SSL para conexões com o banco (se disponível)

### 4. HTTPS

Sempre use HTTPS em produção. A maioria dos providers oferece SSL gratuito:
- Vercel: Automático
- Railway: Automático
- Render: Automático
- VPS: Use Let's Encrypt (certbot)

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução**:
1. Verifique se `DATABASE_URL` está correta
2. Verifique se o banco está acessível
3. Verifique firewall/security groups
4. Teste a conexão localmente

### Erro: "JWT_SECRET is required"

**Solução**:
1. Verifique se `JWT_SECRET` está configurada
2. Certifique-se de que tem pelo menos 32 caracteres
3. Reinicie o servidor após adicionar

### Erro: "Table doesn't exist"

**Solução**:
1. Execute as migrations: `pnpm db:push`
2. Verifique se o banco está correto
3. Verifique logs para erros de migration

### Aplicação não inicia

**Solução**:
1. Verifique logs do servidor
2. Verifique se todas as variáveis estão configuradas
3. Verifique se a porta está disponível
4. Teste localmente primeiro

## 📊 Monitoramento

### Logs

- **Railway**: Dashboard > Logs
- **Vercel**: Dashboard > Deployments > View Function Logs
- **Render**: Dashboard > Logs
- **VPS**: `pm2 logs sales-management`

### Uptime

Configure monitoramento:
- [UptimeRobot](https://uptimerobot.com) - Gratuito
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das mudanças para o repositório
2. O provider fará deploy automático (se configurado)
3. Ou execute manualmente:
   ```bash
   git pull
   pnpm install
   pnpm build
   pm2 restart sales-management  # Se usando VPS
   ```

## 📚 Recursos Adicionais

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [PlanetScale Docs](https://planetscale.com/docs)

## ❓ Precisa de Ajuda?

Se tiver problemas:
1. Verifique os logs do servidor
2. Confirme todas as variáveis de ambiente
3. Teste localmente primeiro
4. Consulte a documentação do seu provider

---

**Boa sorte com o deploy! 🚀**
