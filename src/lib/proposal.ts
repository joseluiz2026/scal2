import type { Sale } from "./types";

export function proposalNumber(sale: Sale) {
  const hex = sale.id.replace(/-/g, "").slice(0, 6);
  const n = parseInt(hex, 16) % 1000000;
  return `PC-${String(n).padStart(6, "0")}`;
}

export function recurringServiceLabel(clientData: Record<string, unknown>) {
  const aptos = String(clientData?.aptos ?? "").trim();
  return aptos ? `Serviço de Interfonia — ${aptos} unidades` : "Serviço de Interfonia Condominial";
}
