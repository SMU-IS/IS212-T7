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

export const getDatesInSameWeek = (newDate: Date, existingDates: Date[]): Date[] => {
  return existingDates.filter(existingDate => {
    const diffTime = Math.abs(newDate.getTime() - existingDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 7 && newDate.getDay() >= existingDate.getDay();
  });
};