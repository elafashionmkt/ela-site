export type ViewState = 'landing' | 'login' | 'client-dashboard';
export type ClientTab = 'retrospective' | 'reports' | 'calendar' | 'social' | 'material' | 'alignment';

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

export interface CalendarEvent {
  day: number;
  tags: { label: string; color: string }[];
  note?: string;
  isToday?: boolean;
}