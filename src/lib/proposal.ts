import type { Sale } from "./types";

export function proposalNumber(sale: Sale) {
  const hex = sale.id.replace(/-/g, "").slice(0, 6);
  const n = parseInt(hex, 16) % 1000000;
  return `PC-${String(n).padStart(6, "0")}`;
}

export function recurringServiceLabel(clientData: Record<string, unknown>) {
  const aptos = String(clientData?.aptos ?? "").trim();
  const main = aptos ? `📡 Interfonia — ${aptos} unidades` : "📡 Interfonia Condominial";

  const addons: string[] = [];
  if (clientData?.boxPortao) addons.push("Toque Box Portão");
  if (clientData?.boxGaragem) addons.push("Toque Box Garagem");

  return addons.length ? `${main}\n↳ Inclui ${addons.join(" + ")}` : main;
}
