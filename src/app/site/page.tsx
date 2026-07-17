import type { Metadata } from "next";
import "./site.css";

export const metadata: Metadata = {
  title: "Toque Aí | Seja um Revendedor Oficial",
  description:
    "Torne-se um Revendedor Oficial Toque Aí e receba comissões mensais recorrentes por cada condomínio ativo.",
};

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4jismX6sOFFBE5kPM1tvXiEVo50URXvQoXfx9rCPnZ2i7cm7v0JzZTrCnL6eRcQG4ZYTkD0ACDDQmgDstWmqY6-QKLKRamSNwZlbzluMGBBIFD8Gx2k58Zc6t6Af_LrUXXwff1aqgimb_prsXPwbjvSWJaCaNc3Aqe6bYuTKK0kmDrsEoTj47c8lOwsgnrS_7nnn2G0t-yi_ERZZQf-7aMi2tLdoY0Zy8IPB206Nfa82MtyvWnQtA8nNCZV0zZWG0uIF8WXHCk1ku";
const HERO_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZtRXz9kngfd7sRUPOtJWhAvRAHl9FPeIz_m_EGhUt1AFV-YA5el9Jr7GzKzqNEtLlfD6JxI8arb3lb985yD6GFVooYa37gkzm5q3WRmD4TjV1W6gGUsYmc27fxFxpumXSSv2C2H1x8kkANhIUEBAqsKgApVm-fC6dd4_VCJyaOja1hI-E11xXqNq6hzxd3FXQkqTTqB1_WGZXTvI1E7XpO2mBuzplcD3hYbuonYvy_kAEBEyBhmCv_58yZkhFWj1s4zu2_pAE71MG";
const MAP_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAFJNE6je6Rskq8WEruJ4JtMEZ1OLVqIYNKP7bSiG67jYUUHVg5kVMTafgnQAoCq-cznlp2hjsIyz8An2jtxfJ6L7V0AnlhsHk2VDU6enq91mwl449v4RwoLigqPdSJiCqFmf3OgKe7ks646XNTRBz1RWsTWv9YtpxzPOcOrujvdroCIpHjIVdLswaHomorXGnLpQUEStT1iF0l7tRanpL5p8Y3FhTixnLx5q5lBIMB4OPXmbESrGd6Cxw6vry0MaAr42Hb9EWwMUwW";
const GALLERY_URLS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBMfvs0ao1-sVpI3NOcML1ugQFlE-cvMdAsetNOqc3PB1ySXsgxcG3ibM2NX-IhKcH4li5m52_inQ435oozEQxpXsCFqW2qOHVXQjv0odx73V5CzrW2YKRQnfhdqAGipiNSLYujLjJG72xuL7OIysRLAeGtp5BTqqP8zNj9QV5yNkEVo_i8NxtkSyqUr1yPywC8trbkzz2N0WIGbkUMQJt61urs_maGBQ6IcT4VAO-eJ9oEskhdPrzncAB5eQOoBlFrqakmNJgBju14",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCqXCowd6bOoVYp6Fxkl7MH26On0u1JmlmgTMwACfWqpVdsxoqsprFGG2t84oh_lp5C821V1Y8w6scQEJ29fnwwdDf-pzNyBNyQ_513HvCbPLhOyENHA8P2-K61tuOTWVcH2TkWypQKkwrn8IRshzQ7Dn-_kR3RqvdcdLR9o8Grox-O0YdlisapPI8l_r_BSOazcUCibqaODx_nB-RDnK6oDfBCTYwfnrVu6U1-oupOaF8xW4HGVdEQc9Kzb5DKF-cbEPWdbxYAEMTj",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB8mRXjh86HDUhMnxObZvMjC6mA9RG4-A8KJRghpTRXdOg76yAa2Cd545wXBzZiZjjrSnWugXSlCgkIP3EuA81lnuGdh2_p2_kxp8XjNGvTZfSVZedaTBhN32WYLstLTb46IN6XUv0ROOF1LvbXt6YnBQBchtkS7pSE5QgJaKzZtbPYtdGf6AZujGYq--25k-i2Gd1ABf0QRgIoJQQ0UvSvYpOrpGanhqLdJt5wDevbuaYbZL6QC7H4WKeQ71ly8-e-LuTZ8JgFkvEz",
];

const PARCEIROS_HREF = "/parceiros";

