"use client";

import { fmtDateTime } from "@/lib/format";
import type { Message } from "@/lib/types";

export default function PartnerMessages({
  messages,
  partnerId,
  onRead,
}: {
  messages: Message[];
  partnerId: string;
  onRead: (messageId: string) => void;
}) {
  if (messages.length === 0) return null;

  function isRead(m: Message) {
    return (m.message_reads || []).some((r) => r.partner_id === partnerId);
  }

  return (
    <div id="messages-section">
      <div className="section-head" style={{ marginTop: 0 }}>
        <h2 style={{ fontSize: 16 }}>Comunicados</h2>
      </div>
      {messages.map((m) => {
        const read = isRead(m);
        return (
          <div
            key={m.id}
            className={`message-card${read ? "" : " unread"}`}
            style={{ cursor: "pointer" }}
            onClick={() => !read && onRead(m.id)}
          >
            <div className="msg-head">
              <div>
                <div className="msg-title">
                  {!read && "🔵 "}
                  {m.title}
                </div>
                <div className="msg-meta">
                  {m.partner_id === null ? "Comunicado geral" : "Mensagem para você"} · {fmtDateTime(m.created_at)}
                </div>
              </div>
              {!read && <span className="msg-badge">Novo</span>}
            </div>
            <div className="msg-body">{m.body}</div>
          </div>
        );
      })}
    </div>
  );
}
