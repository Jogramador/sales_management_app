# Sistema de Controle de Vendas e Pagamentos - TODO

## Estrutura do Banco de Dados
- [x] Criar tabela de clientes (clients)
- [x] Criar tabela de vendas (sales)
- [x] Criar tabela de produtos (products)
- [x] Criar tabela de parcelas (installments)

## Página de Clientes
- [x] Implementar listagem de clientes
- [x] Implementar botão "Ver Detalhes" com histórico de compras
- [x] Implementar formulário "Novo Cliente"
- [x] Integrar com banco de dados

## Página de Vendas
- [x] Implementar formulário de nova venda
- [x] Implementar seleção de cliente
- [x] Implementar lista de produtos com descrição e valor
- [x] Implementar cálculo automático do valor total
- [x] Implementar seleção de forma de pagamento
- [x] Implementar geração automática de parcelas
- [x] Implementar tabela de histórico de vendas
- [x] Integrar com banco de dados

## Página de Pagamentos
- [x] Implementar listagem de parcelas
- [x] Implementar botão "Marcar como Pago"
- [x] Implementar filtros (Todos, Pendentes, Pagos, Atrasados)
- [x] Integrar com banco de dados

## Design e Responsividade
- [x] Implementar layout responsivo para mobile
- [x] Implementar navegação entre páginas
- [x] Implementar alertas de sucesso/erro
- [x] Aplicar Tailwind CSS para estilização

## Testes e Ajustes Finais
- [x] Testar funcionalidades em desktop
- [x] Testar funcionalidades em mobile
- [x] Testar integração com banco de dados
- [x] Fazer ajustes finais de UX/UI


## Ajustes Solicitados
- [x] Adicionar labels "Valor" e "Quantidade" acima dos campos de produtos
- [x] Melhorar campos numéricos para facilitar digitação
- [x] Remover geração automática de parcelas e permitir data manual
- [x] Remover valor padrão "0" do campo de Valor do produto para facilitar digitação


## Novas Funcionalidades Solicitadas
- [ ] Adicionar funcionalidade de edição de clientes
- [ ] Adicionar funcionalidade de exclusão de clientes
- [ ] Adicionar funcionalidade de edição de vendas
- [ ] Adicionar funcionalidade de exclusão de vendas
- [ ] Adicionar funcionalidade de exclusão de pagamentos
- [ ] Aplicar máscara de telefone em campos de cliente
- [ ] Aplicar máscara de moeda em campos de valor
- [ ] Otimizar layout da página de Pagamentos (não ocupar tela toda)
- [ ] Adicionar modal com detalhes da venda ao clicar em parcela


## Ajustes Solicitados - Pagamentos (2ª Rodada)
- [x] Limitar largura dos cards de parcelas para não ocuparem tela toda
- [x] Adicionar filtro por nome do cliente


## Ajustes Solicitados - Pagamentos (3ª Rodada)
- [x] Adicionar indicador visual para parcelas atrasadas


## Dashboard - Resumo Financeiro
- [x] Criar página de Dashboard
- [x] Implementar gráfico de vendas por período
- [x] Implementar cards com totais (receita total, pendente, pago, atrasado)
- [x] Implementar gráfico de status de pagamentos (pizza/donut)
- [x] Implementar listagem de últimas vendas
- [x] Implementar listagem de parcelas próximas a vencer
- [x] Adicionar rota de Dashboard no App.tsx
- [x] Adicionar Dashboard no menu de navegação


## Exportação de Relatórios em PDF
- [x] Criar componente de geração de PDF para vendas
- [x] Criar componente de geração de PDF para pagamentos
- [x] Adicionar botão de exportação na página de Vendas
- [x] Adicionar botão de exportação na página de Pagamentos
- [x] Implementar filtros de período para relatórios
- [x] Implementar filtros de cliente para relatórios


## Melhorias de Entrada de Dados
- [x] Aceitar virgula como separador decimal nos campos de valor
- [x] Converter virgula para ponto automaticamente para o banco de dados


## Bugs Reportados
- [x] Campo de valor não permite digitar corretamente com virgula
- [x] Botões com comportamento estranho no formulário de vendas


## Melhorias Mobile
- [x] Menu lateral deve recolher automaticamente após clicar em uma página no modo mobile


## Integração com Twilio - WhatsApp
- [x] Configurar credenciais da Twilio (Account SID, Auth Token, Número de WhatsApp)
- [x] Criar função para enviar mensagens via Twilio
- [x] Implementar agendamento de notificações 1 dia antes do vencimento
- [x] Adicionar botão para enviar notificação manual na página de Pagamentos
- [ ] Testar envio de notificações


## Dashboard - Melhorias Solicitadas
- [x] Adicionar filtro por período (data inicial e final) na Dashboard
- [x] Criar ranking dos clientes que mais compraram por período
- [x] Atualizar gráficos para refletir o período selecionado


## Melhorias de Telefone e WhatsApp
- [ ] Tornar campo de telefone opcional no cadastro de clientes
- [ ] Adicionar coluna `whatsappEnabled` na tabela de clientes
- [ ] Adicionar toggle para ativar/desativar envio de WhatsApp por cliente
- [ ] Validar telefone apenas quando WhatsApp estiver ativado
- [ ] Atualizar modal de detalhes da parcela para verificar se cliente tem WhatsApp habilitado


## Melhorias de Telefone e WhatsApp - Solicitacao do Usuario
- [x] Tornar campo de telefone opcional no cadastro de clientes
- [x] Adicionar coluna `whatsappEnabled` na tabela de clientes
- [x] Adicionar toggle para ativar/desativar envio de WhatsApp por cliente
- [x] Validar telefone apenas quando WhatsApp estiver ativado
- [x] Atualizar modal de detalhes da parcela para verificar se cliente tem WhatsApp habilitado
- [x] Mostrar indicador visual se cliente tem WhatsApp habilitado


## Correcao de Entrada de Valores - Parcelas
- [x] Corrigir campo de valor da parcela para aceitar virgula como separador decimal
- [x] Fazer comportamento consistente com campo de valor do produto


## Bugs Reportados - API Errors
- [x] Corrigir erro "Unexpected token '<'" - API retornando HTML em vez de JSON (Resolvido - era erro de autenticação)
- [x] Corrigir erro "Failed to fetch" - Problema de conectividade ou servidor (Resolvido - servidor reiniciado)


## Correcao de Campos de Valor - Aceitar Virgula Decimal
- [x] Corrigir campo de valor do produto para aceitar virgula como separador decimal
- [x] Corrigir campo de valor da parcela para aceitar virgula como separador decimal
- [x] Testar entrada de valores com virgula em ambos os campos


## Bug - Campos de Valor Não Aceitam Vírgula Corretamente
- [x] Investigar por que campos de valor não aceitam entrada com vírgula
- [x] Corrigir formatCurrencyInput para funcionar corretamente
- [x] Testar entrada de valores decimais em ambos os campos


## Bug - Total/Subtotal Incorreto
- [x] Investigar por que o total está mostrando valor errado (ex: "150,30" mostra "1,50")
- [x] Corrigir parseCommaDecimal ou formatCurrencyInput
- [x] Verificar cálculo de total na função calculateTotal()
