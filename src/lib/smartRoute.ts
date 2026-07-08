import { Cliente, Parcela } from '../types';

export type RouteStopPriority = 'alta' | 'media' | 'normal';
export type RouteStopAction = 'COBRAR_ATRASO' | 'RECEBER_PARCELA' | 'REVISITAR' | 'SINCRONIZAR';

export interface RouteStop {
  id: string;
  parcela: Parcela;
  cliente: Cliente;
  order: number;
  distanceKm: number;
  cumulativeKm: number;
  etaMinutes: number;
  action: RouteStopAction;
  actionLabel: string;
  priority: RouteStopPriority;
  mapX: number;
  mapY: number;
}

const ORIGIN = { lat: -23.5505, lng: -46.6333 };
const AVG_SPEED_KMH = 28;

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function priorityScore(parcela: Parcela): number {
  const today = new Date();
  const due = new Date(parcela.dataVencimento);
  const daysLate = Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000));
  if (parcela.status === 'Atrasada') return 1000 + daysLate * 10;
  if (parcela.status === 'Pendente' && daysLate > 0) return 500 + daysLate * 5;
  return 100 - daysLate;
}

function getAction(parcela: Parcela): { action: RouteStopAction; label: string; priority: RouteStopPriority } {
  if (parcela.syncPending) {
    return { action: 'SINCRONIZAR', label: 'Sincronizar baixa pendente', priority: 'media' };
  }
  if (parcela.status === 'Atrasada') {
    return { action: 'COBRAR_ATRASO', label: 'Cobrar parcela em atraso', priority: 'alta' };
  }
  if (parcela.status === 'Pendente') {
    const due = new Date(parcela.dataVencimento);
    const isLate = due < new Date();
    return {
      action: 'RECEBER_PARCELA',
      label: isLate ? 'Receber parcela vencida' : 'Registrar recebimento',
      priority: isLate ? 'alta' : 'media',
    };
  }
  return { action: 'REVISITAR', label: 'Revisitar cliente', priority: 'normal' };
}

function coordsForCliente(cliente: Cliente, index: number) {
  if (cliente.coordenadasGps) return cliente.coordenadasGps;
  const hash = cliente.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    lat: -23.55 + ((hash % 40) - 20) * 0.008,
    lng: -46.64 + ((hash % 30) - 15) * 0.008,
  };
}

function toMapPercent(lat: number, lng: number) {
  const x = ((lng + 46.68) / 0.08) * 100;
  const y = ((lat + 23.58) / 0.08) * 100;
  return {
    x: Math.min(94, Math.max(6, x)),
    y: Math.min(94, Math.max(6, 100 - y)),
  };
}

export function buildSmartRoute(parcelas: Parcela[], clientes: Cliente[]): RouteStop[] {
  const pending = parcelas.filter((p) => p.status !== 'Paga' || p.syncPending);
  if (pending.length === 0) return [];

  type Candidate = {
    parcela: Parcela;
    cliente: Cliente;
    coords: { lat: number; lng: number };
    score: number;
  };

  const candidates: Candidate[] = pending
    .map((parcela, i) => {
      const cliente = clientes.find((c) => c.id === parcela.clienteId);
      if (!cliente) return null;
      return {
        parcela,
        cliente,
        coords: coordsForCliente(cliente, i),
        score: priorityScore(parcela),
      };
    })
    .filter((c): c is Candidate => c !== null)
    .sort((a, b) => b.score - a.score);

  const ordered: Candidate[] = [];
  const remaining = [...candidates];
  let cursor = ORIGIN;

  while (remaining.length > 0) {
    remaining.sort((a, b) => {
      const distA = haversineKm(cursor, a.coords);
      const distB = haversineKm(cursor, b.coords);
      return distA + (1000 - a.score) * 0.001 - (distB + (1000 - b.score) * 0.001);
    });
    const next = remaining.shift()!;
    ordered.push(next);
    cursor = next.coords;
  }

  let cumulative = 0;
  let prev = ORIGIN;

  return ordered.map((item, index) => {
    const dist = haversineKm(prev, item.coords);
    cumulative += dist;
    prev = item.coords;
    const { action, label, priority } = getAction(item.parcela);
    const map = toMapPercent(item.coords.lat, item.coords.lng);

    return {
      id: item.parcela.id,
      parcela: item.parcela,
      cliente: item.cliente,
      order: index + 1,
      distanceKm: Number(dist.toFixed(1)),
      cumulativeKm: Number(cumulative.toFixed(1)),
      etaMinutes: Math.max(3, Math.round((dist / AVG_SPEED_KMH) * 60)),
      action,
      actionLabel: label,
      priority,
      mapX: map.x,
      mapY: map.y,
    };
  });
}

export function routeSummary(stops: RouteStop[]) {
  const totalKm = stops.length > 0 ? stops[stops.length - 1].cumulativeKm : 0;
  const totalEta = stops.reduce((s, st) => s + st.etaMinutes, 0);
  const totalValue = stops.reduce((s, st) => s + st.parcela.valorOriginal, 0);
  const alta = stops.filter((s) => s.priority === 'alta').length;
  return { totalKm, totalEta, totalValue, stopCount: stops.length, alta };
}