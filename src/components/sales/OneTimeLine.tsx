"use client";

import { ONE_TIME_COMMISSION } from "@/lib/commission";
import { fmt } from "@/lib/format";
import type { Sale } from "@/lib/types";

export default function OneTimeLine({
  sale,
  editable,
  onMarkPaid,
}: {
  sale: Sale;
  editable: boolean;
  onMarkPaid?: () => void;
}) {
  const installationValue = sale.installation_value || 0;
  const setupValue = sale.setup_value || 0;
  if (installationValue === 0 && setupValue === 0) return null;

  const totalFee = installationValue + setupValue;
  const isPaid = sale.one_time_status === "paid";
  const clickable = editable && !isPaid;

  return (
    <div className="row" style={{ padding: "12px 0 0 0", border: "none", flexWrap: "wrap" }}>
      <div className="row-info">
        <div className="meta">
          Instalação + Setup: {fmt(totalFee)} · bônus {fmt(ONE_TIME_COMMISSION)}
        </div>
      </div>
      <span
        className={`badge ${isPaid ? "active" : "pending"}`}
        style={clickable ? { cursor: "pointer" } : undefined}
        onClick={clickable ? onMarkPaid : undefined}
      >
        {isPaid ? "Paga" : "Pendente"}
      </span>
    </div>
  );
}
