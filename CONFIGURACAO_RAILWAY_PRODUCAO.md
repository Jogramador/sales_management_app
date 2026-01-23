# 🚀 Configuração do Google OAuth em Produção (Railway)

Sua aplicação está em produção no Railway: **https://sunny-youthfulness-production.up.railway.app**

## 📋 Checklist de Configuração

### ✅ Passo 1: Configurar Variáveis no Railway

No painel do Railway, vá no serviço da sua aplicação e adicione/atualize as seguintes variáveis:



**Como adicionar no Railway:**
1. Acesse o [Railway Dashboard](https://railway.app/dashboard)
2. Clique no serviço da sua aplicação
3. Vá na aba **"Variables"**
4. Clique em **"+ New Variable"** para cada variável acima
5. Preencha o **Nome** e o **Valor** conforme mostrado
6. Clique em **Save**

### ✅ Passo 2: Configurar Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs e Serviços** > **Credenciais**
3. Clique no seu **ID do cliente OAuth** (983361041466-qdnf3buvfqv2uct86ndutu36f8mp1i8p.apps.googleusercontent.com)
4. Em **"URIs de redirecionamento autorizados"**, certifique-se de ter:
   - ✅ `http://localhost:3000/api/auth/google/callback` (para desenvolvimento)
   - ✅ `https://sunny-youthfulness-production.up.railway.app/api/auth/google/callback` (para produção)
5. Clique em **Salvar**

### ✅ Passo 3: Verificar Outras Variáveis Obrigatórias

Certifique-se de que estas variáveis também estão configuradas no Railway:

```env
DATABASE_URL=mysql://root:SENHA@mysql.railway.internal:3306/railway
JWT_SECRET=sua_chave_secreta_producao
NODE_ENV=production
```

### ✅ Passo 4: Reiniciar o Deploy

Após adicionar/atualizar as variáveis:

1. No Railway, vá em **"Deployments"**
2. Clique em **"Redeploy"** ou aguarde um novo deploy automático
3. Verifique os logs para garantir que não há erros

### ✅ Passo 5: Testar

1. Acesse: https://sunny-youthfulness-production.up.railway.app/login
2. Clique em **"Continuar com Google"**
3. Você deve ser redirecionado para o Google
4. Após autorizar, deve voltar para a aplicação logado

## 🐛 Solução de Problemas

### Erro: "redirect_uri_mismatch"

**Causa:** A URI de redirecionamento não está configurada no Google Cloud Console.

**Solução:**
- Verifique se adicionou `https://sunny-youthfulness-production.up.railway.app/api/auth/google/callback` no Google Cloud Console
- Certifique-se de que a URL está exatamente igual (sem espaços, com https://)

### Erro: "Google OAuth não está configurado"

**Causa:** As variáveis não estão configuradas no Railway.

**Solução:**
- Verifique se todas as 4 variáveis do Google OAuth estão no Railway
- Certifique-se de que os valores estão corretos (sem espaços extras)
- Reinicie o deploy após adicionar as variáveis

### Login com Google não funciona

**Verificações:**
1. ✅ Variáveis configuradas no Railway?
2. ✅ URI adicionada no Google Cloud Console?
3. ✅ Deploy reiniciado após mudanças?
4. ✅ URL usa `https://` (não `http://`)?

## 📝 Resumo das URLs

- **Aplicação em Produção:** https://sunny-youthfulness-production.up.railway.app
- **Página de Login:** https://sunny-youthfulness-production.up.railway.app/login
- **Callback do Google OAuth:** https://sunny-youthfulness-production.up.railway.app/api/auth/google/callback

## ✅ Checklist Final

- [ ] Variáveis do Google OAuth configuradas no Railway
- [ ] URI de produção adicionada no Google Cloud Console
- [ ] Deploy reiniciado
- [ ] Login com Google testado e funcionando

---

**Última atualização:** Dezembro 2024
