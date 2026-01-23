# 📋 Funcionalidades do Sistema - Sales Management App

Este documento lista todas as funcionalidades implementadas no sistema até o momento.

**Última atualização:** Dezembro 2024

---

## 🔐 Sistema de Autenticação

### Métodos de Login Disponíveis

1. **Login com Email e Senha**
   - Registro de novos usuários
   - Login com credenciais
   - Recuperação de senha (hash com bcrypt)
   - Validação de email e senha

2. **Login com Google OAuth**
   - Autenticação via Google
   - Vinculação automática de contas pelo email
   - Integração com Google Cloud Console

3. **Login Local** (Desenvolvimento)
   - Login simplificado apenas com nome
   - Útil para testes e desenvolvimento

4. **OAuth Manus** (Opcional)
   - Suporte para servidor OAuth Manus
   - Configurável via variáveis de ambiente

### Segurança

- Tokens JWT para sessões
- Hash de senhas com bcrypt
- Cookies seguros (HttpOnly, SameSite)
- Autenticação por requisição
- Sistema de roles (user/admin)

---

## 👥 Gestão de Clientes

### Funcionalidades Principais

1. **Listagem de Clientes**
   - Visualização de todos os clientes cadastrados
   - Ordenação por data de criação (mais recentes primeiro)
   - Interface responsiva e moderna

2. **Cadastro de Clientes**
   - Formulário completo com validação
   - Campos disponíveis:
     - Nome (obrigatório)
     - Telefone (opcional)
     - Notas/observações (opcional)
     - Habilitar WhatsApp (checkbox)
   - Feedback visual de sucesso/erro

3. **Edição de Clientes**
   - Edição de informações existentes
   - Atualização em tempo real
   - Validação de campos

4. **Exclusão de Clientes**
   - Remoção de clientes do sistema
   - Confirmação antes de excluir

5. **Histórico de Compras**
   - Visualização do histórico completo de vendas por cliente
   - Detalhes de cada venda
   - Informações de produtos e valores

6. **Busca e Filtros**
   - Busca por nome do cliente
   - Filtros para facilitar localização

---

## 💰 Gestão de Vendas

### Funcionalidades Principais

1. **Registro de Vendas**
   - Formulário completo para nova venda
   - Seleção de cliente (dropdown)
   - Data da venda (calendário)
   - Múltiplos produtos por venda:
     - Descrição do produto
     - Preço (formatação automática em R$)
     - Quantidade
     - Adicionar/remover produtos dinamicamente
   - Cálculo automático do total

2. **Formas de Pagamento**
   - **À Vista (Cash)**
     - Pagamento único
     - Parcela única marcada como paga automaticamente
   
   - **Parcelado (Installment)**
     - Número de parcelas configurável
     - Data de vencimento manual para cada parcela
     - Valor de cada parcela configurável
     - Geração automática de parcelas

3. **Histórico de Vendas**
   - Listagem de todas as vendas
   - Informações exibidas:
     - Cliente
     - Data da venda
     - Valor total
     - Forma de pagamento
     - Número de parcelas
   - Ordenação por data (mais recentes primeiro)

4. **Exclusão de Vendas**
   - Remoção de vendas do sistema
   - Exclusão em cascata (produtos e parcelas relacionados)
   - Confirmação antes de excluir

5. **Exportação de Relatórios**
   - Geração de PDF com relatórios de vendas
   - Filtros para exportação:
     - Período (data inicial e final)
     - Cliente específico
     - Status de pagamento
   - Download direto do PDF

---

## 💳 Gestão de Pagamentos

### Funcionalidades Principais

1. **Listagem de Parcelas**
   - Visualização de todas as parcelas
   - Informações exibidas:
     - Cliente
     - Número da parcela
     - Data de vencimento
     - Valor
     - Status (Pendente, Pago, Atrasado)

2. **Filtros Avançados**
   - **Todos**: Todas as parcelas
   - **Pendentes**: Apenas parcelas não pagas
   - **Pagos**: Parcelas já pagas
   - **Atrasados**: Parcelas vencidas e não pagas
   - Busca por nome do cliente

