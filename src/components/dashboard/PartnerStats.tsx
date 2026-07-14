import { fmt } from "@/lib/format";
import type { Partner, Sale } from "@/lib/types";
import Avatar from "../Avatar";

function partnerName(p: Partner) {
  return p.pessoa === "PF" ? p.nome_completo || "" : p.fantasia || "";
}

export default function PartnerStats({ partner, sales }: { partner: Partner; sales: Sale[] }) {
  const active = sales.filter((s) => s.status === "active");
  const pending = sales.filter((s) => s.status === "aguardando_cotacao");
  const totalReceived = active.reduce((sum, s) => {
    const paidM = (s.installments || []).filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0);
    const paidOT = s.one_time_status === "paid" ? 100 : 0;
    return sum + paidM + paidOT;
  }, 0);
  const totalPending = active.reduce((sum, s) => {
    const pendingM = (s.installments || [])
      .filter((i) => i.status === "due" || i.status === "future")
      .reduce((a, i) => a + i.amount, 0);
    const pendingOT = s.one_time_status === "due" ? 100 : 0;
    return sum + pendingM + pendingOT;
  }, 0);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="label">Parceiro</div>
        <div className="avatar-row" style={{ marginTop: 4 }}>
          <Avatar seed={`${partner.id}_${partnerName(partner)}`} name={partnerName(partner)} size={44} avatarUrl={partner.avatar_url} />
          <div>
            <div className="value" style={{ fontSize: 15 }}>
              {partnerName(partner)}
            </div>
            <div className="sub">{partner.segment} · comissão varia por venda</div>
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="label">Vendas ativas</div>
        <div className="value signal">{active.length}</div>
        <div className="sub">{pending.length} aguardando cotação</div>
      </div>
      <div className="stat-card">
        <div className="label">Já recebido</div>
        <div className="value copper">{fmt(totalReceived)}</div>
        <div className="sub">total pago até hoje</div>
      </div>
      <div className="stat-card">
        <div className="label">A receber</div>
        <div className="value">{fmt(totalPending)}</div>
        <div className="sub">restante nos próximos meses</div>
      </div>
    </div>
  );
}
