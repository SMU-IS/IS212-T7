export const isWeekday = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

export const isAtLeast24HoursAhead = (date: Date): boolean => {
  const now = new Date();
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return date >= twentyFourHoursLater;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// revised function to check >2 dates in same week 
// Function to get the start of the week (Sunday) for a given date
const getStartOfWeek = (date: Date): Date => {
  const dateCopy = new Date(date);
  const day = dateCopy.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diff = dateCopy.getDate() - day; // ahead/back to Sunday
  return new Date(dateCopy.setDate(diff));
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
    return existingDate >= startOfWeek && existingDate <= endOfWeek;
  });
};

