import { fmt } from "@/lib/format";
import type { Sale } from "@/lib/types";
import Sparkline from "./Sparkline";

export default function KpiStack({ sales }: { sales: Sale[] }) {
  const totalPaidAllTime = sales.reduce((sum, s) => {
    const paidM = (s.installments || []).filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0);
    const paidOT = s.one_time_status === "paid" ? 100 : 0;
    return sum + paidM + paidOT;
  }, 0);
  const cancelledCount = sales.filter((s) => s.status === "cancelled").length;
  const pendingQuotesCount = sales.filter((s) => s.status === "aguardando_cotacao").length;

  const kpis = [
    { label: "Comissão paga (total)", value: fmt(totalPaidAllTime), color: "var(--signal)" },
    { label: "Comprovantes confirmados", value: "0", color: "var(--signal)" },
    { label: "Aguardando confirmação", value: "0", color: "var(--copper)" },
    { label: "Contratos cancelados", value: String(cancelledCount), color: "var(--red)" },
    { label: "Cotações aguardando aprovação", value: String(pendingQuotesCount), color: "var(--copper)" },
  ];

  return (
    <div className="kpi-stack">
      {kpis.map((k) => (
        <div className="kpi-mini-card" key={k.label}>
          <div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
          <Sparkline seed={k.label} color={k.color} />
        </div>
      ))}
    </div>
  );
}
