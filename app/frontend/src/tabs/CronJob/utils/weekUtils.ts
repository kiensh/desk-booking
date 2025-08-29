import { BookingResult } from '../../../types';
import { formatDate } from './dateUtils';

export const groupResultsByWeek = (
  results: BookingResult[], 
  padWeekTo5Days: (week: BookingResult[]) => BookingResult[]
) => {
  const weeks: BookingResult[][] = [];
  let currentWeek: BookingResult[] = [];
  
  results.forEach((result) => {
    const date = new Date(result.date);
    const isSaturday = date.getDay() === 6;
    const isSunday = date.getDay() === 0;

    if (isSaturday || isSunday) {
      return;
    }

    const isMonday = date.getDay() === 1;
    if (isMonday && currentWeek.length > 0) {
      weeks.push(padWeekTo5Days(currentWeek));
      currentWeek = [result];
    } else {
      currentWeek.push(result);
    }
  });
  
  if (currentWeek.length > 0) {
    weeks.push(padWeekTo5Days(currentWeek));
  }
  
  return weeks;
};

export const padWeekTo5Days = (week: BookingResult[]): BookingResult[] => {
  if (week.length === 0) return week;
  
  const firstDate = new Date(week[0].date);
  const firstDayOfWeek = firstDate.getDay();
  
  const paddedWeek: BookingResult[] = [];
  for (let day = 1; day < firstDayOfWeek; day++) {
    const paddingDate = new Date(firstDate);
    paddingDate.setDate(firstDate.getDate() - (firstDayOfWeek - day));
    paddedWeek.push({ 
      date: formatDate(paddingDate), 
      status: '' as any, 
      description: '' 
    });
  }
  paddedWeek.push(...week);
  
  const lastDate = new Date(week[week.length - 1].date);
  let dayOffset = 1;
  while (paddedWeek.length < 5) {
    const paddingDate = new Date(lastDate);
    paddingDate.setDate(lastDate.getDate() + dayOffset);
    paddedWeek.push({ 
      date: formatDate(paddingDate), 
      status: '' as any, 
      description: '' 
    });
    dayOffset++;
  }
  
  return paddedWeek;
};