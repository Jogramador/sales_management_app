# 🔐 Guia de Configuração do OAuth

Este guia explica como configurar o OAuth (Manus OAuth) na aplicação Sales Management.

## 📋 Pré-requisitos

1. Acesso a um servidor OAuth Manus ou servidor OAuth compatível
2. App ID registrado no servidor OAuth
3. URL do servidor OAuth e portal OAuth

## 🚀 Passo a Passo

### 1. Obter Credenciais OAuth

Você precisa obter as seguintes informações do seu provedor OAuth:

- **OAUTH_SERVER_URL**: URL do servidor OAuth (backend)
  - Exemplo: `https://auth.manus.app`
  
- **VITE_OAUTH_PORTAL_URL**: URL do portal OAuth (frontend)
  - Geralmente é a mesma URL do servidor OAuth
  - Exemplo: `https://auth.manus.app`

- **VITE_APP_ID**: ID da sua aplicação registrada no OAuth
  - Este ID identifica sua aplicação no servidor OAuth

- **OWNER_OPEN_ID** (opcional): Open ID do administrador
  - Usado para conceder permissões de admin automaticamente
  - Você pode obter isso após fazer login pela primeira vez

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto e adicione:

```env
# OAuth Server (Backend)
OAUTH_SERVER_URL=https://seu-servidor-oauth.com

# OAuth Portal (Frontend)
VITE_OAUTH_PORTAL_URL=https://seu-portal-oauth.com

# App ID
VITE_APP_ID=seu_app_id_aqui

# Owner Open ID (opcional)
OWNER_OPEN_ID=seu_open_id_aqui
```

### 3. Configurar JWT Secret

Certifique-se de ter uma chave JWT secreta forte:

```env
JWT_SECRET=sua_chave_secreta_jwt_minimo_32_caracteres
```

Para gerar uma chave segura, você pode usar:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 4. Verificar Configuração

Após configurar as variáveis, reinicie o servidor:

```bash
pnpm dev
```

O servidor irá:
- Detectar se OAuth está configurado
- Registrar a rota `/api/oauth/callback` automaticamente
- Usar OAuth como método principal de autenticação
- Usar login local como fallback se OAuth falhar

### 5. Testar o Login

1. Acesse a aplicação
2. Clique em "Sign in"
3. Você será redirecionado para o portal OAuth
4. Faça login com suas credenciais OAuth
5. Você será redirecionado de volta para a aplicação

## 🔄 Fluxo de Autenticação

```
1. Usuário clica em "Sign in"
   ↓
2. Aplicação redireciona para: {VITE_OAUTH_PORTAL_URL}/app-auth?appId={VITE_APP_ID}&redirectUri={origin}/api/oauth/callback
   ↓
3. Usuário faz login no portal OAuth
   ↓
4. Portal OAuth redireciona para: {origin}/api/oauth/callback?code={code}&state={state}
   ↓
5. Backend troca o code por access token
   ↓
6. Backend obtém informações do usuário
   ↓
7. Backend cria sessão e define cookie
   ↓
8. Usuário é redirecionado para a página inicial autenticado
```

## 🛠️ Solução de Problemas

### OAuth não está funcionando

1. **Verifique as variáveis de ambiente:**
   ```bash
   # No servidor, verifique se estão configuradas:
   echo $OAUTH_SERVER_URL
   echo $VITE_APP_ID
   
   # No frontend (variáveis VITE_*), verifique no .env
   ```

2. **Verifique os logs do servidor:**
   - Procure por mensagens `[OAuth]` nos logs
   - Erros comuns: "OAUTH_SERVER_URL is not configured"

3. **Verifique o callback URL:**
   - O callback deve ser: `{sua-url}/api/oauth/callback`
   - Certifique-se de que esta URL está registrada no servidor OAuth

### Login local ainda aparece

Se o login local ainda aparecer mesmo com OAuth configurado:

1. Verifique se as variáveis `VITE_OAUTH_PORTAL_URL` e `VITE_APP_ID` estão configuradas
2. Reinicie o servidor após alterar as variáveis
3. Limpe o cache do navegador

### Erro "Invalid session cookie"

Isso pode acontecer se:
- O `JWT_SECRET` foi alterado após criar uma sessão
- O cookie expirou
- Há problema na validação do token

**Solução:** Faça logout e login novamente

## 📝 Notas Importantes

1. **Variáveis VITE_***: Variáveis que começam com `VITE_` são expostas no frontend. Não coloque informações sensíveis nelas.

2. **Fallback para Login Local**: Se OAuth falhar, o sistema automaticamente tenta usar login local como fallback.

3. **Segurança**: 
   - Use HTTPS em produção
   - Mantenha o `JWT_SECRET` seguro e nunca o commite no Git
   - Use um `JWT_SECRET` forte (mínimo 32 caracteres)

4. **Ambiente de Desenvolvimento**: Você pode usar login local durante o desenvolvimento sem configurar OAuth.

## 🔗 Recursos Adicionais

- Documentação do Manus OAuth (se aplicável)
- [OAuth 2.0 Specification](https://oauth.net/2/)

## ❓ Precisa de Ajuda?

Se você tiver problemas com a configuração:
1. Verifique os logs do servidor
2. Confirme que todas as variáveis estão configuradas corretamente
3. Teste o endpoint OAuth manualmente
4. Verifique se o servidor OAuth está acessível
