/**
 * Converte valor com virgula (formato brasileiro) para número
 * Exemplo: "150,50" -> 150.50
 */
export function parseCommaDecimal(value: string): number {
  if (!value) return 0;

  // Remove espaços
  const trimmed = value.trim();

  // Substitui virgula por ponto
  const normalized = trimmed.replace(",", ".");

  // Converte para número
  const num = parseFloat(normalized);

  return isNaN(num) ? 0 : num;
}

/**
 * Formata número para moeda brasileira com vírgula
 * Exemplo: 150.50 -> "R$ 150,50"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata número para exibição com virgula como separador decimal
 * Exemplo: 150.50 -> "150,50"
 */
export function formatDecimal(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Valida se o valor é um número válido (com ou sem virgula)
 */
export function isValidDecimal(value: string): boolean {
  const num = parseCommaDecimal(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Formata entrada de valor para aceitar apenas números e vírgula
 * Exemplo: "150,50" permanece "150,50"
 * Exemplo: "150.50" é convertido para "150,50"
 */
export function formatCurrencyInput(value: string): string {
  if (!value) return "";

  // Remove espaços
  const trimmed = value.trim();

  // Remove caracteres inválidos (mantém apenas números, vírgula e ponto)
  const cleaned = trimmed.replace(/[^0-9,.]/g, "");

  // Substitui todos os pontos por vírgula
  let normalized = cleaned.replace(/\./g, ",");

  // Remove múltiplas vírgulas (mantém apenas a primeira)
  const parts = normalized.split(",");
  if (parts.length > 2) {
    // Junta todas as partes após a primeira vírgula
    return parts[0] + "," + parts.slice(1).join("");
  }

  return normalized;
}

/**
 * Formata entrada de valor da direita para esquerda (como campo de moeda real)
 * Exemplo: digita "1" -> "0,01"
 * Exemplo: digita "12" -> "0,12"
 * Exemplo: digita "123" -> "1,23"
 * Exemplo: digita "1234" -> "12,34"
 */
export function formatCurrencyInputRightToLeft(
  value: string,
  previousValue: string = ""
): string {
  if (!value) return "0,00";

  // Remove tudo exceto números
  const numbersOnly = value.replace(/\D/g, "");

  if (!numbersOnly) return "0,00";

  // Converte para número inteiro (centavos)
  const cents = parseInt(numbersOnly, 10);

  if (isNaN(cents)) return "0,00";

  // Converte centavos para reais e formata
  const reais = cents / 100;

  // Formata com 2 casas decimais e vírgula
  return formatDecimal(reais);
}
