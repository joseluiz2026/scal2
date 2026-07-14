"use client";

import { useState } from "react";
import type { Partner } from "@/lib/types";

type PartnerType = "PF" | "PJ";

export default function PartnerForm({
  onCreated,
  onError,
}: {
  onCreated: (partner: Partner, creds: { name: string; username: string; password: string }) => void;
  onError: (message: string) => void;
}) {
  const [partnerType, setPartnerType] = useState<PartnerType>("PF");
  const [segment, setSegment] = useState("Loja");
  const [rate, setRate] = useState("");
  const [pix, setPix] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [pfNome, setPfNome] = useState("");
  const [pfCpf, setPfCpf] = useState("");
  const [pfRg, setPfRg] = useState("");
  const [pfTel, setPfTel] = useState("");
  const [pfEmail, setPfEmail] = useState("");

  const [pjRazao, setPjRazao] = useState("");
  const [pjFantasia, setPjFantasia] = useState("");
  const [pjCnpj, setPjCnpj] = useState("");
  const [pjResponsavel, setPjResponsavel] = useState("");
  const [pjTel, setPjTel] = useState("");
  const [pjEmail, setPjEmail] = useState("");

  function resetFields() {
    setRate("");
    setPix("");
    setPfNome("");
    setPfCpf("");
    setPfRg("");
    setPfTel("");
    setPfEmail("");
    setPjRazao("");
    setPjFantasia("");
    setPjCnpj("");
    setPjResponsavel("");
    setPjTel("");
    setPjEmail("");
  }

  async function handleSubmit() {
    const rateValue = parseFloat(rate);
    if (!rateValue || rateValue <= 0 || !pix.trim()) {
      onError("Preencha a comissão (%) e a chave Pix");
      return;
    }

    const body: Record<string, string | number> = {
      pessoa: partnerType,
      segment,
      rate: rateValue,
      pix: pix.trim(),
    };

    let displayName = "";

    if (partnerType === "PF") {
      if (!pfNome.trim() || !pfCpf.trim() || !pfTel.trim()) {
        onError("Preencha nome completo, CPF e telefone");
        return;
      }
      displayName = pfNome.trim();
      Object.assign(body, {
        nomeCompleto: pfNome.trim(),
        cpf: pfCpf.trim(),
        rg: pfRg.trim(),
        tel: pfTel.trim(),
        email: pfEmail.trim(),
      });
    } else {
      if (!pjRazao.trim() || !pjCnpj.trim() || !pjTel.trim()) {
        onError("Preencha razão social, CNPJ e telefone");
        return;
      }
      displayName = pjFantasia.trim() || pjRazao.trim();
      Object.assign(body, {
        razaoSocial: pjRazao.trim(),
        fantasia: pjFantasia.trim(),
        cnpj: pjCnpj.trim(),
        responsavel: pjResponsavel.trim(),
        tel: pjTel.trim(),
        email: pjEmail.trim(),
      });
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível cadastrar o parceiro.");
        return;
      }
      resetFields();
      onCreated(data.partner, { name: displayName, username: data.username, password: data.password });
    } catch {
      onError("Não foi possível conectar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <div className="kind-toggle">
        <button className={partnerType === "PF" ? "active" : ""} onClick={() => setPartnerType("PF")}>
          Pessoa Física
        </button>
        <button className={partnerType === "PJ" ? "active" : ""} onClick={() => setPartnerType("PJ")}>
          Pessoa Jurídica
        </button>
      </div>

      <div className="field-grid" style={{ marginBottom: 12 }}>
        <div className="field">
          <label>Atuação</label>
          <select value={segment} onChange={(e) => setSegment(e.target.value)}>
            <option value="Loja">Loja</option>
            <option value="Técnico">Técnico</option>
          </select>
        </div>
        <div className="field">
          <label>Comissão (%)</label>
          <input type="number" placeholder="Ex: 12" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div className="field">
          <label>Chave Pix</label>
          <input
            type="text"
            placeholder="E-mail, telefone ou CPF/CNPJ"
            value={pix}
            onChange={(e) => setPix(e.target.value)}
          />
        </div>
      </div>

      {partnerType === "PF" ? (
        <div className="field-grid">
          <div className="field span2">
            <label>Nome completo</label>
            <input type="text" placeholder="Nome do parceiro" value={pfNome} onChange={(e) => setPfNome(e.target.value)} />
          </div>
          <div className="field">
            <label>CPF</label>
            <input type="text" placeholder="000.000.000-00" value={pfCpf} onChange={(e) => setPfCpf(e.target.value)} />
          </div>
          <div className="field">
            <label>RG</label>
            <input type="text" placeholder="00.000.000-0" value={pfRg} onChange={(e) => setPfRg(e.target.value)} />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input type="text" placeholder="(27) 90000-0000" value={pfTel} onChange={(e) => setPfTel(e.target.value)} />
          </div>
          <div className="field span2">
            <label>E-mail</label>
            <input type="text" placeholder="email@exemplo.com" value={pfEmail} onChange={(e) => setPfEmail(e.target.value)} />
          </div>
        </div>
      ) : (
        <div className="field-grid">
          <div className="field span2">
            <label>Razão social</label>
            <input type="text" placeholder="Razão social" value={pjRazao} onChange={(e) => setPjRazao(e.target.value)} />
          </div>
          <div className="field">
            <label>Nome fantasia</label>
            <input type="text" placeholder="Nome fantasia" value={pjFantasia} onChange={(e) => setPjFantasia(e.target.value)} />
          </div>
          <div className="field">
            <label>CNPJ</label>
            <input type="text" placeholder="00.000.000/0000-00" value={pjCnpj} onChange={(e) => setPjCnpj(e.target.value)} />
          </div>
          <div className="field">
            <label>Responsável</label>
            <input
              type="text"
              placeholder="Nome do responsável"
              value={pjResponsavel}
              onChange={(e) => setPjResponsavel(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input type="text" placeholder="(27) 90000-0000" value={pjTel} onChange={(e) => setPjTel(e.target.value)} />
          </div>
          <div className="field span2">
            <label>E-mail</label>
            <input type="text" placeholder="email@exemplo.com" value={pjEmail} onChange={(e) => setPjEmail(e.target.value)} />
          </div>
        </div>
      )}

      <div className="submit-row">
        <button className="btn primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Cadastrando..." : "Cadastrar parceiro"}
        </button>
      </div>
    </div>
  );
}
