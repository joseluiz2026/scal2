"use client";

import { useState } from "react";
import { commissionRate, displayName, kindLabel } from "@/lib/commission";
import { fmt } from "@/lib/format";
import type { Partner, Sale } from "@/lib/types";
import Dial from "./Dial";
import OneTimeLine from "./OneTimeLine";
import PartnerNotaFiscal from "./PartnerNotaFiscal";
import PartnerProposal from "./PartnerProposal";

const PAGE_SIZE = 10;

export default function SalesList({
  sales,
  partner,
  partnerRate,
  onChanged,
  onError,
}: {
  sales: Sale[];
  partner: Partner;
  partnerRate: number;
  onChanged: () => void;
  onError: (message: string) => void;
}) {
  const [page, setPage] = useState(1);

  if (sales.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">Nenhum pedido lançado ainda.</div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageSales = sales.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="card">
      {pageSales.map((s) => {
        const paidCount = (s.installments || []).filter((i) => i.status === "paid").length;
        const badgeClass = s.status === "aguardando_cotacao" ? "pending" : s.status === "cancelled" ? "cancelled" : "active";
        const badgeText = s.status === "aguardando_cotacao" ? "Aguardando cotação" : s.status === "cancelled" ? "Cancelada" : "Ativa";
        const rate = commissionRate(s.kind, s.client_data, partnerRate);
        const valueLine =
          s.status === "aguardando_cotacao"
            ? "Aguardando valor cotado pelo distribuidor"
            : `${fmt(s.monthly_value || 0)}/mês · comissão ${fmt((s.monthly_value || 0) * rate)}/mês (${(rate * 100).toFixed(0)}%) · ${paidCount}/12 pago`;
        const dueInstallment = (s.installments || []).find((i) => i.status === "due");

        return (
          <div className="sale-block" key={s.id}>
            <div className="sale-top">
              <div className="row-info">
                <div className="name" style={s.status === "cancelled" ? { color: "var(--red)" } : undefined}>
                  {displayName(s.kind, s.client_data)}
                </div>
                <div className="meta">{valueLine}</div>
              </div>
              <div className="btn-row">
                <span className="badge kind">{kindLabel(s.kind)}</span>
                <span className={`badge ${badgeClass}`}>{badgeText}</span>
              </div>
            </div>
            <Dial installments={s.installments || []} />
            <OneTimeLine sale={s} editable={false} />
            {s.status === "active" && dueInstallment && (
              <PartnerNotaFiscal installment={dueInstallment} onUploaded={onChanged} onError={onError} />
            )}
            {s.kind === "condominial" && s.status === "active" && (
              <PartnerProposal sale={s} partner={partner} onUploaded={onChanged} onError={onError} />
            )}
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="btn-row" style={{ justifyContent: "center", marginTop: 12 }}>
          <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            ← Anterior
          </button>
          <span className="meta">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
