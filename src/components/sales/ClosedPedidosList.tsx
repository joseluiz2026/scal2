import { fmtDateTime } from "@/lib/format";
import type { Pedido } from "@/lib/types";

function partnerName(p: Pedido["partner"]) {
  if (!p) return "Parceiro removido";
  return p.pessoa === "PF" ? p.nome_completo || "" : p.fantasia || "";
}

export default function ClosedPedidosList({ pedidos, loading }: { pedidos: Pedido[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="card">
        <div className="empty-state">Carregando...</div>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">Nenhum pedido fechado (instalado) neste mês ainda.</div>
      </div>
    );
  }

  return (
    <div className="card">
      {pedidos.map((p) => (
        <div className="sale-block" key={p.id}>
          <div className="sale-top">
            <div className="row-info">
              <div className="name">{partnerName(p.partner)}</div>
              <div className="meta">
                {p.clientsCount} cliente{p.clientsCount === 1 ? "" : "s"} · enviado em {fmtDateTime(p.createdAt)}
                {p.installedAt ? ` · instalado em ${fmtDateTime(p.installedAt)}` : ""}
              </div>
            </div>
            <div className="btn-row">
              {p.partner?.is_demo && <span className="badge demo">Demo</span>}
              <span className="badge active">✓ Instalado</span>
              {p.signedUrl && (
                <a className="receipt-link" href={p.signedUrl} target="_blank" rel="noreferrer">
                  📄 Ver pedido
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
