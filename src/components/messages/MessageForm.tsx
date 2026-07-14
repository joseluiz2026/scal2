"use client";

import { useState } from "react";
import type { Message, Partner } from "@/lib/types";

function partnerName(p: Partner) {
  return p.pessoa === "PF" ? p.nome_completo || "" : p.fantasia || "";
}

export default function MessageForm({
  partners,
  onSent,
  onError,
}: {
  partners: Partner[];
  onSent: (message: Message, recipientLabel: string) => void;
  onError: (message: string) => void;
}) {
  const [recipientId, setRecipientId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) {
      onError("Preencha o título e a mensagem");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: recipientId || null, title: title.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível enviar o comunicado.");
        return;
      }
      const recipient = partners.find((p) => p.id === recipientId);
      const recipientLabel = recipient ? partnerName(recipient) : "todos os parceiros";
      setTitle("");
      setBody("");
      setRecipientId("");
      onSent(data.message, recipientLabel);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <div className="field-grid" style={{ marginBottom: 12 }}>
        <div className="field span2">
          <label>Destinatário</label>
          <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)}>
            <option value="">Todos os parceiros</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {partnerName(p)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Título</label>
        <input
          type="text"
          placeholder="Ex: Novo procedimento de nota fiscal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Mensagem</label>
        <textarea
          rows={4}
          placeholder="Escreva o comunicado para o(s) parceiro(s)..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            padding: "10px 12px",
            borderRadius: 8,
            resize: "vertical",
          }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <div className="submit-row">
        <button className="btn primary" onClick={handleSubmit} disabled={submitting}>
          📢 Enviar comunicado
        </button>
      </div>
    </div>
  );
}
