"use client";

import { useState } from "react";
import type { Sale } from "@/lib/types";

type Kind = "residencial" | "condominial";

export default function QuoteForm({
  onCreated,
  onError,
}: {
  onCreated: (sale: Sale) => void;
  onError: (message: string) => void;
}) {
  const [kind, setKind] = useState<Kind>("residencial");
  const [submitting, setSubmitting] = useState(false);

  const [rNome, setRNome] = useState("");
  const [rCpf, setRCpf] = useState("");
  const [rRg, setRRg] = useState("");
  const [rCep, setRCep] = useState("");
  const [rCidade, setRCidade] = useState("");
  const [rEndereco, setREndereco] = useState("");
  const [rTel1, setRTel1] = useState("");
  const [rTel2, setRTel2] = useState("");
  const [rTel3, setRTel3] = useState("");
  const [rBoxPortao, setRBoxPortao] = useState(false);
  const [rBoxGaragem, setRBoxGaragem] = useState(false);

  const [cResponsavel, setCResponsavel] = useState("");
  const [cTel, setCTel] = useState("");
  const [cNome, setCNome] = useState("");
  const [cRazao, setCRazao] = useState("");
  const [cCnpj, setCCnpj] = useState("");
  const [cBlocos, setCBlocos] = useState("");
  const [cAptos, setCAptos] = useState("");
  const [cCep, setCCep] = useState("");
  const [cCidade, setCCidade] = useState("");
  const [cEndereco, setCEndereco] = useState("");
  const [cPorte, setCPorte] = useState("Pequeno");
  const [cBoxPortao, setCBoxPortao] = useState(false);
  const [cBoxGaragem, setCBoxGaragem] = useState(false);

  function resetFields() {
    setRNome("");
    setRCpf("");
    setRRg("");
    setRCep("");
    setRCidade("");
    setREndereco("");
    setRTel1("");
    setRTel2("");
    setRTel3("");
    setRBoxPortao(false);
    setRBoxGaragem(false);
    setCResponsavel("");
    setCTel("");
    setCNome("");
    setCRazao("");
    setCCnpj("");
    setCBlocos("");
    setCAptos("");
    setCCep("");
    setCCidade("");
    setCEndereco("");
    setCPorte("Pequeno");
    setCBoxPortao(false);
    setCBoxGaragem(false);
  }

  async function handleSubmit() {
    let client: Record<string, string | boolean>;

    if (kind === "residencial") {
      if (!rNome.trim() || !rCpf.trim() || !rEndereco.trim() || !rTel1.trim()) {
        onError("Preencha nome, CPF, endereço e ao menos 1 telefone");
        return;
      }
      client = {
        nomeCompleto: rNome.trim(),
        cpf: rCpf.trim(),
        rg: rRg.trim(),
        cep: rCep.trim(),
        cidade: rCidade.trim(),
        endereco: rEndereco.trim(),
        tel1: rTel1.trim(),
        tel2: rTel2.trim() || "-",
        tel3: rTel3.trim() || "-",
        boxPortao: rBoxPortao,
        boxGaragem: rBoxGaragem,
      };
    } else {
      if (!cResponsavel.trim() || !cNome.trim() || !cCnpj.trim() || !cEndereco.trim()) {
        onError("Preencha responsável, nome do condomínio, CNPJ e endereço");
        return;
      }
      client = {
        responsavel: cResponsavel.trim(),
        tel: cTel.trim(),
        nomeCondominio: cNome.trim(),
        razaoSocial: cRazao.trim(),
        cnpj: cCnpj.trim(),
        blocos: cBlocos.trim(),
        aptos: cAptos.trim(),
        cep: cCep.trim(),
        cidade: cCidade.trim(),
        endereco: cEndereco.trim(),
        porte: cPorte,
        boxPortao: cBoxPortao,
        boxGaragem: cBoxGaragem,
      };
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, client }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível enviar o pedido.");
        return;
      }
      resetFields();
      onCreated(data.sale);
    } catch {
      onError("Não foi possível conectar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <div className="kind-toggle">
        <button className={kind === "residencial" ? "active" : ""} onClick={() => setKind("residencial")}>
          Pessoa Física · Residência
        </button>
        <button className={kind === "condominial" ? "active" : ""} onClick={() => setKind("condominial")}>
          Pessoa Jurídica · Condomínio
        </button>
      </div>

      {kind === "residencial" ? (
        <div className="field-grid">
          <div className="field span2">
            <label>Nome completo</label>
            <input type="text" placeholder="Nome do cliente" value={rNome} onChange={(e) => setRNome(e.target.value)} />
          </div>
          <div className="field">
            <label>CPF</label>
            <input type="text" placeholder="000.000.000-00" value={rCpf} onChange={(e) => setRCpf(e.target.value)} />
          </div>
          <div className="field">
            <label>CI (RG)</label>
            <input type="text" placeholder="00.000.000-0" value={rRg} onChange={(e) => setRRg(e.target.value)} />
          </div>
          <div className="field">
            <label>CEP</label>
            <input type="text" placeholder="29000-000" value={rCep} onChange={(e) => setRCep(e.target.value)} />
          </div>
          <div className="field span2">
            <label>Cidade</label>
            <input type="text" placeholder="Vitória - ES" value={rCidade} onChange={(e) => setRCidade(e.target.value)} />
          </div>
          <div className="field span3">
            <label>Endereço completo</label>
            <input
              type="text"
              placeholder="Rua, número, bairro, complemento"
              value={rEndereco}
              onChange={(e) => setREndereco(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Telefone 1</label>
            <input type="text" placeholder="(27) 90000-0000" value={rTel1} onChange={(e) => setRTel1(e.target.value)} />
          </div>
          <div className="field">
            <label>Telefone 2</label>
            <input type="text" placeholder="(27) 90000-0000" value={rTel2} onChange={(e) => setRTel2(e.target.value)} />
          </div>
          <div className="field">
            <label>Telefone 3</label>
            <input type="text" placeholder="(27) 90000-0000" value={rTel3} onChange={(e) => setRTel3(e.target.value)} />
          </div>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input type="checkbox" checked={rBoxPortao} onChange={(e) => setRBoxPortao(e.target.checked)} />
              <span>Toque Box Portão</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={rBoxGaragem} onChange={(e) => setRBoxGaragem(e.target.checked)} />
              <span>Toque Box Garagem</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="field-grid">
          <div className="field span2">
            <label>Nome do síndico / responsável</label>
            <input type="text" placeholder="Nome completo" value={cResponsavel} onChange={(e) => setCResponsavel(e.target.value)} />
          </div>
          <div className="field">
            <label>Telefone de contato</label>
            <input type="text" placeholder="(27) 90000-0000" value={cTel} onChange={(e) => setCTel(e.target.value)} />
          </div>
          <div className="field span2">
            <label>Nome do condomínio</label>
            <input
              type="text"
              placeholder="Ex: Condomínio Alto da Serra"
              value={cNome}
              onChange={(e) => setCNome(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Razão social</label>
            <input type="text" placeholder="Razão social do condomínio" value={cRazao} onChange={(e) => setCRazao(e.target.value)} />
          </div>
          <div className="field">
            <label>CNPJ</label>
            <input type="text" placeholder="00.000.000/0000-00" value={cCnpj} onChange={(e) => setCCnpj(e.target.value)} />
          </div>
          <div className="field">
            <label>Nº de blocos</label>
            <input type="number" placeholder="Ex: 3" value={cBlocos} onChange={(e) => setCBlocos(e.target.value)} />
          </div>
          <div className="field">
            <label>Nº de apartamentos</label>
            <input type="number" placeholder="Ex: 48" value={cAptos} onChange={(e) => setCAptos(e.target.value)} />
          </div>
          <div className="field">
            <label>Porte do condomínio</label>
            <select value={cPorte} onChange={(e) => setCPorte(e.target.value)}>
              <option value="Pequeno">Pequeno</option>
              <option value="Médio">Médio</option>
              <option value="Grande">Grande</option>
            </select>
          </div>
          <div className="field">
            <label>CEP</label>
            <input type="text" placeholder="29000-000" value={cCep} onChange={(e) => setCCep(e.target.value)} />
          </div>
          <div className="field span2">
            <label>Cidade</label>
            <input type="text" placeholder="Vitória - ES" value={cCidade} onChange={(e) => setCCidade(e.target.value)} />
          </div>
          <div className="field span3">
            <label>Endereço completo</label>
            <input
              type="text"
              placeholder="Rua, número, bairro, complemento"
              value={cEndereco}
              onChange={(e) => setCEndereco(e.target.value)}
            />
          </div>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input type="checkbox" checked={cBoxPortao} onChange={(e) => setCBoxPortao(e.target.checked)} />
              <span>Toque Box Portão</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={cBoxGaragem} onChange={(e) => setCBoxGaragem(e.target.checked)} />
              <span>Toque Box Garagem</span>
            </label>
          </div>
        </div>
      )}

      <div className="submit-row">
        <button className="btn primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar pedido de cotação"}
        </button>
      </div>
    </div>
  );
}
