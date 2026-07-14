import type { Partner } from "@/lib/types";
import Avatar from "./Avatar";

function partnerName(p: Partner) {
  return p.pessoa === "PF" ? p.nome_completo || "" : p.fantasia || "";
}

function partnerDocNumber(p: Partner) {
  return p.pessoa === "PF" ? p.cpf : p.cnpj;
}

function detailsPairs(p: Partner): [string, string | null][] {
  if (p.pessoa === "PF") {
    return [
      ["Nome completo", p.nome_completo],
      ["CPF", p.cpf],
      ["RG", p.rg],
      ["Telefone", p.telefone],
      ["E-mail", p.email],
      ["Chave Pix", p.pix],
    ];
  }
  return [
    ["Razão social", p.razao_social],
    ["Nome fantasia", p.fantasia],
    ["CNPJ", p.cnpj],
    ["Responsável", p.responsavel],
    ["Telefone", p.telefone],
    ["E-mail", p.email],
    ["Chave Pix", p.pix],
  ];
}

export default function PartnersList({ partners, loading }: { partners: Partner[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="card">
        <div className="empty-state">Carregando...</div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">Nenhum parceiro cadastrado ainda.</div>
      </div>
    );
  }

  return (
    <div className="card">
      {partners.map((p) => {
        const docLabel = p.pessoa === "PF" ? "CPF" : "CNPJ";
        return (
          <div className="quote-card" key={p.id}>
            <div className="sale-top">
              <div className="avatar-row">
                <Avatar seed={p.id + "_" + partnerName(p)} name={partnerName(p)} size={40} avatarUrl={p.avatar_url} />
                <div className="row-info">
                  <div className="name">{partnerName(p)}</div>
                  <div className="meta">
                    {p.segment} · comissão {(p.rate * 100).toFixed(0)}% · {docLabel} {partnerDocNumber(p)}
                  </div>
                </div>
              </div>
              <div className="btn-row">
                <span className="badge kind">{p.pessoa}</span>
                <div className="row-value">
                  <div className="amount">0</div>
                  <div className="amount-label">vendas ativas</div>
                </div>
              </div>
            </div>
            <details className="details-box">
              <summary>Ver dados completos</summary>
              <div className="details-grid">
                {detailsPairs(p).map(([k, v]) => (
                  <div className="field-pair" key={k}>
                    <dt>{k}</dt>
                    <dd>{v || "-"}</dd>
                  </div>
                ))}
              </div>
            </details>
          </div>
        );
      })}
    </div>
  );
}
