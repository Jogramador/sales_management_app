import twilio from 'twilio';
import { ENV } from './_core/env';

const client = twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);

export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    // Formatar número de telefone para o padrão internacional
    let formattedNumber = toPhoneNumber.replace(/\D/g, '');
    
    // Se não tiver código de país, adicionar +55 (Brasil)
    if (formattedNumber.length === 11) {
      formattedNumber = '55' + formattedNumber;
    }
    
    const result = await client.messages.create({
      from: `whatsapp:${ENV.twilioWhatsappNumber}`,
      to: `whatsapp:+${formattedNumber}`,
      body: message,
    });

    console.log(`[WhatsApp] Mensagem enviada com sucesso para ${toPhoneNumber}. SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error(`[WhatsApp] Erro ao enviar mensagem para ${toPhoneNumber}:`, error);
    return false;
  }
}

export function formatInstallmentNotification(
  clientName: string,
  installmentNumber: number,
  amount: number,
  dueDate: string
): string {
  const formattedAmount = (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return `Olá ${clientName}! 👋

Lembramos que a parcela #${installmentNumber} de ${formattedAmount} vence amanhã (${dueDate}).

Favor realizar o pagamento para evitar atrasos.

Obrigado! 🙏`;
}
