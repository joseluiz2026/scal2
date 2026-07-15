"use client";

import { useEffect, useState } from "react";
import { fmtDateTime } from "@/lib/format";
import type { Partner, Pedido } from "@/lib/types";

export default function PartnerPedidos({ partner, onError }: { partner: Partner; onError: (message: string) => void }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/partners/${partner.id}/pedido`)
      .then((res) => res.json())
      .then((data) => {
        if (data.pedidos) setPedidos(data.pedidos);
      })
      .finally(() => setLoading(false));
  }, [partner.id]);

  async function toggleInstalled(pedido: Pedido) {
    setBusyId(pedido.id);
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}/installed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installed: !pedido.installed }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível atualizar o pedido.");
        return;
      }
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedido.id
            ? { ...p, installed: !pedido.installed, installedAt: !pedido.installed ? new Date().toISOString() : null }
            : p,
        ),
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading || pedidos.length === 0) return null;

  return (
    <div className="card">
      <div className="section-head">
        <h2>Pedidos enviados ao fornecedor</h2>
        <span className="count">{pedidos.length} no total</span>
      </div>
      {pedidos.map((p) => (
        <div className="sale-block" key={p.id}>
          <div className="sale-top">
            <div className="row-info">
              <div className="name">
                📄 Pedido enviado em {fmtDateTime(p.createdAt)}
              </div>
              <div className="meta">
                {p.clientsCount} cliente{p.clientsCount === 1 ? "" : "s"} incluído{p.clientsCount === 1 ? "" : "s"}
                {p.installed && p.installedAt ? ` · instalado em ${fmtDateTime(p.installedAt)}` : ""}
              </div>
            </div>
            <div className="btn-row">
              {p.signedUrl && (
                <a className="receipt-link" href={p.signedUrl} target="_blank" rel="noreferrer">
                  📄 Ver pedido
                </a>
              )}
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={p.installed}
                  disabled={busyId === p.id}
                  onChange={() => toggleInstalled(p)}
                />
                <span>Instalado</span>
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
