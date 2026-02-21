/**
 * Algoritmos de rebalanceamento automático de grupos Jigsaw
 * Suporta múltiplas estratégias: tamanho, especialidades, desempenho
 */

export type RebalancingStrategy = "size" | "specialties" | "performance";

export interface Member {
  id: number;
  name: string;
  xp?: number;
  specialty?: string;
}

export interface JigsawGroup {
  id: number;
  name: string;
  members: Member[];
}

export interface RebalancingPlan {
  strategy: RebalancingStrategy;
  moves: Array<{
    memberId: number;
    memberName: string;
    fromGroupId: number;
    fromGroupName: string;
    toGroupId: number;
    toGroupName: string;
    reason: string;
  }>;
  statistics: {
    totalMoves: number;
    groupSizesBefore: Record<number, number>;
    groupSizesAfter: Record<number, number>;
    avgGroupSize: number;
    balanceImprovement: number;
  };
}

/**
 * Rebalancear grupos por tamanho
 * Distribui alunos igualmente entre grupos
 */
export function rebalanceBySize(groups: JigsawGroup[]): RebalancingPlan {
  const moves: RebalancingPlan["moves"] = [];
  const groupSizesBefore: Record<number, number> = {};
  
  // Registrar tamanhos iniciais
  groups.forEach(g => {
    groupSizesBefore[g.id] = g.members.length;
  });

  // Coletar todos os membros
  const allMembers: Array<Member & { currentGroupId: number }> = [];
  groups.forEach(group => {
    group.members.forEach(member => {
      allMembers.push({ ...member, currentGroupId: group.id });
    });
  });

  // Calcular tamanho ideal
  const idealSize = Math.ceil(allMembers.length / groups.length);
  const groupsWithCapacity = groups.map(g => ({
    ...g,
    capacity: idealSize,
    currentSize: g.members.length,
  }));

  // Distribuir membros
  const newAssignments: Record<number, Member[]> = {};
  groups.forEach(g => {
    newAssignments[g.id] = [];
  });

  // Primeiro, manter membros em seus grupos atuais até atingir capacidade
  groupsWithCapacity.forEach(group => {
    const membersToKeep = group.members.slice(0, group.capacity);
    newAssignments[group.id] = membersToKeep;
  });

  // Coletar membros que precisam ser realocados
  const membersToRelocate: Array<Member & { currentGroupId: number }> = [];
  groupsWithCapacity.forEach(group => {
    const membersToRemove = group.members.slice(group.capacity);
    membersToRemove.forEach(member => {
      membersToRelocate.push({ ...member, currentGroupId: group.id });
    });
  });

  // Alocar membros realocados em grupos com espaço
  let relocateIndex = 0;
  for (const group of groupsWithCapacity) {
    while (
      newAssignments[group.id].length < group.capacity &&
      relocateIndex < membersToRelocate.length
    ) {
      const member = membersToRelocate[relocateIndex];
      if (member.currentGroupId !== group.id) {
        newAssignments[group.id].push(member);
        moves.push({
          memberId: member.id,
          memberName: member.name,
          fromGroupId: member.currentGroupId,
          fromGroupName:
            groups.find(g => g.id === member.currentGroupId)?.name || "Unknown",
          toGroupId: group.id,
          toGroupName: group.name,
          reason: `Rebalanceamento por tamanho (tamanho ideal: ${idealSize})`,
        });
      }
      relocateIndex++;
    }
  }

  // Calcular estatísticas
  const groupSizesAfter: Record<number, number> = {};
  Object.entries(newAssignments).forEach(([groupId, members]) => {
    groupSizesAfter[parseInt(groupId)] = members.length;
  });

  const balanceBefore = calculateBalance(groupSizesBefore);
  const balanceAfter = calculateBalance(groupSizesAfter);

  return {
    strategy: "size",
    moves,
    statistics: {
      totalMoves: moves.length,
      groupSizesBefore,
      groupSizesAfter,
      avgGroupSize: allMembers.length / groups.length,
      balanceImprovement: balanceBefore - balanceAfter,
    },
  };
}

/**
 * Rebalancear grupos por especialidades
 * Garante que cada grupo tenha membros de diferentes especialidades
 */
