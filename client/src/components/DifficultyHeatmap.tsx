import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface DifficultyData {
  questionId: string;
  title: string;
  errorRate: number; // 0-100
}

interface DifficultyHeatmapProps {
  data: DifficultyData[];
  title?: string;
  height?: number;
}

export function DifficultyHeatmap({ data, title = 'Taxa de Erro por Questão', height = 300 }: DifficultyHeatmapProps) {
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

    // Ordenar por taxa de erro (decrescente)
    const sortedData = [...data].sort((a, b) => b.errorRate - a.errorRate);

    const labels = sortedData.map(d => d.title.substring(0, 20));
    const errorRates = sortedData.map(d => d.errorRate);

    // Definir cores baseado na taxa de erro
    const colors = errorRates.map(rate => {
      if (rate >= 70) return 'rgba(239, 68, 68, 0.8)'; // Vermelho - muito difícil
      if (rate >= 50) return 'rgba(249, 115, 22, 0.8)'; // Laranja - difícil
      if (rate >= 30) return 'rgba(234, 179, 8, 0.8)'; // Amarelo - moderado
      return 'rgba(34, 197, 94, 0.8)'; // Verde - fácil
    });

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Taxa de Erro (%)',
            data: errorRates,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('0.8', '1')),
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Taxa de Erro (%)',
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
