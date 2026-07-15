import { TOQUE_BOX_MONTHLY_PRICE } from "./commission";
import { fmt } from "./format";
import type { Sale } from "./types";

export function proposalNumber(sale: Sale) {
  const hex = sale.id.replace(/-/g, "").slice(0, 6);
  const n = parseInt(hex, 16) % 1000000;
  return `PC-${String(n).padStart(6, "0")}`;
}

export function recurringServiceLabel(clientData: Record<string, unknown>) {
  const aptos = String(clientData?.aptos ?? "").trim();
  const porte = String(clientData?.porte ?? "").trim();
  const main = aptos
    ? `📡 Interfonia — ${aptos} unidades${porte ? ` (Porte ${porte})` : ""}`
    : "📡 Interfonia Condominial";

  const addons: string[] = [];
  if (clientData?.boxPortao) addons.push("Toque Box Portão");
  if (clientData?.boxGaragem) addons.push("Toque Box Garagem");

  if (!addons.length) return main;

  const addonTotal = addons.length * TOQUE_BOX_MONTHLY_PRICE;
  return `${main}\n↳ Inclui ${addons.join(" + ")} (+${fmt(addonTotal)}/mês)`;
}
