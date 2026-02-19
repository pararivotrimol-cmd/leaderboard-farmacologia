/**
 * Performance Report — Relatório de Performance por Semana
 * Mostra evolução de PF vs cronograma de Farmacologia
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Calendar, Target } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ORANGE = "#F7941D";
const GRAY = "#4A4A4A";
const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";

interface WeekPerformance {
  week: number;
  topic: string;
  studentPF: number;
  teamAvgPF: number;
  classAvgPF: number;
}

export default function PerformanceReport() {
  const [sessionToken, setSessionToken] = useState<string>("");
  const [weeklyData, setWeeklyData] = useState<WeekPerformance[]>([]);
  
  useEffect(() => {
    const token = localStorage.getItem("studentSessionToken") || "";
    setSessionToken(token);
  }, []);

  // Simulated weekly data (would come from API in production)
  useEffect(() => {
    if (sessionToken) {
      const mockData: WeekPerformance[] = [
        { week: 1, topic: "Farmacocinética 1", studentPF: 85, teamAvgPF: 80, classAvgPF: 75 },
        { week: 2, topic: "Farmacocinética 2", studentPF: 90, teamAvgPF: 85, classAvgPF: 78 },
        { week: 3, topic: "Farmacodinâmica", studentPF: 88, teamAvgPF: 82, classAvgPF: 80 },
        { week: 4, topic: "Boas Práticas", studentPF: 92, teamAvgPF: 88, classAvgPF: 82 },
        { week: 5, topic: "SNA Colinérgica", studentPF: 87, teamAvgPF: 83, classAvgPF: 79 },
        { week: 6, topic: "Bloqueadores", studentPF: 89, teamAvgPF: 84, classAvgPF: 81 },
        { week: 7, topic: "Seminários", studentPF: 91, teamAvgPF: 86, classAvgPF: 83 },
      ];
      setWeeklyData(mockData);
    }
  }, [sessionToken]);

  const chartData = {
    labels: weeklyData.map(d => `Sem ${d.week}`),
    datasets: [
      {
        label: "Seu PF",
        data: weeklyData.map(d => d.studentPF),
        borderColor: ORANGE,
        backgroundColor: `${ORANGE}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: ORANGE,
      },
      {
        label: "Média da Equipe",
        data: weeklyData.map(d => d.teamAvgPF),
        borderColor: GRAY,
        backgroundColor: `${GRAY}20`,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: GRAY,
      },
      {
        label: "Média da Turma",
        data: weeklyData.map(d => d.classAvgPF),
        borderColor: "#888",
        backgroundColor: "#88888820",
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#888",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: "#fff", font: { size: 14 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      {/* Header */}
      <div className="border-b border-gray-700 p-3 sm:p-4 md:p-5 lg:p-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-4">
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white flex items-center gap-3">
          <TrendingUp size={32} style={{ color: ORANGE }} />
          Relatório de Performance
        </h1>
        <p className="text-gray-400 mt-2">Evolução de PF por semana vs. Cronograma de Farmacologia</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-5 lg:p-6 space-y-6">
        {/* Chart */}
        <div className="rounded-lg p-6" style={{ backgroundColor: CARD_BG }}>
          <h2 className="text-lg sm:text-xl md:text-xl sm:text-2xl md:text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={24} style={{ color: ORANGE }} />
            Evolução de PF
          </h2>
          <div style={{ height: "400px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Weekly Details */}
        <div className="rounded-lg p-6" style={{ backgroundColor: CARD_BG }}>
          <h2 className="text-lg sm:text-xl md:text-xl sm:text-2xl md:text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={24} style={{ color: ORANGE }} />
            Detalhes por Semana
          </h2>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {weeklyData.map((week) => (
              <div key={week.week} className="border border-gray-600 rounded-lg p-4 hover:border-orange-400 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-white">Semana {week.week}</h3>
                    <p className="text-sm text-gray-400">{week.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl md:text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: ORANGE }}>{week.studentPF}</p>
                    <p className="text-xs text-gray-400">Seu PF</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400">Equipe</p>
                    <p className="font-semibold text-white">{week.teamAvgPF}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Turma</p>
                    <p className="font-semibold text-white">{week.classAvgPF}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Diferença</p>
                    <p className="font-semibold" style={{ color: week.studentPF >= week.teamAvgPF ? ORANGE : "#ff6b6b" }}>
                      {week.studentPF >= week.teamAvgPF ? "+" : ""}{week.studentPF - week.teamAvgPF}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          <div className="rounded-lg p-6" style={{ backgroundColor: CARD_BG }}>
            <p className="text-gray-400 text-sm mb-2">Média Geral</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: ORANGE }}>
              {(weeklyData.reduce((s, w) => s + w.studentPF, 0) / weeklyData.length).toFixed(1)}
            </p>
          </div>
          <div className="rounded-lg p-6" style={{ backgroundColor: CARD_BG }}>
            <p className="text-gray-400 text-sm mb-2">Melhor Semana</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: ORANGE }}>
              {Math.max(...weeklyData.map(w => w.studentPF))}
            </p>
          </div>
          <div className="rounded-lg p-6" style={{ backgroundColor: CARD_BG }}>
            <p className="text-gray-400 text-sm mb-2">Acima da Média</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: ORANGE }}>
              {weeklyData.filter(w => w.studentPF >= w.classAvgPF).length}/{weeklyData.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
