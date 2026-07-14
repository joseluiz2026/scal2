import { fmtDateTime } from "@/lib/format";
import type { Message, Partner } from "@/lib/types";

function partnerName(p: Partner) {
  return p.pessoa === "PF" ? p.nome_completo || "" : p.fantasia || "";
}

export default function SentMessagesList({ messages, partners }: { messages: Message[]; partners: Partner[] }) {
  if (messages.length === 0) {
    return <div className="message-card">Nenhum comunicado enviado ainda.</div>;
  }

  return (
    <>
      {messages.map((m) => {
        const reads = m.message_reads || [];
        let readInfo: string;
        let scopeLabel: string;

        if (m.partner_id === null) {
          const readCount = partners.filter((p) => reads.some((r) => r.partner_id === p.id)).length;
          scopeLabel = "Todos os parceiros";
          readInfo = `${readCount} de ${partners.length} parceiro${partners.length === 1 ? "" : "s"} leram`;
        } else {
          const p = partners.find((x) => x.id === m.partner_id);
          scopeLabel = p ? partnerName(p) : "Parceiro removido";
          const read = reads.some((r) => r.partner_id === m.partner_id);
          readInfo = read ? `Lido por ${p ? partnerName(p) : "parceiro"}` : `Ainda não lido por ${p ? partnerName(p) : "parceiro"}`;
        }

        return (
          <div className="message-card" key={m.id}>
            <div className="msg-head">
              <div>
                <div className="msg-title">{m.title}</div>
                <div className="msg-meta">
                  {scopeLabel} · {fmtDateTime(m.created_at)}
                </div>
              </div>
              <span className="msg-badge outline">{m.partner_id === null ? "Broadcast" : "Individual"}</span>
            </div>
            <div className="msg-body">{m.body}</div>
            <div className="msg-read-list">{readInfo}</div>
          </div>
        );
      })}
    </>
  );
}
