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
export const isValidWFHDeadline = (selectedDate: Date) : boolean => {
  const now = getSGTDate(new Date());
  const selectedSGTDate = getSGTDate(selectedDate);
  const todayDay = now.getDay();
  const selectedDay = selectedSGTDate.getDay();

    // if app date is Saturday or Sunday, the earliest day you can apply for is Wednesday.
    if ((todayDay === 6 || todayDay === 0) && selectedDay <= 3) {  // Saturday (6) or Sunday (0)
      return false;
    }

  // if selected wfh day is Friday, deadline is wednesday or earlier
  if (selectedDay === 5 && todayDay >=4){
    return false;
  }

  // if selected day is monday, deadline is thursday
  if (selectedDay === 1 && todayDay >=5){
    return false;
  }

  return true;
}