export default function SitePage() {
  return (
    <div className="st-page">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <nav className="st-nav">
        <div className="st-nav-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Logo Toque Aí" className="st-logo" src={LOGO_URL} />
          <div className="st-nav-links">
            <a href="#beneficios">Benefícios</a>
            <a href="#como-funciona">Como Funciona</a>
            <a href="#ganhos">Ganhos</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="st-nav-actions">
            <a className="st-login-link" href="/">
              Login
            </a>
            <a className="st-btn" href="#cta-final">
              Seja um Revendedor
            </a>
          </div>
        </div>
      </nav>

      <section className="st-hero" id="hero">
        <div
          className="st-hero-bg"
          style={{ backgroundImage: `url('${HERO_URL}')` }}
        />
        <div className="st-hero-gradient" />
        <div className="st-hero-grid">
          <div className="st-hero-copy">
            <div className="st-badge">
              <span className="st-badge-dot" />
              <span>OPORTUNIDADE EXCLUSIVA NO ES</span>
            </div>
            <h1 className="st-h1">
              Transforme sua carteira em uma{" "}
              <span className="st-gradient-text">renda recorrente.</span>
            </h1>
            <p className="st-body-lg">
              Torne-se um Revendedor Oficial Toque Aí e receba comissões mensais
              por cada condomínio ativo. Tecnologia de ponta que o mercado já
              está exigindo.
            </p>
            <div>
              <a className="st-btn st-btn-lg" href={PARCEIROS_HREF}>
                QUERO FAZER PARTE
              </a>
            </div>
            <div className="st-check-grid">
              {["Treinamento", "Suporte", "Material", "Sem estoque", "Nuvem"].map(
                (label) => (
                  <div className="st-check-item" key={label}>
                    <span className="material-symbols-outlined st-icon-ok">
                      check_circle
                    </span>
                    <span>{label}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="st-section" style={{ background: "var(--st-surface-lowest)" }}>
        <div className="st-container">
          <div className="st-center">
            <h2 className="st-h2">Por que este mercado está mudando?</h2>
            <p className="st-lead">
              A tecnologia analógica está morrendo. Quem oferecer a solução
              digital primeiro, dominará a região.
            </p>
          </div>
          <div className="st-compare-grid">
            <div className="st-glass-card st-compare-card st-compare-old">
              <div className="st-compare-head">
                <h3>Interfone tradicional</h3>
                <span className="material-symbols-outlined st-icon-error">
                  history
                </span>
              </div>
              <ul className="st-compare-list">
                <li>
                  <span className="material-symbols-outlined st-icon-error">
                    close
                  </span>
                  <div>
                    <p className="st-item-title">Kilômetros de Cabos</p>
                    <p className="st-item-sub">
                      Infraestrutura cara, pesada e de difícil manutenção.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="material-symbols-outlined st-icon-error">
                    close
                  </span>
                  <div>
                    <p className="st-item-title">Manutenção Constante</p>
                    <p className="st-item-sub">
                      Oxidação, quebra de fios e aparelhos antigos.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="material-symbols-outlined st-icon-error">
                    close
                  </span>
                  <div>
                    <p className="st-item-title">Problemas de Acesso</p>
                    <p className="st-item-sub">
                      O morador precisa estar em casa para atender.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="st-glass-card st-compare-card st-compare-new">
              <span className="st-tag">O FUTURO</span>
              <div className="st-compare-head">
                <h3 style={{ color: "var(--st-tertiary)" }}>
                  Vídeo Porteiro Digital
                </h3>
                <span className="material-symbols-outlined st-icon-ok">
                  bolt
                </span>
              </div>
              <ul className="st-compare-list">
                <li>
                  <span className="material-symbols-outlined st-icon-ok">
                    check
                  </span>
                  <div>
                    <p className="st-item-title">QR Code &amp; Smartphone</p>
                    <p className="st-item-sub">
                      Tudo acontece na tela do celular do morador, em tempo
                      real.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="material-symbols-outlined st-icon-ok">
                    check
                  </span>
                  <div>
                    <p className="st-item-title">100% em Nuvem</p>
                    <p className="st-item-sub">
                      Sem servidores locais ou infraestrutura física complexa.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="material-symbols-outlined st-icon-ok">
                    check
                  </span>
                  <div>
                    <p className="st-item-title">Instalação Wireless</p>
                    <p className="st-item-sub">
                      Zero cabos. Instalação concluída em poucas horas.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="st-section" id="beneficios">
        <div className="st-container">
          <div className="st-center">
            <h2 className="st-h2">Seu cliente economiza. Você ganha.</h2>
            <p className="st-lead">
              Uma proposta onde todos saem ganhando com tecnologia de ponta.
            </p>
          </div>
          <div className="st-benefit-grid">
            {[
              {
                icon: "devices",
                title: "Tech Moderna",
                text: "Interface intuitiva e hardware de baixo custo que valoriza o imóvel.",
              },
              {
                icon: "speed",
                title: "Instalação rápida",
                text: "Instale condomínios inteiros em um único dia sem quebra-quebra.",
              },
              {
                icon: "build",
                title: "Baixa manutenção",
                text: "Atualizações automáticas via nuvem reduzem visitas técnicas.",
              },
              {
                icon: "payments",
                title: "Receita recorrente",
                text: "Receba comissão todo mês enquanto o condomínio estiver ativo.",
              },
            ].map((item) => (
              <div className="st-glass-card st-benefit-card" key={item.title}>
                <div className="st-icon-box">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-section st-calc-section" id="ganhos">
        <div className="st-container st-calc-grid">
          <div>
            <h2 className="st-h2">Quanto você pode ganhar?</h2>
            <p className="st-body-lg" style={{ maxWidth: "none" }}>
              Nossa estrutura de comissionamento foi desenhada para parceiros
              que buscam escalabilidade e segurança financeira.
            </p>
            <div className="st-tier-list">
              <div className="st-tier">
                <div className="st-tier-pct">10%</div>
                <div>
                  <p className="st-item-title">Até 20 apartamentos</p>
                  <p className="st-item-sub">Comissão mensal fixa por unidade.</p>
                </div>
              </div>
              <div className="st-tier">
                <div className="st-tier-pct">15%</div>
                <div>
                  <p className="st-item-title">Mais de 20 apartamentos</p>
                  <p className="st-item-sub">Aumente sua margem com volume.</p>
                </div>
              </div>
              <p className="st-fine-print">
                * Pagamentos mensais garantidos por contrato de 12 meses ou
                mais.
              </p>
            </div>
          </div>
          <div className="st-glass-card st-calc-card">
            <div className="st-calc-head">
              <p>Simulação de Ganhos</p>
              <h4 className="st-calc-value">R$ 5.400,00</h4>
              <p style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
                Receita Recorrente Mensal
              </p>
            </div>
            <div className="st-calc-rows">
              <div className="st-calc-row">
                <span>Condomínios</span>
                <span>10 unidades</span>
              </div>
              <div className="st-calc-row">
                <span>Total Aptos</span>
                <span>200 aptos</span>
              </div>
              <div className="st-calc-row">
                <span>Tempo Estimado</span>
                <span>3 meses de atuação</span>
              </div>
            </div>
            <button className="st-btn-outline" type="button">
              Simular meu cenário
            </button>
          </div>
        </div>
      </section>

      <section className="st-section" style={{ textAlign: "center" }}>
        <div className="st-container">
          <h2 className="st-h2">
            Estamos formando nossa rede oficial de parceiros em todo o Estado
            (ES)
          </h2>
          <p className="st-lead" style={{ marginBottom: 64 }}>
            Seja o braço direito da Toque Aí na sua região e garanta
            exclusividade de atendimento para novos leads.
          </p>
          <div className="st-map-frame">
            <div
              className="st-map-img"
              style={{ backgroundImage: `url('${MAP_URL}')` }}
            />
            <div className="st-map-pin-wrap">
              <div className="st-map-pin" />
            </div>
          </div>
          <a className="st-btn st-btn-lg" href={PARCEIROS_HREF}>
            Quero garantir minha região
          </a>
        </div>
      </section>

      <section className="st-section st-timeline-section" id="como-funciona">
        <div className="st-container">
          <h2 className="st-h2" style={{ textAlign: "center", marginBottom: 80 }}>
            Passo a passo para o sucesso
          </h2>
          <div className="st-timeline-grid">
            {[
              { n: 1, title: "Cadastro", text: "Preencha seus dados de parceiro." },
              { n: 2, title: "Entrevista", text: "Alinhamento de metas e região." },
              { n: 3, title: "Treinamento", text: "Capacitação técnica e comercial." },
              { n: 4, title: "Material", text: "Acesso ao kit de marketing." },
              { n: 5, title: "Vendas", text: "Feche seu primeiro condomínio." },
              { n: 6, title: "Comissão", text: "Receba sua renda recorrente.", active: true },
            ].map((step) => (
              <div className="st-timeline-item" key={step.n}>
                <div className={`st-timeline-num${step.active ? " st-active" : ""}`}>
                  {step.n}
                </div>
                <h5>{step.title}</h5>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-section">
        <div className="st-container">
          <h2 className="st-h2" style={{ textAlign: "center", marginBottom: 80 }}>
            Diferenciais do Programa
          </h2>
          <div className="st-diff-grid">
            {[
              ["inventory_2", "Sem estoque"],
              ["ads_click", "Marketing pronto"],
              ["savings", "Baixo investimento"],
              ["verified", "Certificado oficial"],
              ["support_agent", "Suporte dedicado"],
              ["school", "Mentoria semanal"],
              ["map", "Região protegida"],
              ["monitoring", "Dashboard parceiro"],
              ["history_edu", "Contratos prontos"],
              ["rocket_launch", "Escalabilidade"],
              ["hub", "Network local"],
              ["campaign", "Leads da matriz"],
            ].map(([icon, label]) => (
              <div className="st-glass-card st-diff-item" key={label}>
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-section" style={{ background: "var(--st-surface-lowest)" }}>
        <div className="st-container">
          <h2 className="st-h2" style={{ textAlign: "center", marginBottom: 80 }}>
            O produto em ação
          </h2>
          <div className="st-gallery-grid">
            {GALLERY_URLS.map((url) => (
              <div className="st-glass-card st-gallery-item" key={url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Instalação Toque Aí em condomínio" src={url} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-section" id="faq">
        <div className="st-container">
          <h2 className="st-h2" style={{ textAlign: "center", marginBottom: 64 }}>
            Dúvidas Frequentes
          </h2>
          <div className="st-faq-list">
            {[
              {
                q: "Preciso ter conhecimento técnico avançado?",
                a: "Não é necessário. Nós fornecemos todo o treinamento técnico e comercial para que você possa realizar as instalações e vendas com total segurança.",
              },
              {
                q: "Qual o investimento inicial para ser revendedor?",
                a: "O investimento é focado na sua capacitação e kit inicial de demonstração. Entre em contato para receber a tabela de valores atualizada para sua região.",
              },
              {
                q: "As regiões são exclusivas?",
                a: "Sim. Trabalhamos com reserva de área para garantir que nossos parceiros não compitam entre si e tenham um mercado saudável para crescer.",
                open: true,
              },
              {
                q: "Como funciona o recebimento das comissões?",
                a: "As comissões são pagas mensalmente via transferência bancária, baseadas no número de condomínios e apartamentos ativos na sua carteira.",
              },
              {
                q: "A Toque Aí fornece leads?",
                a: "Sim! Leads qualificados que chegam pelo nosso site oficial são redirecionados para os parceiros certificados da respectiva região.",
              },
              {
                q: "Qual o suporte oferecido pela matriz?",
                a: "Oferecemos suporte técnico via WhatsApp, reuniões semanais de alinhamento e suporte presencial para grandes projetos.",
              },
            ].map((item) => (
              <details
                className="st-glass-card st-faq-item"
                key={item.q}
                open={item.open}
              >
                <summary>
                  <span>{item.q}</span>
                  <span className="material-symbols-outlined">expand_more</span>
                </summary>
                <div className="st-faq-answer">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="st-final-section" id="cta-final">
        <div className="st-container">
          <div className="st-final-box">
            <h2 className="st-h2">
              As melhores regiões do Espírito Santo serão ocupadas primeiro.
            </h2>
            <p className="st-body-lg" style={{ maxWidth: 640, margin: "0 auto 48px" }}>
              Não perca a chance de ser pioneiro na digitalização dos
              condomínios do estado. Reserve sua área agora.
            </p>
            <a className="st-btn st-btn-xl" href={PARCEIROS_HREF}>
              QUERO FAZER PARTE
            </a>
            <p className="st-slots-note">
              <span className="material-symbols-outlined">lock</span>
              Últimas 5 vagas para o treinamento de Janeiro
            </p>
          </div>
        </div>
      </section>

      <footer className="st-footer">
        <div className="st-footer-grid">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Logo Toque Aí" className="st-footer-logo" src={LOGO_URL} />
            <p>
              Revolucionando o acesso a condomínios com tecnologia 100%
              digital e segura. Viva o futuro agora.
            </p>
            <div className="st-social-row">
              <a aria-label="Website" className="st-social-btn" href="#">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a aria-label="Contato" className="st-social-btn" href="#">
                <span className="material-symbols-outlined">
                  alternate_email
                </span>
              </a>
            </div>
          </div>
          <div className="st-footer-cols">
            <div>
              <h6>Legal</h6>
              <ul>
                <li>
                  <a href="#">Termos de Uso</a>
                </li>
                <li>
                  <a href="#">Política de Privacidade</a>
                </li>
              </ul>
            </div>
            <div>
              <h6>Links Rápidos</h6>
              <ul>
                <li>
                  <a href="#">Contato</a>
                </li>
                <li>
                  <a href="#">Suporte Tecnico</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="st-footer-bottom">
          © {new Date().getFullYear()} Toque Aí Brasil. Todos os direitos
          reservados.
        </div>
      </footer>
    </div>
  );
}
