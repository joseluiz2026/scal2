import type { Sale } from "./types";

export function proposalNumber(sale: Sale) {
  const hex = sale.id.replace(/-/g, "").slice(0, 6);
  const n = parseInt(hex, 16) % 1000000;
  return `PC-${String(n).padStart(6, "0")}`;
}

export function recurringServiceLabel(clientData: Record<string, unknown>) {
  const aptos = String(clientData?.aptos ?? "").trim();
  const porte = String(clientData?.porte ?? "").trim();
  return aptos
    ? `📡 Interfonia — ${aptos} unidades${porte ? ` (Porte ${porte})` : ""}`
    : "📡 Interfonia Condominial";
}
