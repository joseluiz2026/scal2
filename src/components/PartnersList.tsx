"use client";

import { useState } from "react";
import PartnerAccordion from "./sales/PartnerAccordion";
import type { Partner, Sale } from "@/lib/types";
import Avatar from "./Avatar";
import DeletePartnerModal from "./DeletePartnerModal";
import EditCredentialsModal from "./EditCredentialsModal";

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

export default function PartnersList({
  partners,
  sales,
  loading,
  onToggleDemo,
  onDeletePartner,
  onToggleSuspend,
  onSaveUsername,
  onRegeneratePassword,
  onChanged,
  onError,
}: {
  partners: Partner[];
  sales: Sale[];
  loading: boolean;
  onToggleDemo?: (partner: Partner) => void;
  onDeletePartner?: (partner: Partner) => Promise<void>;
  onToggleSuspend?: (partner: Partner) => void;
  onSaveUsername?: (partner: Partner, username: string) => Promise<boolean>;
  onRegeneratePassword?: (partner: Partner) => Promise<boolean>;
  onChanged: () => void;
  onError: (message: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Partner | null>(null);
  const [editingCredentials, setEditingCredentials] = useState<Partner | null>(null);

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
        const partnerSales = sales.filter((s) => s.partner_id === p.id);
        const activeCount = partnerSales.filter((s) => s.status === "active").length;
        const isExpanded = expandedId === p.id;

        return (
          <div className="quote-card" key={p.id}>
            <div className="sale-top" style={{ cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : p.id)}>
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
                {p.is_suspended && <span className="badge cancelled">🚫 Suspenso</span>}
                {onToggleDemo && (
                  <button
                    className={`badge ${p.is_demo ? "demo" : "demo-off"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDemo(p);
                    }}
                    title={p.is_demo ? "Clique para desmarcar como demonstração" : "Clique para marcar como demonstração"}
                  >
                    {p.is_demo ? "🎭 Demo" : "Marcar como demo"}
                  </button>
                )}
                <div className="row-value">
                  <div className="amount">{activeCount}</div>
                  <div className="amount-label">vendas ativas</div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <PartnerAccordion partner={p} sales={partnerSales} onChanged={onChanged} onError={onError} />
            )}

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

            {(onToggleSuspend || onSaveUsername || onDeletePartner) && (
              <div className="btn-row" style={{ marginTop: 10 }}>
                {onToggleSuspend && (
                  <button className="btn" onClick={() => onToggleSuspend(p)}>
                    {p.is_suspended ? "✅ Reativar parceiro" : "🚫 Suspender parceiro"}
                  </button>
                )}
                {onSaveUsername && (
                  <button className="btn" onClick={() => setEditingCredentials(p)}>
                    ✏️ Editar usuário/senha
                  </button>
                )}
                {onDeletePartner && (
                  <button className="btn ghost-red" onClick={() => setPendingDelete(p)}>
                    Excluir parceiro
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {pendingDelete && onDeletePartner && (
        <DeletePartnerModal
          partnerName={partnerName(pendingDelete)}
          activeSalesCount={sales.filter((s) => s.partner_id === pendingDelete.id && s.status === "active").length}
          onConfirm={async () => {
            await onDeletePartner(pendingDelete);
            setPendingDelete(null);
          }}
          onClose={() => setPendingDelete(null)}
        />
      )}

      {editingCredentials && onSaveUsername && onRegeneratePassword && (
        <EditCredentialsModal
          partner={editingCredentials}
          onSaveUsername={async (username) => {
            const ok = await onSaveUsername(editingCredentials, username);
            if (ok) setEditingCredentials(null);
            return ok;
          }}
          onRegeneratePassword={async () => {
            const ok = await onRegeneratePassword(editingCredentials);
            if (ok) setEditingCredentials(null);
            return ok;
          }}
          onClose={() => setEditingCredentials(null)}
        />
      )}
    </div>
  );
}
