import type { Sale } from "./types";

export function computeMonthlyCommission(sales: Sale[]) {
  const monthlyMap: Record<string, number> = {};

  sales.forEach((s) => {
    const [sy, sm, sd] = s.sale_date.split("-").map(Number);
    (s.installments || []).forEach((inst) => {
      if (inst.status !== "paid") return;
      const d = new Date(sy, sm - 1 + (inst.month - 1), sd);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + inst.amount;
    });
    if (s.one_time_status === "paid") {
      const key = `${sy}-${String(sm).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 100;
    }
  });

  const today = new Date();
  const monthLabels: string[] = [];
  const monthValues: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    monthLabels.push(label.charAt(0).toUpperCase() + label.slice(1));
    monthValues.push(monthlyMap[key] || 0);
  }

  const monthlyAvg = monthValues.reduce((a, b) => a + b, 0) / monthValues.length;
  return { monthLabels, monthValues, monthlyAvg };
}