3. **Marcar como Pago**
   - Atualização de status de parcela
   - Registro automático da data de pagamento
   - Atualização em tempo real na interface

4. **Visualização de Detalhes**
   - Informações completas da venda relacionada
   - Histórico de pagamentos
   - Status de cada parcela

5. **Exportação de Relatórios**
   - Geração de PDF com relatório de pagamentos
   - Filtros personalizáveis
   - Informações detalhadas de cada parcela

---

## 📊 Dashboard e Análises

### Métricas Financeiras

1. **Cards de Resumo**
   - **Receita Total**: Soma de todas as vendas no período
   - **Recebido**: Total de parcelas pagas
   - **A Receber**: Total de parcelas pendentes
   - **Atrasado**: Total de parcelas vencidas

2. **Filtros por Período**
   - Seleção de data inicial
   - Seleção de data final
   - Limpar filtros
   - Cálculos automáticos baseados no período

### Gráficos e Visualizações

1. **Gráfico de Vendas por Data**
   - Gráfico de linha (Line Chart)
   - Visualização da evolução das vendas
   - Eixo X: Datas
   - Eixo Y: Valores em R$

2. **Gráfico de Status de Pagamentos**
   - Gráfico de pizza (Pie Chart)
   - Distribuição visual de:
     - Pagos (verde)
     - Pendentes (amarelo)
     - Atrasados (vermelho)

3. **Ranking de Clientes**
   - Top 5 clientes por volume de vendas
   - Informações exibidas:
     - Posição no ranking
     - Nome do cliente
     - Número de compras
     - Valor total gasto

### Alertas e Notificações

1. **Parcelas Próximas a Vencer**
   - Lista de parcelas que vencem nos próximos 7 dias
   - Informações de cliente, parcela e valor
   - Destaque visual para atenção

2. **Parcelas Atrasadas**
   - Lista de todas as parcelas vencidas
   - Destaque em vermelho
   - Informações completas para cobrança

---

## 📞 Sistema de Cobrança

### Funcionalidades

1. **Gestão de Cobranças**
   - Visualização de parcelas a vencer
   - Filtro por dias à frente (padrão: 7 dias)
   - Lista organizada por data de vencimento

2. **Controle de Contato**
   - Marcação de parcelas como "já contatadas"
   - Evita cobranças duplicadas
   - Histórico de contatos

3. **Informações para Cobrança**
   - Nome do cliente
   - Telefone (se disponível)
   - Valor da parcela
   - Data de vencimento
   - Status de contato

4. **Busca de Clientes**
   - Busca rápida por nome
   - Filtro para facilitar localização

---

## 📄 Relatórios e Exportação

### Tipos de Relatórios

1. **Relatório de Vendas**
   - Exportação em PDF
   - Filtros disponíveis:
     - Período (data inicial e final)
     - Cliente específico
   - Informações incluídas:
     - Dados do cliente
     - Data da venda
     - Produtos vendidos
     - Valores e totais
     - Forma de pagamento

2. **Relatório de Pagamentos**
   - Exportação em PDF
   - Filtros disponíveis:
     - Status (Todos, Pendentes, Pagos, Atrasados)
     - Cliente específico
   - Informações incluídas:
     - Dados do cliente
     - Detalhes das parcelas
     - Status de cada parcela
     - Valores e totais

### Características dos Relatórios

- Formatação profissional
- Cabeçalho com informações do sistema
- Tabelas organizadas
- Valores formatados em R$
- Datas formatadas em português
- Download direto do arquivo PDF

---

## 🎨 Interface e Experiência do Usuário

### Design

1. **Interface Moderna**
   - Design limpo e profissional
   - Componentes do Radix UI
   - Estilização com Tailwind CSS
   - Tema claro/escuro (suporte a dark mode)

2. **Responsividade**
   - Layout adaptável para mobile
   - Grid responsivo
   - Navegação otimizada para touch
   - Componentes adaptáveis

3. **Feedback Visual**
   - Notificações toast (Sonner)
   - Estados de loading
   - Mensagens de sucesso/erro
   - Validação em tempo real

