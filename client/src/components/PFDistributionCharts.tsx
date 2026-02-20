import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const CARD_BG = "#0D1B2A";
const ORANGE = "#F7941D";

interface Stats {
  totalStudents: number;
  totalTeams: number;
  totalClasses: number;
  totalPF: number;
  averagePF: number;
}

// Skeleton loading component
function ChartSkeleton() {
  return (
    <div className="rounded-lg p-6 border border-gray-700" style={{ backgroundColor: CARD_BG }}>
      <div className="h-8 bg-gray-700 rounded mb-4 w-1/2 animate-pulse"></div>
      <div style={{ height: '300px' }} className="bg-gray-800 rounded animate-pulse"></div>
    </div>
  );
}

// Team distribution chart component
function TeamDistributionChart() {
  const teamDistributionData = {
    labels: ['Equipe 1', 'Equipe 2', 'Equipe 3', 'Equipe 4', 'Equipe 5'],
    datasets: [
      {
        label: 'PF Total por Equipe',
        data: [42.5, 38.0, 41.2, 39.8, 40.5],
        backgroundColor: [
          'rgba(247, 148, 29, 0.8)',
          'rgba(74, 144, 226, 0.8)',
          'rgba(255, 107, 107, 0.8)',
          'rgba(126, 211, 33, 0.8)',
          'rgba(80, 227, 194, 0.8)',
        ],
        borderColor: [
          'rgba(247, 148, 29, 1)',
          'rgba(74, 144, 226, 1)',
          'rgba(255, 107, 107, 1)',
          'rgba(126, 211, 33, 1)',
          'rgba(80, 227, 194, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <motion.div
      className="rounded-lg p-6 border border-gray-700"
      style={{ backgroundColor: CARD_BG }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 size={20} style={{ color: ORANGE }} />
        Distribuição de PF por Equipe
      </h3>
      <div style={{ height: '300px' }}>
        <Bar data={teamDistributionData} options={chartOptions} />
      </div>
    </motion.div>
  );
}

// Student distribution chart component
function StudentDistributionChart() {
  const studentDistributionData = {
    labels: ['0-10 PF', '10-20 PF', '20-30 PF', '30-40 PF', '40-45 PF'],
    datasets: [
      {
        label: 'Quantidade de Alunos',
        data: [5, 12, 18, 25, 15],
        backgroundColor: 'rgba(247, 148, 29, 0.8)',
        borderColor: 'rgba(247, 148, 29, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <motion.div
      className="rounded-lg p-6 border border-gray-700"
      style={{ backgroundColor: CARD_BG }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 size={20} style={{ color: ORANGE }} />
        Distribuição de PF por Aluno
      </h3>
      <div style={{ height: '300px' }}>
        <Bar data={studentDistributionData} options={chartOptions} />
      </div>
    </motion.div>
  );
}

// Main component with lazy loading
export function PFDistributionCharts({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Suspense fallback={<ChartSkeleton />}>
        <TeamDistributionChart />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <StudentDistributionChart />
      </Suspense>
    </div>
  );
}
