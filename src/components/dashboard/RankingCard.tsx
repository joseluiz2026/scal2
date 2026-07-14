import { fmt } from "@/lib/format";
import type { Partner, Sale } from "@/lib/types";
import Avatar from "../Avatar";

function partnerName(p: Partner) {
  return p.pessoa === "PF" ? p.nome_completo || "" : p.fantasia || "";
}

export default function RankingCard({ partners, sales }: { partners: Partner[]; sales: Sale[] }) {
  const ranked = partners
    .map((p) => {
      const pSales = sales.filter((s) => s.partner_id === p.id);
      const activeCount = pSales.filter((s) => s.status === "active").length;
      const totalPaid = pSales.reduce((sum, s) => {
        const paidM = (s.installments || []).filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0);
        const paidOT = s.one_time_status === "paid" ? 100 : 0;
        return sum + paidM + paidOT;
      }, 0);
      return { p, activeCount, totalPaid };
    })
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 3);

  return (
    <div className="ranking-card">
      <div className="panel-title">TOP 3 Parceiros</div>
      {ranked.length === 0 ? (
        <div className="rank-meta">Sem dados de comissão paga ainda.</div>
      ) : (
        ranked.map((r) => (
          <div className="ranking-item" key={r.p.id}>
            <Avatar seed={`${r.p.id}_${partnerName(r.p)}`} name={partnerName(r.p)} size={38} avatarUrl={r.p.avatar_url} />
            <div className="rank-info">
              <div className="rank-name">{partnerName(r.p)}</div>
              <div className="rank-meta">
                {r.activeCount} contrato{r.activeCount === 1 ? "" : "s"} ativo{r.activeCount === 1 ? "" : "s"} · {fmt(r.totalPaid)} pagos
              </div>
            </div>
            <div className="trophy-badge">🏆</div>
          </div>
        ))
      )}
    </div>
  );
}
