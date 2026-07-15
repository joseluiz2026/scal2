"use client";

import { useState } from "react";
import { commissionRate, displayName, kindLabel } from "@/lib/commission";
import { fmtDate } from "@/lib/format";
import type { Sale } from "@/lib/types";

function clientDetailsPairs(sale: Sale): [string, string][] {
  const c = sale.client_data;
  const equip =
    [c.boxPortao ? "Toque Box Portão" : null, c.boxGaragem ? "Toque Box Garagem" : null].filter(Boolean).join(", ") ||
    "Nenhum";

  if (sale.kind === "residencial") {
    return [
      ["Natureza", "Pessoa Física"],
      ["Nome completo", String(c.nomeCompleto || "-")],
      ["CPF", String(c.cpf || "-")],
      ["CI (RG)", String(c.rg || "-")],
      ["CEP", String(c.cep || "-")],
      ["Cidade", String(c.cidade || "-")],
      ["Endereço", String(c.endereco || "-")],
      ["Telefone 1", String(c.tel1 || "-")],
      ["Telefone 2", String(c.tel2 || "-")],
      ["Telefone 3", String(c.tel3 || "-")],
      ["Equipamentos adicionais", equip],
    ];
  }
  return [
    ["Natureza", "Pessoa Jurídica"],
    ["Síndico/Responsável", String(c.responsavel || "-")],
    ["Telefone de contato", String(c.tel || "-")],
    ["Condomínio", String(c.nomeCondominio || "-")],
    ["Razão social", String(c.razaoSocial || "-")],
    ["CNPJ", String(c.cnpj || "-")],
    ["Nº de blocos", String(c.blocos || "-")],
    ["Nº de apartamentos", String(c.aptos || "-")],
    ["CEP", String(c.cep || "-")],
    ["Cidade", String(c.cidade || "-")],
    ["Endereço", String(c.endereco || "-")],
    ["Equipamentos adicionais", equip],
  ];
}

export default function PendingQuotesList({
  sales,
  onChanged,
  onError,
}: {
  sales: Sale[];
  onChanged: () => void;
  onError: (message: string) => void;
}) {
  const [values, setValues] = useState<
    Record<string, { monthly: string; install: string; setup: string; boxPortao: string; boxGaragem: string }>
  >({});
  const [busyId, setBusyId] = useState<string | null>(null);

  function fieldsFor(id: string) {
    return values[id] || { monthly: "", install: "", setup: "", boxPortao: "", boxGaragem: "" };
  }

  function setField(id: string, key: "monthly" | "install" | "setup" | "boxPortao" | "boxGaragem", value: string) {
    setValues((prev) => ({ ...prev, [id]: { ...fieldsFor(id), [key]: value } }));
  }

  async function approve(sale: Sale) {
    const { monthly, install, setup, boxPortao, boxGaragem } = fieldsFor(sale.id);
    const monthlyValue = parseFloat(monthly);
    if (!monthlyValue || monthlyValue <= 0) {
      onError("Informe o valor mensal cotado antes de aprovar");
      return;
    }
    setBusyId(sale.id);
    try {
      const res = await fetch(`/api/sales/${sale.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyValue,
          installationValue: parseFloat(install) || 0,
          setupValue: parseFloat(setup) || 0,
          boxPortaoValue: parseFloat(boxPortao) || 0,
          boxGaragemValue: parseFloat(boxGaragem) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível aprovar a cotação.");
        return;
      }
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(sale: Sale) {
    setBusyId(sale.id);
    try {
      const res = await fetch(`/api/sales/${sale.id}/reject`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível recusar o pedido.");
        return;
      }
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  if (sales.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">Nenhum pedido de cotação no momento.</div>
      </div>
    );
  }

  return (
    <>
      {sales.map((s) => {
        const partner = s.partners;
        const partnerName = partner ? (partner.pessoa === "PF" ? partner.nome_completo : partner.fantasia) : "";
        const rate = commissionRate(s.kind, s.client_data, partner?.rate || 0);
        const rateNote =
          s.kind === "condominial"
            ? `comissão automática ${(rate * 100).toFixed(0)}% (${parseInt(String(s.client_data.aptos || "")) || 0} unidades · faixa ${rate === 0.15 ? "acima de 20" : "até 20"})`
            : `comissão do parceiro ${(rate * 100).toFixed(0)}%`;
        const f = fieldsFor(s.id);

        return (
          <div className="quote-card" key={s.id}>
            <div className="sale-top">
              <div className="row-info">
                <div className="name">{displayName(s.kind, s.client_data)}</div>
                <div className="meta">
                  {partnerName} · {partner?.segment} · pedido em {fmtDate(s.sale_date)} · {rateNote}
                </div>
              </div>
              <span className="badge kind">{kindLabel(s.kind)}</span>
            </div>
            <details className="details-box">
              <summary>Ver dados completos</summary>
              <div className="details-grid">
                {clientDetailsPairs(s).map(([k, v]) => (
                  <div className="field-pair" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </div>
            </details>
            <div className="quote-action-row">
              <label>Valor mensal</label>
              <input type="number" placeholder="Ex: 180" value={f.monthly} onChange={(e) => setField(s.id, "monthly", e.target.value)} />
              <label>Taxa de instalação</label>
              <input type="number" placeholder="Ex: 300" value={f.install} onChange={(e) => setField(s.id, "install", e.target.value)} />
              <label>Taxa de setup</label>
              <input type="number" placeholder="Ex: 80" value={f.setup} onChange={(e) => setField(s.id, "setup", e.target.value)} />
              {Boolean(s.client_data.boxPortao) && (
                <>
                  <label>Valor Toque Box Portão</label>
                  <input
                    type="number"
                    placeholder="Ex: 33.90"
                    value={f.boxPortao}
                    onChange={(e) => setField(s.id, "boxPortao", e.target.value)}
                  />
                </>
              )}
              {Boolean(s.client_data.boxGaragem) && (
                <>
                  <label>Valor Toque Box Garagem</label>
                  <input
                    type="number"
                    placeholder="Ex: 33.90"
                    value={f.boxGaragem}
                    onChange={(e) => setField(s.id, "boxGaragem", e.target.value)}
                  />
                </>
              )}
            </div>
            <div className="quote-action-row">
              <button className="btn primary" onClick={() => approve(s)} disabled={busyId === s.id}>
                Aprovar e enviar cotação
              </button>
              <button className="btn ghost-red" onClick={() => reject(s)} disabled={busyId === s.id}>
                Recusar
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
