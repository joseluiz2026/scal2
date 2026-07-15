export type Partner = {
  id: string;
  pessoa: "PF" | "PJ";
  segment: "Loja" | "Técnico";
  rate: number;
  pix: string | null;
  avatar_url: string | null;
  nome_completo: string | null;
  cpf: string | null;
  rg: string | null;
  razao_social: string | null;
  fantasia: string | null;
  cnpj: string | null;
  responsavel: string | null;
  telefone: string | null;
  email: string | null;
  username: string | null;
  created_at: string;
  is_demo: boolean;
  is_suspended: boolean;
};

export type SaleKind = "residencial" | "condominial";
export type SaleStatus = "aguardando_cotacao" | "active" | "cancelled";
export type InstallmentStatus = "future" | "due" | "paid" | "cancelled";

export type Installment = {
  id: string;
  sale_id: string;
  month: number;
  amount: number;
  status: InstallmentStatus;
  paid_at: string | null;
  nota_fiscal_url: string | null;
  nota_fiscal_conferred: boolean;
  receipt_url: string | null;
  receipt_confirmed: boolean;
  receipt_confirmed_at: string | null;
  nota_fiscal_signed_url?: string | null;
  receipt_signed_url?: string | null;
};

export type SalePartnerSummary = Pick<
  Partner,
  "id" | "pessoa" | "nome_completo" | "fantasia" | "segment" | "rate" | "is_demo"
>;

export type Sale = {
  id: string;
  partner_id: string;
  kind: SaleKind;
  client_data: Record<string, unknown>;
  monthly_value: number | null;
  installation_value: number | null;
  setup_value: number | null;
  one_time_status: "due" | "paid" | null;
  status: SaleStatus;
  sale_date: string;
  created_at: string;
  box_portao_value: number | null;
  box_garagem_value: number | null;
  proposal_url: string | null;
  proposal_confirmed: boolean;
  proposal_confirmed_at: string | null;
  proposal_signed_url?: string | null;
  installments?: Installment[];
  partners?: SalePartnerSummary;
};

export type Message = {
  id: string;
  partner_id: string | null;
  title: string;
  body: string;
  created_at: string;
  message_reads?: { partner_id: string }[];
};

export type Pedido = {
  id: string;
  createdAt: string;
  clientsCount: number;
  installed: boolean;
  installedAt: string | null;
  signedUrl: string | null;
};
