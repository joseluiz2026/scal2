import { fmt } from "@/lib/format";
import type { Partner, Sale } from "@/lib/types";

export default function DistStats({ partners, sales }: { partners: Partner[]; sales: Sale[] }) {
  const activeSales = sales.filter((s) => s.status === "active");

  const dueThisMonth = activeSales.reduce((sum, s) => {
    const due = (s.installments || []).find((i) => i.status === "due");
    const oneTimeDue = s.one_time_status === "due" ? 100 : 0;
    return sum + (due ? due.amount : 0) + oneTimeDue;
  }, 0);

  const totalRemaining = activeSales.reduce((sum, s) => {
    const oneTimeDue = s.one_time_status === "due" ? 100 : 0;
    return (
      sum +
      (s.installments || []).filter((i) => i.status === "due" || i.status === "future").reduce((a, i) => a + i.amount, 0) +
      oneTimeDue
    );
  }, 0);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="label">Parceiros ativos</div>
        <div className="value">{partners.length}</div>
        <div className="sub">lojas + técnicos</div>
      </div>
      <div className="stat-card">
        <div className="label">Vendas ativas</div>
        <div className="value signal">{activeSales.length}</div>
        <div className="sub">gerando comissão mensal</div>
      </div>
      <div className="stat-card">
        <div className="label">A pagar este mês</div>
        <div className="value copper">{fmt(dueThisMonth)}</div>
        <div className="sub">soma de todos os parceiros</div>
      </div>
      <div className="stat-card">
        <div className="label">Pendente até o mês 12</div>
        <div className="value">{fmt(totalRemaining)}</div>
        <div className="sub">projeção restante</div>
      </div>
    </div>
  );
}
