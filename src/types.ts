export interface CreditCard {
  id: string;
  name: string;
  segment?: string;
  bestDay: number;
  dueDay?: number;
  customLogo?: string;
}

export interface NotificationScheduleSlot {
  id: number;
  time: string;
  enabled: boolean;
}
