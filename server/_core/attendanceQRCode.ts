/**
 * Sistema de QR Code para Presença
 * Gera tokens únicos para cada aula que alunos podem escanear
 */

import crypto from "crypto";

export interface QRCodeData {
  token: string;
  classDate: string;
  classId: number;
  expiresAt: number;
  createdAt: number;
}

export interface AttendanceCheckIn {
  memberId: number;
  classDate: string;
  classId: number;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
}

/**
 * Gerar token único para QR code
 * Token inclui: data da aula, ID da turma, timestamp, hash aleatório
 */
export function generateQRCodeToken(classId: number, classDate: string): QRCodeData {
  const now = Date.now();
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const dataToHash = `${classId}:${classDate}:${now}:${randomBytes}`;
  const token = crypto.createHash("sha256").update(dataToHash).digest("hex");

  // Token expira em 4 horas (suficiente para uma aula)
  const expiresAt = now + 4 * 60 * 60 * 1000;

  return {
    token,
    classDate,
    classId,
    expiresAt,
    createdAt: now,
  };
}

/**
 * Validar token de QR code
 * Verifica se o token é válido e não expirou
 */
export function validateQRCodeToken(
  token: string,
  storedTokenData: QRCodeData
): {
  valid: boolean;
  error?: string;
} {
  const now = Date.now();

  // Verificar se o token corresponde
  if (token !== storedTokenData.token) {
    return { valid: false, error: "Token inválido" };
  }

  // Verificar se expirou
  if (now > storedTokenData.expiresAt) {
    return { valid: false, error: "QR code expirado" };
  }

  return { valid: true };
}

/**
 * Calcular distância entre dois pontos (Haversine formula)
 * Retorna distância em metros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Validar se o aluno está dentro do raio permitido da sala
 * Sala: Frei Caneca 94, sala D201 (aprox. -23.5505, -46.6333)
 * Raio permitido: 100 metros
 */
export function isWithinClassroomRadius(
  latitude: number,
  longitude: number,
  maxDistanceMeters: number = 100
): {
  valid: boolean;
  distanceMeters: number;
} {
  // Coordenadas da sala D201 (Frei Caneca 94)
  const classroomLat = -23.5505;
  const classroomLon = -46.6333;

  const distance = calculateDistance(
    classroomLat,
    classroomLon,
    latitude,
    longitude
  );

  return {
    valid: distance <= maxDistanceMeters,
    distanceMeters: Math.round(distance),
  };
}

/**
 * Validar horário de aula
 * Turma: Terça de 8h às 12h
 */
export function isWithinClassHours(date: Date): {
  valid: boolean;
  error?: string;
} {
  const dayOfWeek = date.getDay(); // 0 = domingo, 2 = terça
  const hours = date.getHours();

  // Verificar se é terça-feira
  if (dayOfWeek !== 2) {
    return { valid: false, error: "Presença só é permitida nas terças-feiras" };
  }

  // Verificar se está entre 8h e 12h
  if (hours < 8 || hours >= 12) {
    return {
      valid: false,
      error: "Presença só é permitida entre 8h e 12h",
    };
  }

  return { valid: true };
}

/**
 * Gerar QR code em formato de URL
 * Usa a API do QR Server para gerar a imagem
 */
export function generateQRCodeImageUrl(token: string, classDate: string): string {
  const data = JSON.stringify({ token, classDate });
  const encoded = Buffer.from(data).toString("base64");
  // Usar QR Server API (gratuita)
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(encoded)}`;
}

/**
 * Decodificar dados do QR code
 */
export function decodeQRCodeData(encodedData: string): {
  token: string;
  classDate: string;
} {
  try {
    const decoded = Buffer.from(encodedData, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error("Dados de QR code inválidos");
  }
}
