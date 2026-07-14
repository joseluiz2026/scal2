"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { fmt } from "@/lib/format";
import { computeMonthlyCommission } from "@/lib/monthlyCommission";
import type { Partner, Sale } from "@/lib/types";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

function partnerName(p: Partner) {
  return p.pessoa === "PF" ? p.nome_completo || "" : p.fantasia || "";
}

type ThemeColors = {
  accent: string;
  signal: string;
  amber: string;
  red: string;
  violet: string;
  muted: string;
  border: string;
};

function useThemeColors(theme: string): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>({
    accent: "#4F8EFF",
    signal: "#3FD6C5",
    amber: "#E8A94D",
    red: "#E2665A",
    violet: "#9C8CE0",
    muted: "#8C9FB3",
    border: "#2A3B4D",
  });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const c = (name: string) => styles.getPropertyValue(name).trim();
    // Canvas can't read CSS custom properties directly, so resolved colors must be
    // read from the DOM (client-only) and re-read whenever the theme changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors({
      accent: c("--copper"),
      signal: c("--signal"),
      amber: c("--amber"),
      red: c("--red"),
      violet: c("--violet"),
      muted: c("--text-muted"),
      border: c("--border"),
    });
  }, [theme]);

  return colors;
}

const tooltipCurrency: NonNullable<ChartOptions<"bar">["plugins"]>["tooltip"] = {
  callbacks: {
    label: (ctx) => fmt(ctx.parsed.y ?? 0),
  },
};

export default function DashboardCharts({ partners, sales, theme }: { partners: Partner[]; sales: Sale[]; theme: string }) {
  const c = useThemeColors(theme);

  const partnersRanked = partners
    .map((p) => {
      const pContracts = sales.filter((s) => s.partner_id === p.id);
      const total = pContracts.reduce((sum, s) => {
        const paidM = (s.installments || []).filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0);
        const paidOT = s.one_time_status === "paid" ? 100 : 0;
        return sum + paidM + paidOT;
      }, 0);
      const parts = partnerName(p).split(" ");
      return { name: `${parts[0]} ${parts[1] || ""}`, total };
    })
    .sort((a, b) => b.total - a.total);

  const activeSalesAll = sales.filter((s) => s.status === "active");
  const resCount = activeSalesAll.filter((s) => s.kind === "residencial").length;
  const condCount = activeSalesAll.filter((s) => s.kind === "condominial").length;
  const cancelledCount = sales.filter((s) => s.status === "cancelled").length;
  const pendingCount = sales.filter((s) => s.status === "aguardando_cotacao").length;

  const forecastByMonth = Array(12).fill(0);
  activeSalesAll.forEach((s) => {
    (s.installments || []).forEach((i) => {
      if (i.status === "due" || i.status === "future") forecastByMonth[i.month - 1] += i.amount;
    });
  });

  const { monthLabels, monthValues, monthlyAvg } = computeMonthlyCommission(sales);

  const axisOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipCurrency },
    scales: {
      x: { ticks: { color: c.muted, font: { size: 10 } }, grid: { display: false } },
      y: { ticks: { color: c.muted, callback: (v) => fmt(Number(v)) }, grid: { color: c.border } },
    },
  };

  return (
    <>
      <div className="chart-card" style={{ marginTop: 36, marginBottom: 24 }}>
        <div className="chart-title">Comissão paga por mês</div>
        <div className="chart-box">
          <Line
            data={{
              labels: monthLabels,
              datasets: [
                {
                  label: "Comissão paga",
                  data: monthValues,
                  borderColor: c.signal,
                  backgroundColor: `${c.signal}22`,
                  fill: true,
                  tension: 0.35,
                  pointRadius: 3,
                  pointBackgroundColor: c.signal,
                  borderWidth: 2,
                },
                {
                  label: "Média",
                  data: Array(12).fill(monthlyAvg),
                  borderColor: c.accent,
                  borderDash: [6, 4],
                  borderWidth: 1.5,
                  pointRadius: 0,
                  fill: false,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "bottom", labels: { color: c.muted, boxWidth: 10, padding: 14 } },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${fmt(ctx.parsed.y ?? 0)}`,
                  },
                },
              },
              scales: {
                x: { ticks: { color: c.muted, font: { size: 10 } }, grid: { display: false } },
                y: { ticks: { color: c.muted, callback: (v) => fmt(Number(v)) }, grid: { color: c.border } },
              },
            }}
          />
        </div>
      </div>

      <div className="section-head">
        <h2>Dashboard</h2>
      </div>
      <div className="dashboard-grid">
        <div className="chart-card">
          <div className="chart-title">Comissão total por parceiro</div>
          <div className="chart-box">
            <Bar
              data={{
                labels: partnersRanked.map((d) => d.name),
                datasets: [{ data: partnersRanked.map((d) => d.total), backgroundColor: c.accent, borderRadius: 6, maxBarThickness: 36 }],
              }}
              options={axisOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Composição da carteira</div>
          <div className="chart-box">
            <Doughnut
              data={{
                labels: ["Residencial", "Condominial"],
                datasets: [{ data: [resCount, condCount], backgroundColor: [c.signal, c.violet], borderWidth: 0 }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                plugins: { legend: { position: "bottom", labels: { color: c.muted, boxWidth: 10, padding: 14 } } },
              }}
            />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Status dos contratos</div>
          <div className="chart-box">
            <Doughnut
              data={{
                labels: ["Ativos", "Cancelados", "Aguardando cotação"],
                datasets: [
                  { data: [activeSalesAll.length, cancelledCount, pendingCount], backgroundColor: [c.signal, c.red, c.amber], borderWidth: 0 },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                plugins: { legend: { position: "bottom", labels: { color: c.muted, boxWidth: 10, padding: 14 } } },
              }}
            />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Projeção de comissão por mês do contrato</div>
          <div className="chart-box">
            <Bar
              data={{
                labels: forecastByMonth.map((_: number, i: number) => `M${i + 1}`),
                datasets: [{ data: forecastByMonth, backgroundColor: c.signal, borderRadius: 5, maxBarThickness: 26 }],
              }}
              options={axisOptions}
            />
          </div>
        </div>
      </div>
    </>
  );
}
