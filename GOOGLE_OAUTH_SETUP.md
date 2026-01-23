# 🔐 Guia de Configuração do Google OAuth

Este guia explica como configurar o Google OAuth na aplicação Sales Management.

## 📋 Pré-requisitos

1. Conta Google (Gmail)
2. Acesso ao [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Passo a Passo

### 1. Criar Projeto no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar projeto" no topo
3. Clique em "Novo Projeto"
4. Dê um nome ao projeto (ex: "Sales Management App")
5. Clique em "Criar"

### 2. Configurar Tela de Consentimento OAuth

1. No menu lateral, vá em **APIs e Serviços** > **Tela de consentimento OAuth**
2. Selecione **Externo** (ou **Interno** se você tiver Google Workspace)
3. Preencha as informações:
   - **Nome do aplicativo**: Sales Management App
   - **Email de suporte ao usuário**: seu email
   - **Email de contato do desenvolvedor**: seu email
4. Clique em **Salvar e continuar**
5. Na seção **Escopos**, clique em **Adicionar ou remover escopos**
6. Selecione:
   - `userinfo.email`
   - `userinfo.profile`
7. Clique em **Atualizar** e depois em **Salvar e continuar**
8. Adicione usuários de teste (se necessário) e clique em **Salvar e continuar**
9. Revise e clique em **Voltar ao painel**

### 3. Criar Credenciais OAuth 2.0

1. No menu lateral, vá em **APIs e Serviços** > **Credenciais**
2. Clique em **+ Criar credenciais** > **ID do cliente OAuth**
3. Selecione **Aplicativo da Web**
4. Configure:
   - **Nome**: Sales Management App Client
   - **URIs de redirecionamento autorizados**:
     - Para desenvolvimento: `http://localhost:3000/api/auth/google/callback`
     - Para produção: `https://sunny-youthfulness-production.up.railway.app/api/auth/google/callback`
5. Clique em **Criar**
6. **Copie o ID do cliente e o Segredo do cliente** (você precisará deles)

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto e adicione:

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Para produção, use:
# GOOGLE_REDIRECT_URI=https://sunny-youthfulness-production.up.railway.app/api/auth/google/callback

# Base URL (opcional, será inferido automaticamente)
BASE_URL=http://localhost:3000
```

### 5. Gerar Migração do Banco de Dados

O campo `passwordHash` foi adicionado ao schema. Para aplicar a migração:

```bash
pnpm db:push
```

### 6. Reiniciar o Servidor

Após configurar as variáveis de ambiente:

```bash
pnpm dev
```

## ✅ Verificação

1. Acesse `http://localhost:3000/login`
2. Você deve ver o botão "Continuar com Google"
3. Ao clicar, você será redirecionado para o Google
4. Após autorizar, você será redirecionado de volta e estará logado

## 🔧 Solução de Problemas

### Erro: "Google OAuth não está configurado"
- Verifique se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão definidos no `.env`
- Reinicie o servidor após adicionar as variáveis

### Erro: "redirect_uri_mismatch"
- Verifique se a URI de redirecionamento no Google Cloud Console corresponde exatamente à `GOOGLE_REDIRECT_URI`
- Certifique-se de que não há espaços ou caracteres extras
- Para desenvolvimento local, use `http://localhost:3000/api/auth/google/callback`

### Erro: "invalid_client"
- Verifique se o `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
- Certifique-se de que copiou os valores corretos do Google Cloud Console

## 📝 Notas

- O Google OAuth funciona em conjunto com o sistema de autenticação por email/senha
- Usuários podem fazer login com Google mesmo se já tiverem uma conta com email/senha (o sistema vincula automaticamente pelo email)
- O campo `passwordHash` é opcional - apenas usuários que se registram com email/senha terão este campo preenchido
