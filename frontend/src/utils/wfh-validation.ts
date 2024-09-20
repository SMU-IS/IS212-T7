import { FormData } from '../pages/wfh-application/types';
import { isWeekday, isAtLeast24HoursAhead } from './wfh-dateUtils';

export const validateForm = (formData: FormData): string | null => {
  if (formData.wfhDates.length === 0) {
    return 'Please select at least one date.';
  }

  for (const wfhDate of formData.wfhDates) {
    if (!isWeekday(wfhDate.date)) {
      return 'Please select only weekdays.';
    }
    if (!isAtLeast24HoursAhead(wfhDate.date)) {
      return 'You can only apply for dates at least 24 hours in advance.';
    }
  }

  if (formData.reason.trim() === '') {
    return 'Please provide a reason for your WFH request.';
  }

  return null;
};