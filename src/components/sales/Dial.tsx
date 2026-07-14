"use client";

import type { Installment } from "@/lib/types";

export default function Dial({
  installments,
  onMarkPaid,
}: {
  installments: Installment[];
  onMarkPaid?: (installmentId: string) => void;
}) {
  if (!installments.length) return null;
  const sorted = [...installments].sort((a, b) => a.month - b.month);

  return (
    <div className="dial">
      {sorted.map((inst) => {
        if (inst.status === "cancelled") {
          return (
            <div key={inst.id} className="dot cancel-mark" title={`Mês ${inst.month} · cancelado`}>
              ×
            </div>
          );
        }

        const clickable = inst.status === "due" && !!onMarkPaid;
        let title = `Mês ${inst.month}`;
        if (inst.status === "due") title += clickable ? " · pendente (clique para marcar pago)" : " · pendente";
        if (inst.status === "paid") title += " · pago";
        if (inst.status === "future") title += " · futuro";

        return (
          <div
            key={inst.id}
            className={`dot ${inst.status}${clickable ? " clickable" : ""}`}
            title={title}
            onClick={clickable ? () => onMarkPaid!(inst.id) : undefined}
          />
        );
      })}
    </div>
  );
}
