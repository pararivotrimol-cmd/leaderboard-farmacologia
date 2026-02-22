import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface EvolutionDataPoint {
  week: number;
  average: number;
  max: number;
  min: number;
}

interface EvolutionChartProps {
  data: EvolutionDataPoint[];
  title?: string;
  height?: number;
}

export function EvolutionChart({ data, title = 'Evolução de PF por Semana', height = 300 }: EvolutionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    // Destruir gráfico anterior se existir
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const weeks = data.map(d => `Semana ${d.week}`);
    const averages = data.map(d => d.average);
    const maxes = data.map(d => d.max);
    const mins = data.map(d => d.min);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [
          {
            label: 'Média',
            data: averages,
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Máximo',
            data: maxes,
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Mínimo',
            data: mins,
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Pontos de Farmacologia (PF)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Semana',
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, title]);

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
