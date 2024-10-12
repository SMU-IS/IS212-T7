import moment from 'moment-timezone';

export const getSGTDate = (date: Date): Date => {
  return moment(date).tz('Asia/Singapore').toDate()
}

export const isWeekday = (date: Date): boolean => {
  const sgtDate = getSGTDate(date);
  const day = sgtDate.getDay();
  return day !== 0 && day !== 6;
};

export const isAtLeast24HoursAhead = (date: Date): boolean => {
  const now = getSGTDate(new Date());
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return getSGTDate(date) >= twentyFourHoursLater;
};

export const formatDate = (date: Date): string => {
  return moment(date).tz('Asia/Singapore').format('ddd, MMM D, YYYY');
  };


// Function to get the start of the week (Sunday) for a given date
const getStartOfWeek = (date: Date): Date => {
  const sgtDate = getSGTDate(date);
  const day = sgtDate.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diff = sgtDate.getDate() - day; // ahead/back to Sunday
  return new Date(sgtDate.setDate(diff));
};

// Function to get the end of the week (Saturday) for a given date
const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(date);
  return new Date(startOfWeek.setDate(startOfWeek.getDate() + 6));
};

export const getDatesInSameWeek = (newDate: Date, existingDates: Date[]): Date[] => {
  const startOfWeek = getStartOfWeek(newDate);
  const endOfWeek = getEndOfWeek(newDate);

  return existingDates.filter(existingDate => {
    const sgtExistingDate = getSGTDate(existingDate);
    return sgtExistingDate >= startOfWeek && existingDate <= endOfWeek;
  });
};

// check if wfh application is valid (based takes into account weekends)
// specific deadlines for friday & weekends
export const isValidWFHDeadline = (selectedDate: Date): boolean => {
  const now = getSGTDate(new Date());
  const selectedSGTDate = getSGTDate(selectedDate);

  const diffTime = selectedSGTDate.getTime() - now.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);

  // if the selected date is not at least 24 hours ahead, it's invalid
  if (diffHours < 24) {
    return false;
  }

  const todayDay = now.getDay();
  const daysUntilSelected = diffTime / (1000 * 60 * 60 * 24);

  // apply the 3-day rule only if today is Friday (i.e. only can apply nxt tues onws)
  if (todayDay === 5 && daysUntilSelected < 3) {
    return false; 
  }

  // sat sun apps (i.e. only can apply nxt wed onws)
  if (todayDay === 6 || todayDay === 0) { 
    const nextWednesday = new Date(now);
    nextWednesday.setDate(now.getDate() + (3 - todayDay + 7) % 7); // calculate next Wednesday
    return selectedSGTDate >= nextWednesday; // must be at least next Wednesday
  }

  // allow applications for Monday to Thursday as long as they are at least 24 hours ahead
  return true; };