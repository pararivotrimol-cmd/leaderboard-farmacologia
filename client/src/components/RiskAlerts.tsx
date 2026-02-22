import { AlertTriangle, TrendingDown, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RiskStudent {
  id: string;
  name: string;
  currentPF: number;
  averagePF: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface RiskAlertsProps {
  students: RiskStudent[];
  classAverage: number;
}

export function RiskAlerts({ students, classAverage }: RiskAlertsProps) {
  if (!students || students.length === 0) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className="text-green-600">✓</div>
          <div>
            <h3 className="font-semibold text-green-900">Nenhum aluno em risco</h3>
            <p className="text-sm text-green-700">Todos os alunos estão com desempenho acima da média</p>
          </div>
        </div>
      </Card>
    );
  }

  const riskCounts = {
    high: students.filter(s => s.riskLevel === 'high').length,
    medium: students.filter(s => s.riskLevel === 'medium').length,
    low: students.filter(s => s.riskLevel === 'low').length,
  };

  return (
    <div className="space-y-4">
      {/* Resumo de Riscos */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{riskCounts.high}</div>
            <div className="text-xs text-red-700">Alto Risco</div>
          </div>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{riskCounts.medium}</div>
            <div className="text-xs text-yellow-700">Médio Risco</div>
          </div>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{riskCounts.low}</div>
            <div className="text-xs text-orange-700">Baixo Risco</div>
          </div>
        </Card>
      </div>

      {/* Lista de Alunos em Risco */}
      <div className="space-y-3">
        {students.map(student => (
          <Card key={student.id} className="p-4 border-l-4" style={{
            borderLeftColor: student.riskLevel === 'high' ? '#dc2626' : student.riskLevel === 'medium' ? '#eab308' : '#f97316'
          }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className={
                    student.riskLevel === 'high' ? 'text-red-600' :
                    student.riskLevel === 'medium' ? 'text-yellow-600' :
                    'text-orange-600'
                  } />
                  <h4 className="font-semibold text-gray-900">{student.name}</h4>
                  <Badge variant={
                    student.riskLevel === 'high' ? 'destructive' :
                    student.riskLevel === 'medium' ? 'secondary' :
                    'outline'
                  }>
                    {student.riskLevel === 'high' ? 'Alto Risco' :
                     student.riskLevel === 'medium' ? 'Médio Risco' :
                     'Baixo Risco'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-600">PF Atual:</span>
                    <div className="font-semibold text-gray-900">{student.currentPF}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Média da Turma:</span>
                    <div className="font-semibold text-gray-900">{classAverage.toFixed(1)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Diferença:</span>
                    <div className="font-semibold text-red-600">
                      <TrendingDown size={16} className="inline mr-1" />
                      {(student.currentPF - classAverage).toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-gray-50 p-3 rounded">
                  <MessageSquare size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{student.recommendation}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
