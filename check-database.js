import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL não está configurada');
    process.exit(1);
  }

  const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!urlMatch) {
    console.error('❌ Formato inválido da DATABASE_URL');
    process.exit(1);
  }

  const [, user, password, host, port, database] = urlMatch;

  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
    });

    console.log('📊 Dados no banco de dados:\n');

    // Usuários
    const [users] = await connection.query('SELECT id, openId, name, email, loginMethod, role, createdAt FROM users ORDER BY createdAt DESC LIMIT 10');
    console.log('👥 USUÁRIOS:');
    if (users.length === 0) {
      console.log('   Nenhum usuário encontrado\n');
    } else {
      users.forEach((u) => {
        console.log(`   ID: ${u.id} | Nome: ${u.name || 'N/A'} | Login: ${u.loginMethod || 'N/A'} | Role: ${u.role || 'user'}`);
      });
      console.log('');
    }

    // Clientes
    const [clients] = await connection.query('SELECT id, userId, name, phone, whatsappEnabled, createdAt FROM clients ORDER BY createdAt DESC LIMIT 10');
    console.log('👤 CLIENTES:');
    if (clients.length === 0) {
      console.log('   Nenhum cliente encontrado\n');
    } else {
      clients.forEach((c) => {
        console.log(`   ID: ${c.id} | Nome: ${c.name} | Telefone: ${c.phone || 'N/A'} | WhatsApp: ${c.whatsappEnabled ? 'Sim' : 'Não'}`);
      });
      console.log('');
    }

    // Vendas
    const [sales] = await connection.query('SELECT id, userId, clientId, total, paymentType, installmentCount, date FROM sales ORDER BY date DESC LIMIT 10');
    console.log('💰 VENDAS:');
    if (sales.length === 0) {
      console.log('   Nenhuma venda encontrada\n');
    } else {
      sales.forEach((s) => {
        const total = (s.total / 100).toFixed(2);
        console.log(`   ID: ${s.id} | Total: R$ ${total} | Tipo: ${s.paymentType} | Parcelas: ${s.installmentCount || 1}x | Data: ${s.date.toISOString().split('T')[0]}`);
      });
      console.log('');
    }

    // Parcelas
    const [installments] = await connection.query('SELECT id, saleId, number, amount, dueDate, status FROM installments ORDER BY dueDate DESC LIMIT 10');
    console.log('📅 PARCELAS:');
    if (installments.length === 0) {
      console.log('   Nenhuma parcela encontrada\n');
    } else {
      installments.forEach((i) => {
        const amount = (i.amount / 100).toFixed(2);
        console.log(`   ID: ${i.id} | Venda: ${i.saleId} | Parcela ${i.number} | Valor: R$ ${amount} | Vencimento: ${i.dueDate} | Status: ${i.status || 'pending'}`);
      });
      console.log('');
    }

    // Produtos
    const [products] = await connection.query('SELECT id, saleId, description, price, quantity FROM products ORDER BY id DESC LIMIT 10');
    console.log('📦 PRODUTOS:');
    if (products.length === 0) {
      console.log('   Nenhum produto encontrado\n');
    } else {
      products.forEach((p) => {
        const price = (p.price / 100).toFixed(2);
        console.log(`   ID: ${p.id} | Venda: ${p.saleId} | ${p.description} | Preço: R$ ${price} | Qtd: ${p.quantity}`);
      });
      console.log('');
    }

    await connection.end();
    console.log('✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkDatabase();







