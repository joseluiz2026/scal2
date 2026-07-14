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
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { fmt } from "@/lib/format";
import { computeMonthlyCommission } from "@/lib/monthlyCommission";
import type { Sale } from "@/lib/types";
import { useThemeColors } from "./useThemeColors";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

const tooltipCurrency: NonNullable<ChartOptions<"bar">["plugins"]>["tooltip"] = {
  callbacks: {
    label: (ctx) => fmt(ctx.parsed.y ?? 0),
  },
};

export default function PartnerCharts({ sales, theme }: { sales: Sale[]; theme: string }) {
  const c = useThemeColors(theme);

  const activeSales = sales.filter((s) => s.status === "active");
  const resCount = activeSales.filter((s) => s.kind === "residencial").length;
  const condCount = activeSales.filter((s) => s.kind === "condominial").length;
  const cancelledCount = sales.filter((s) => s.status === "cancelled").length;
  const pendingCount = sales.filter((s) => s.status === "aguardando_cotacao").length;

  const forecastByMonth = Array(12).fill(0);
  activeSales.forEach((s) => {
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

  if (sales.length === 0) return null;

  return (
    <>
      <div className="chart-card" style={{ marginBottom: 24 }}>
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

      <div className="dashboard-grid">
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
                  { data: [activeSales.length, cancelledCount, pendingCount], backgroundColor: [c.signal, c.red, c.amber], borderWidth: 0 },
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
        <div className="chart-card" style={{ gridColumn: "span 2" }}>
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
