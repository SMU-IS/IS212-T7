export type TimeOfDay = 'AM' | 'PM' | 'Full Day';

export interface WFHDate {
  date: Date;
  timeOfDay: TimeOfDay;
}

export interface FormData {
  wfhDates: WFHDate[];
  reason: string;
}