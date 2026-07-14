import { fmt } from "@/lib/format";
import { computeMonthlyCommission } from "@/lib/monthlyCommission";
import type { Sale } from "@/lib/types";
import Donut from "./Donut";

export default function OverviewCard({ sales }: { sales: Sale[] }) {
  const activeSales = sales.filter((s) => s.status === "active");
  let paidAmt = 0;
  let dueAmt = 0;
  let futureAmt = 0;
  activeSales.forEach((s) => {
    (s.installments || []).forEach((i) => {
      if (i.status === "paid") paidAmt += i.amount;
      else if (i.status === "due") dueAmt += i.amount;
      else if (i.status === "future") futureAmt += i.amount;
    });
  });
  const cyclePct = paidAmt + dueAmt + futureAmt > 0 ? Math.round((100 * paidAmt) / (paidAmt + dueAmt + futureAmt)) : 0;
  const confirmedCount = 0;
  const totalReceipts = 0;
  const confirmedPct = totalReceipts > 0 ? Math.round((100 * confirmedCount) / totalReceipts) : 0;

  const { monthValues } = computeMonthlyCommission(sales);
  const lastM = monthValues[monthValues.length - 1] || 0;
  const prevM = monthValues[monthValues.length - 2] || 0;
  const growthTxt =
    prevM > 0
      ? `${lastM >= prevM ? "+" : ""}${Math.round((100 * (lastM - prevM)) / prevM)}% vs. mês anterior`
      : "sem dados suficientes do mês anterior";

  return (
    <div className="overview-card">
      <div className="panel-title">Visão geral</div>
      <div className="donut-row">
        <div className="donut-item">
          <Donut percent={cyclePct} color="var(--signal)" centerLabel={`${cyclePct}%`} />
          <div className="donut-sub">
            <b style={{ color: "var(--text)" }}>Ciclo pago</b>
            <br />
            {fmt(paidAmt)} de {fmt(paidAmt + dueAmt + futureAmt)}
            <br />
            {growthTxt}
          </div>
        </div>
        <div className="donut-item">
          <Donut percent={confirmedPct} color="var(--copper)" centerLabel={`${confirmedPct}%`} />
          <div className="donut-sub">
            <b style={{ color: "var(--text)" }}>Comprovantes confirmados</b>
            <br />
            {confirmedCount} de {totalReceipts} enviados
          </div>
        </div>
      </div>
    </div>
  );
}
