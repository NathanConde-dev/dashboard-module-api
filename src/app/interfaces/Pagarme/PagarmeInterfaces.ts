// src/interfaces/Pagarme/PagarmeInterfaces.ts

export interface PagarmeTransaction {
  object: string;
  status: string;
  refuse_reason: string | null;
  status_reason: string;
  acquirer_response_code: string;
  acquirer_response_message: string;
  acquirer_name: string;
  acquirer_id: string;
  authorization_code: string;
  soft_descriptor: string;
  tid: number;
  nsu: number;
  date_created: string;
  date_updated: string;
  amount: number;
  authorized_amount: number;
  paid_amount: number;
  refunded_amount: number;
  installments: number;
  id: number;
  cost: number;
  card_holder_name: string;
  card_last_digits: string;
  card_first_digits: string;
  card_brand: string;
  card_pin_mode: string | null;
  card_magstripe_fallback: boolean;
  card_funding_source: string;
  cvm_pin: boolean;
  postback_url: string;
  payment_method: string;
  capture_method: string;
  antifraud_score: string | null;
  boleto_url: string | null;
  boleto_barcode: string | null;
  boleto_expiration_date: string | null;
  boleto: string | null;
  referer: string;
  ip: string;
  subscription_id: string | null;
  phone: string | null;
  address: string | null;
  customer: PagarmeCustomer;
  billing: PagarmeBilling;
  shipping: PagarmeShipping;
  items: PagarmeItem[];
  card: PagarmeCard;
  split_rules: PagarmeSplitRule[] | null;
  metadata: PagarmeMetadata;
  antifraud_metadata: object;
  reference_key: string;
  device: string | null;
  local_transaction_id: string | null;
  local_time: string | null;
  fraud_covered: boolean;
  fraud_reimbursed: string | null;
  order_id: string | null;
  risk_level: string;
  receipt_url: string | null;
  payment: string | null;
  addition: string | null;
  discount: string | null;
  private_label: string | null;
  pix_data: string | null;
  pix_qr_code: string | null;
  pix_expiration_date: string | null;
  service_referer_name: string;
}

export interface PagarmeCustomer {
  object: string;
  id: number;
  external_id: string;
  type: string;
  country: string;
  document_number: string | null;
  document_type: string;
  name: string;
  email: string;
  phone_numbers: string[];
  born_at: string | null;
  birthday: string | null;
  gender: string | null;
  date_created: string;
  documents: PagarmeDocument[];
  client_since: string | null;
  risk_indicator: string | null;
}

export interface PagarmeDocument {
  object: string;
  id: string;
  type: string;
  number: string;
}

export interface PagarmeBilling {
  object: string;
  id: number;
  name: string;
  address: PagarmeAddress;
}

export interface PagarmeShipping {
  object: string;
  id: number;
  name: string;
  fee: number;
  delivery_date: string | null;
  expedited: boolean;
  address: PagarmeAddress;
}

export interface PagarmeAddress {
  object: string;
  street: string;
  complementary: string;
  street_number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  id: number;
}

export interface PagarmeItem {
  object: string;
  id: string;
  title: string;
  unit_price: number;
  quantity: number;
  category: string | null;
  tangible: boolean;
  venue: string | null;
  date: string | null;
}

export interface PagarmeCard {
  object: string;
  id: string;
  date_created: string;
  date_updated: string;
  brand: string;
  holder_name: string;
  first_digits: string;
  last_digits: string;
  country: string;
  fingerprint: string;
  valid: boolean;
  expiration_date: string;
}

export interface PagarmeSplitRule {
  object: string;
  id: string;
  liable: boolean;
  amount: number;
  percentage: number | null;
  recipient_id: string;
  charge_remainder: boolean;
  charge_processing_fee: boolean;
  block_id: string | null;
  date_created: string;
  date_updated: string;
}

export interface PagarmeMetadata {
  transaction_id: string;
  product_id: string;
  platform_integration: string;
  offer_id: string;
}
