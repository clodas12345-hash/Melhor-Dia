import { CreditCard } from '../types';

export interface CardPaymentDetails {
  closingDay: number;
  dueDay: number;
  isEstimatedDueDay: boolean;
  isClosed: boolean;
  isBestDayToday: boolean;
  daysSinceClose: number;
  daysUntilClose: number;
  targetClosingDate: Date;
  dueDate: Date;
  daysToPay: number;
  statusText: string;
}

export function clampDayOfMonth(day: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(31, Math.max(1, Math.round(day)));
}

export function defaultDueDayFromClosing(closingDay: number): number {
  const clamped = clampDayOfMonth(closingDay);
  return ((clamped - 1 + 10) % 30) + 1;
}

export function getEffectiveDueDay(card: Pick<CreditCard, 'bestDay' | 'dueDay'>): {
  dueDay: number;
  isEstimated: boolean;
} {
  if (
    typeof card.dueDay === 'number' &&
    Number.isFinite(card.dueDay) &&
    card.dueDay >= 1 &&
    card.dueDay <= 31
  ) {
    return {
      dueDay: Math.round(card.dueDay),
      isEstimated: false,
    };
  }
  return {
    dueDay: defaultDueDayFromClosing(card.bestDay),
    isEstimated: true,
  };
}

export function makeClampedDate(year: number, monthIndex: number, dayOfMonth: number): Date {
  const monthStart = new Date(year, monthIndex, 1);
  const normalizedYear = monthStart.getFullYear();
  const normalizedMonth = monthStart.getMonth();
  const lastDayOfMonth = new Date(normalizedYear, normalizedMonth + 1, 0).getDate();
  const safeDay = Math.min(clampDayOfMonth(dayOfMonth), lastDayOfMonth);
  return new Date(normalizedYear, normalizedMonth, safeDay);
}

export function diffCalendarDays(from: Date, to: Date): number {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toUtc - fromUtc) / 86400000);
}

export function formatShortDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

export function parseQueryDateString(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const parsed = new Date(year, month, day);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getCardPaymentDetails(
  card: Pick<CreditCard, 'bestDay' | 'dueDay'>,
  purchaseDate: Date
): CardPaymentDetails {
  const year = purchaseDate.getFullYear();
  const month = purchaseDate.getMonth();
  const cleanPurchaseDate = new Date(year, month, purchaseDate.getDate());

  const closingDay = clampDayOfMonth(card.bestDay);
  const { dueDay, isEstimated } = getEffectiveDueDay(card);

  const closingInCurrentMonth = makeClampedDate(year, month, closingDay);
  const daysFromCurrentClosing = diffCalendarDays(closingInCurrentMonth, cleanPurchaseDate);

  let isClosed: boolean;
  let isBestDayToday: boolean;
  let daysSinceClose: number;
  let daysUntilClose: number;
  let targetClosingDate: Date;
  let dueDate: Date;

  if (daysFromCurrentClosing >= 0) {
    // Purchase on or after closing day goes to the next month's invoice
    isClosed = true;
    isBestDayToday = daysFromCurrentClosing === 0;
    daysSinceClose = daysFromCurrentClosing;
    targetClosingDate = makeClampedDate(year, month + 1, closingDay);
    daysUntilClose = diffCalendarDays(cleanPurchaseDate, targetClosingDate);

    // If dueDay > closingDay, due date is in the same month as targetClosingDate (month + 1)
    // Otherwise it wraps into the month after targetClosingDate (month + 2)
    const dueMonthOffset = dueDay > closingDay ? 1 : 2;
    dueDate = makeClampedDate(year, month + dueMonthOffset, dueDay);
  } else {
    // Purchase before closing day enters the currently open invoice
    isClosed = false;
    isBestDayToday = false;
    targetClosingDate = closingInCurrentMonth;
    daysUntilClose = -daysFromCurrentClosing;

    const prevClosingDate = makeClampedDate(year, month - 1, closingDay);
    daysSinceClose = diffCalendarDays(prevClosingDate, cleanPurchaseDate);

    const dueMonthOffset = dueDay > closingDay ? 0 : 1;
    dueDate = makeClampedDate(year, month + dueMonthOffset, dueDay);
  }

  const daysToPay = diffCalendarDays(cleanPurchaseDate, dueDate);
  const dueFormatted = formatShortDate(dueDate);
  const closingFormatted = formatShortDate(targetClosingDate);

  let statusText: string;
  if (isBestDayToday) {
    statusText = `🎯 Melhor dia para comprar! Fatura fecha HOJE e vence em ${dueFormatted}.`;
  } else if (isClosed) {
    statusText = `✓ Fatura fechou há ${daysSinceClose} ${daysSinceClose === 1 ? 'dia' : 'dias'}. Vencimento em ${dueFormatted}.`;
  } else {
    statusText = `⏳ Fatura fecha em ${daysUntilClose} ${daysUntilClose === 1 ? 'dia' : 'dias'} (${closingFormatted}), com vencimento em ${dueFormatted}.`;
  }

  return {
    closingDay,
    dueDay,
    isEstimatedDueDay: isEstimated,
    isClosed,
    isBestDayToday,
    daysSinceClose,
    daysUntilClose,
    targetClosingDate,
    dueDate,
    daysToPay,
    statusText,
  };
}

export function sortCardsByBestTerm(cards: CreditCard[], purchaseDate: Date): CreditCard[] {
  return [...cards].sort((a, b) => {
    const detailsA = getCardPaymentDetails(a, purchaseDate);
    const detailsB = getCardPaymentDetails(b, purchaseDate);

    if (detailsB.daysToPay !== detailsA.daysToPay) {
      return detailsB.daysToPay - detailsA.daysToPay;
    }
    if (detailsA.daysSinceClose !== detailsB.daysSinceClose) {
      return detailsA.daysSinceClose - detailsB.daysSinceClose;
    }
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}