export function rebalanceBySpecialties(
  groups: JigsawGroup[]
): RebalancingPlan {
  const moves: RebalancingPlan["moves"] = [];
  const groupSizesBefore: Record<number, number> = {};

  groups.forEach(g => {
    groupSizesBefore[g.id] = g.members.length;
  });

  // Coletar membros por especialidade
  const membersBySpecialty: Record<string, Array<Member & { currentGroupId: number }>> = {};
  groups.forEach(group => {
    group.members.forEach(member => {
      const specialty = member.specialty || "unknown";
      if (!membersBySpecialty[specialty]) {
        membersBySpecialty[specialty] = [];
      }
      membersBySpecialty[specialty].push({ ...member, currentGroupId: group.id });
    });
  });

  // Distribuir membros de cada especialidade entre grupos
  const newAssignments: Record<number, Member[]> = {};
  groups.forEach(g => {
    newAssignments[g.id] = [];
  });

  Object.entries(membersBySpecialty).forEach(([specialty, members]) => {
    let groupIndex = 0;
    members.forEach(member => {
      const targetGroup = groups[groupIndex % groups.length];
      newAssignments[targetGroup.id].push(member);

      if (member.currentGroupId !== targetGroup.id) {
        moves.push({
          memberId: member.id,
          memberName: member.name,
          fromGroupId: member.currentGroupId,
          fromGroupName:
            groups.find(g => g.id === member.currentGroupId)?.name || "Unknown",
          toGroupId: targetGroup.id,
          toGroupName: targetGroup.name,
          reason: `Distribuição de especialidade: ${specialty}`,
        });
      }

      groupIndex++;
    });
  });

  const groupSizesAfter: Record<number, number> = {};
  Object.entries(newAssignments).forEach(([groupId, members]) => {
    groupSizesAfter[parseInt(groupId)] = members.length;
  });

  const allMembers = Object.values(membersBySpecialty).flat();
  const balanceBefore = calculateBalance(groupSizesBefore);
  const balanceAfter = calculateBalance(groupSizesAfter);

  return {
    strategy: "specialties",
    moves,
    statistics: {
      totalMoves: moves.length,
      groupSizesBefore,
      groupSizesAfter,
      avgGroupSize: allMembers.length / groups.length,
      balanceImprovement: balanceBefore - balanceAfter,
    },
  };
}

/**
 * Rebalancear grupos por desempenho (XP)
 * Distribui alunos para balancear XP total dos grupos
 */
export function rebalanceByPerformance(
  groups: JigsawGroup[]
): RebalancingPlan {
  const moves: RebalancingPlan["moves"] = [];
  const groupSizesBefore: Record<number, number> = {};

  groups.forEach(g => {
    groupSizesBefore[g.id] = g.members.length;
  });

  // Coletar todos os membros com XP
  const allMembers: Array<Member & { currentGroupId: number }> = [];
  groups.forEach(group => {
    group.members.forEach(member => {
      allMembers.push({ ...member, currentGroupId: group.id });
    });
  });

  // Ordenar membros por XP (decrescente)
  const sortedMembers = [...allMembers].sort((a, b) => (b.xp || 0) - (a.xp || 0));

  // Distribuir membros em round-robin para balancear XP
  const newAssignments: Record<number, Member[]> = {};
  const groupXpTotals: Record<number, number> = {};

  groups.forEach(g => {
    newAssignments[g.id] = [];
    groupXpTotals[g.id] = 0;
  });

  // Distribuir em round-robin
  sortedMembers.forEach((member, index) => {
    const targetGroup = groups[index % groups.length];
    newAssignments[targetGroup.id].push(member);
    groupXpTotals[targetGroup.id] += member.xp || 0;

    if (member.currentGroupId !== targetGroup.id) {
      moves.push({
        memberId: member.id,
        memberName: member.name,
        fromGroupId: member.currentGroupId,
        fromGroupName:
          groups.find(g => g.id === member.currentGroupId)?.name || "Unknown",
        toGroupId: targetGroup.id,
        toGroupName: targetGroup.name,
        reason: `Balanceamento de desempenho (XP: ${member.xp || 0})`,
      });
    }
  });

  const groupSizesAfter: Record<number, number> = {};
  Object.entries(newAssignments).forEach(([groupId, members]) => {
    groupSizesAfter[parseInt(groupId)] = members.length;
  });

  const balanceBefore = calculateBalance(groupSizesBefore);
  const balanceAfter = calculateBalance(groupSizesAfter);

  return {
    strategy: "performance",
    moves,
    statistics: {
      totalMoves: moves.length,
      groupSizesBefore,
      groupSizesAfter,
      avgGroupSize: allMembers.length / groups.length,
      balanceImprovement: balanceBefore - balanceAfter,
    },
  };
}

/**
 * Calcular métrica de balanceamento (desvio padrão dos tamanhos)
 * Quanto menor, melhor balanceado
 */
function calculateBalance(groupSizes: Record<number, number>): number {
  const sizes = Object.values(groupSizes);
  if (sizes.length === 0) return 0;

  const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const variance =
    sizes.reduce((sum, size) => sum + Math.pow(size - mean, 2), 0) /
    sizes.length;
  return Math.sqrt(variance);
}

/**
 * Validar se um plano de rebalanceamento é seguro
 */
export function validateRebalancingPlan(plan: RebalancingPlan): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Verificar se há movimentos
  if (plan.moves.length === 0) {
    errors.push("Nenhum movimento necessário - grupos já estão balanceados");
  }

  // Verificar se os tamanhos dos grupos são razoáveis
  const sizesAfter = Object.values(plan.statistics.groupSizesAfter);
  const maxSize = Math.max(...sizesAfter);
  const minSize = Math.min(...sizesAfter);

  if (maxSize - minSize > 2) {
    errors.push(
      `Diferença de tamanho muito grande: máx ${maxSize}, mín ${minSize}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
