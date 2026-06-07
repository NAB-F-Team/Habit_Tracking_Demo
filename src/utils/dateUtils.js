/**
 * Date utility functions for Habit Tracker Pro
 * Handles timezone-safe operations using YYYY-MM-DD string representation
 */

// Helper to pad numbers
const pad = (num) => String(num).padStart(2, '0');

/**
 * Returns today's date as an YYYY-MM-DD string in local time
 */
export const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Converts a Date object to YYYY-MM-DD string in local time
 */
export const formatDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Parses YYYY-MM-DD string to a local Date object at midnight (00:00:00)
 */
export const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  // Creating date using local parameters: month is 0-indexed
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

/**
 * Returns the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export const getDayOfWeek = (dateStr) => {
  const date = parseDateString(dateStr);
  return date ? date.getDay() : 0;
};

/**
 * Returns an array of the last N days (including today) as YYYY-MM-DD strings
 */
export const getRecentDates = (n = 7) => {
  const dates = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatDateString(d));
  }
  return dates;
};

/**
 * Check if the date string is in the future compared to today
 */
export const isFutureDate = (dateStr) => {
  const today = getTodayDateString();
  return dateStr > today;
};

/**
 * Check if the date is today
 */
export const isToday = (dateStr) => {
  return dateStr === getTodayDateString();
};

/**
 * Check if the date string is in the past (strictly before today)
 */
export const isPastDate = (dateStr) => {
  const today = getTodayDateString();
  return dateStr < today;
};

/**
 * Gets the Vietnamese weekday name
 */
export const getWeekdayName = (dayIndex, short = false) => {
  const names = short 
    ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    : ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return names[dayIndex];
};

/**
 * Returns a human-friendly format for date: "Hôm nay", "Hôm qua", or "Thứ X, DD/MM"
 */
export const getFriendlyDateText = (dateStr) => {
  const today = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateString(yesterdayDate);

  if (dateStr === today) return 'Hôm nay';
  if (dateStr === yesterday) return 'Hôm qua';

  const date = parseDateString(dateStr);
  if (!date) return dateStr;
  
  const dayName = getWeekdayName(date.getDay(), true);
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  return `${dayName}, ${day}/${month}`;
};

/**
 * Calculates differences in days between two YYYY-MM-DD dates
 * (date2 - date1)
 */
export const getDaysDiff = (dateStr1, dateStr2) => {
  const d1 = parseDateString(dateStr1);
  const d2 = parseDateString(dateStr2);
  const diffTime = d2 - d1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Adds N days to YYYY-MM-DD date and returns YYYY-MM-DD
 */
export const addDays = (dateStr, days) => {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateString(d);
};
