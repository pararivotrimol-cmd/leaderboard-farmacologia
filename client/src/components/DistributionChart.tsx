import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface DistributionChartProps {
  data: number[];
  title?: string;
  height?: number;
}

export function DistributionChart({ data, title = 'Distribuição de PF', height = 300 }: DistributionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    // Calcular bins para o histograma
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binCount = 10;
    const binSize = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const labels: string[] = [];

    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      labels.push(`${Math.round(binStart)}-${Math.round(binEnd)}`);

      data.forEach(value => {
        if (value >= binStart && value < binEnd) {
          bins[i]++;
        }
      });
    }

    // Destruir gráfico anterior se existir
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Quantidade de Alunos',
            data: bins,
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
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
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantidade de Alunos',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Faixa de PF',
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