4. **Navegação**
   - Menu lateral (sidebar)
   - Breadcrumbs
   - Navegação intuitiva
   - Indicadores visuais de página ativa

### Componentes Reutilizáveis

- Cards
- Botões
- Inputs
- Dialogs/Modals
- Tabelas
- Badges
- Gráficos (Recharts)
- Formulários

---

## 🔧 Funcionalidades Técnicas

### Backend

1. **API RESTful com tRPC**
   - Type-safe APIs
   - Validação automática
   - Documentação automática
   - Queries e Mutations

2. **Banco de Dados**
   - MySQL com Drizzle ORM
   - Migrations automáticas
   - Relacionamentos entre tabelas
   - Índices otimizados

3. **Autenticação e Autorização**
   - Middleware de autenticação
   - Proteção de rotas
   - Sistema de sessões
   - Contexto de usuário

### Frontend

1. **React 19**
   - Hooks modernos
   - Estado gerenciado
   - Componentes funcionais

2. **TypeScript**
   - Tipagem completa
   - Autocomplete inteligente
   - Detecção de erros em tempo de desenvolvimento

3. **Vite**
   - Build rápido
   - Hot Module Replacement (HMR)
   - Otimização de assets

4. **React Query (TanStack Query)**
   - Cache inteligente
   - Sincronização automática
   - Estados de loading/error
   - Invalidação de queries

---

## 📱 Funcionalidades por Página

### Página: Dashboard (`/`)
- Resumo financeiro
- Gráficos e métricas
- Alertas de parcelas
- Ranking de clientes

### Página: Clientes (`/clients`)
- Listagem de clientes
- Cadastro/edição/exclusão
- Histórico de compras
- Busca e filtros

### Página: Vendas (`/sales`)
- Registro de novas vendas
- Histórico de vendas
- Exclusão de vendas
- Exportação de relatórios

### Página: Pagamentos (`/payments`)
- Listagem de parcelas
- Filtros por status
- Marcar como pago
- Exportação de relatórios

### Página: Cobranças (`/collections`)
- Parcelas a vencer
- Controle de contato
- Busca de clientes
- Filtro por dias

### Página: Login (`/login`)
- Login com email/senha
- Registro de novos usuários
- Login com Google
- Interface com abas

---

## 🔄 Funcionalidades Futuras (Planejadas)

Baseado no arquivo `todo.md`, as seguintes funcionalidades estão planejadas:

- [ ] Edição de vendas
- [ ] Melhorias na interface
- [ ] Funcionalidades adicionais de relatórios
- [ ] Integrações com outros sistemas

---

## 📊 Estatísticas do Sistema

### Tabelas do Banco de Dados

1. **users** - Usuários do sistema
2. **clients** - Clientes cadastrados
3. **sales** - Vendas realizadas
4. **products** - Produtos de cada venda
5. **installments** - Parcelas de pagamento

### Endpoints da API

- Autenticação (login, registro, logout)
- Clientes (CRUD completo)
- Vendas (CRUD completo)
- Produtos (leitura)
- Parcelas (CRUD completo)
- Cobranças (leitura e atualização)

---

## 🎯 Resumo Executivo

O **Sales Management App** é um sistema completo de gestão de vendas e controle financeiro que oferece:

✅ **Gestão completa de clientes** com histórico de compras  
✅ **Registro detalhado de vendas** com múltiplos produtos  
✅ **Controle de pagamentos** com parcelas e status  
✅ **Dashboard analítico** com gráficos e métricas  
✅ **Sistema de cobrança** para acompanhamento de recebíveis  
✅ **Relatórios em PDF** para análise e documentação  
✅ **Autenticação segura** com múltiplos métodos  
✅ **Interface moderna e responsiva** para qualquer dispositivo  

**Ideal para:** Pequenos e médios negócios que precisam de controle financeiro e gestão de vendas de forma simples e eficiente.

---

**Versão atual:** 1.0.0  
**Status:** Em produção  
**URL de produção:** https://sunny-youthfulness-production.up.railway.app
