export type SaleKind = "residencial" | "condominial";

export function commissionRate(kind: SaleKind, clientData: Record<string, unknown>, partnerRate: number) {
  if (kind === "condominial") {
    const units = parseInt(String(clientData?.aptos ?? "")) || 0;
    return units > 20 ? 0.15 : 0.1;
  }
  return partnerRate;
}

export const kindLabel = (k: SaleKind) => (k === "residencial" ? "PF · Residência" : "PJ · Condomínio");

export function displayName(kind: SaleKind, client: Record<string, unknown>) {
  return String(kind === "residencial" ? client?.nomeCompleto ?? "" : client?.nomeCondominio ?? "");
}

export const ONE_TIME_COMMISSION = 100;
