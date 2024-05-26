// src/interfaces/PaymentInterfaces.ts

/**
 * ClientPayment representa a estrutura de dados para armazenar informações de pagamento do cliente
 * que inclui o identificador interno do cliente e o identificador do cliente na API de pagamento.
 */
export interface ClientPayment {
  id_client: number;   // Identificador do cliente no sistema interno
  customerId: string;  // Identificador do cliente na API do Asaas ou outro serviço de pagamento
}

/**
 * PaymentData descreve a estrutura dos dados de pagamento obtidos da API de pagamento.
 */
export interface PaymentData {
  id: string;
  value: number;
  netValue: number;
  description: string;
  billingType: string; // Tipo de faturamento, que pode ser mapeado para o método de pagamento
  status: string;
  dueDate: string;
  originalDueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  installmentNumber: number;
  invoiceUrl: string;
}

/**
 * PaymentResponse representa a resposta esperada após processar os pagamentos,
 * incluindo os detalhes do pagamento e qualquer erro que possa ter ocorrido.
 */
export interface PaymentResponse {
  customerId: string;
  payments: PaymentData[];
  error?: string;
}
