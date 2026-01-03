/**
 * Script para verificar a configuração do OAuth
 * Execute: node check-oauth-config.js
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Verificando configuração do OAuth...\n');

const requiredVars = {
  server: {
    OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL,
    VITE_APP_ID: process.env.VITE_APP_ID,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  client: {
    VITE_OAUTH_PORTAL_URL: process.env.VITE_OAUTH_PORTAL_URL,
  },
};

let hasErrors = false;
let hasWarnings = false;

// Verificar variáveis do servidor
console.log('📦 Variáveis do Servidor:');
console.log('─'.repeat(50));

Object.entries(requiredVars.server).forEach(([key, value]) => {
  if (!value || value.trim() === '') {
    console.log(`❌ ${key}: NÃO CONFIGURADO`);
    if (key === 'JWT_SECRET') {
      hasErrors = true;
    } else if (key === 'OAUTH_SERVER_URL' || key === 'VITE_APP_ID') {
      hasWarnings = true;
    }
  } else {
    const displayValue = key === 'JWT_SECRET' 
      ? (value.length >= 32 ? '✅ Configurado (seguro)' : '⚠️  Muito curto (mínimo 32 caracteres)')
      : `✅ ${value}`;
    console.log(`✅ ${key}: ${displayValue}`);
    if (key === 'JWT_SECRET' && value.length < 32) {
      hasWarnings = true;
    }
  }
});

console.log('\n🌐 Variáveis do Cliente (Frontend):');
console.log('─'.repeat(50));

Object.entries(requiredVars.client).forEach(([key, value]) => {
  if (!value || value.trim() === '') {
    console.log(`⚠️  ${key}: NÃO CONFIGURADO (OAuth não funcionará no frontend)`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
});

console.log('\n📊 Resumo:');
console.log('─'.repeat(50));

const oauthServerUrl = requiredVars.server.OAUTH_SERVER_URL;
const appId = requiredVars.server.VITE_APP_ID;
const oauthPortalUrl = requiredVars.client.VITE_OAUTH_PORTAL_URL;

if (oauthServerUrl && appId && oauthPortalUrl) {
  console.log('✅ OAuth está CONFIGURADO e funcionará');
  console.log(`   Servidor: ${oauthServerUrl}`);
  console.log(`   Portal: ${oauthPortalUrl}`);
  console.log(`   App ID: ${appId}`);
} else {
  console.log('⚠️  OAuth NÃO está completamente configurado');
  console.log('   O sistema usará login local como fallback');
  
  if (!oauthServerUrl) {
    console.log('   ❌ Falta: OAUTH_SERVER_URL');
  }
  if (!appId) {
    console.log('   ❌ Falta: VITE_APP_ID');
  }
  if (!oauthPortalUrl) {
    console.log('   ❌ Falta: VITE_OAUTH_PORTAL_URL');
  }
}

if (!requiredVars.server.JWT_SECRET) {
  console.log('\n❌ ERRO CRÍTICO: JWT_SECRET não está configurado!');
  console.log('   A aplicação não funcionará sem esta variável.');
  hasErrors = true;
}

console.log('\n📝 Próximos Passos:');
console.log('─'.repeat(50));

if (hasErrors) {
  console.log('1. Configure JWT_SECRET no arquivo .env');
  console.log('2. Gere uma chave segura: openssl rand -base64 32');
}

if (hasWarnings && !oauthServerUrl) {
  console.log('1. Configure OAUTH_SERVER_URL no arquivo .env');
  console.log('2. Configure VITE_APP_ID no arquivo .env');
  console.log('3. Configure VITE_OAUTH_PORTAL_URL no arquivo .env');
  console.log('4. Consulte OAUTH_SETUP.md para mais detalhes');
}

if (!hasErrors && !hasWarnings) {
  console.log('✅ Tudo configurado! Reinicie o servidor para aplicar as mudanças.');
}

console.log('\n');

process.exit(hasErrors ? 1 : 0);
