/**
 * Date/time utilities — GMT+7 (Asia/Ho_Chi_Minh) for the entire system.
 * Backend stores and returns datetimes in Vietnam time; frontend parses and displays in GMT+7.
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const TZ = 'Asia/Ho_Chi_Minh';

/**
 * Parse datetime as GMT+7. Backend sends naive Vietnam time (e.g. "2025-01-24T15:00:00").
 * @param {string|Date|dayjs.Dayjs|null|undefined} value
 * @returns {dayjs.Dayjs|null}
 */
export const parseGMT7 = (value) => {
  if (value == null || value === '') return null;
  const d = dayjs.tz(value, TZ);
  if (!d.isValid()) return null;
  return d;
};

/**
 * Format datetime for display (DD/MM/YYYY HH:mm) in GMT+7.
 * @param {string|Date|dayjs.Dayjs|null|undefined} value
 * @returns {string}
 */
export const formatDateTime = (value) => {
  const d = parseGMT7(value);
  return d ? d.format('DD/MM/YYYY HH:mm') : '';
};

/**
 * Format date only (DD/MM/YYYY) in GMT+7.
 * @param {string|Date|dayjs.Dayjs|null|undefined} value
 * @returns {string}
 */
export const formatDate = (value) => {
  const d = parseGMT7(value);
  return d ? d.format('DD/MM/YYYY') : '';
};

/**
 * Format for toLocaleString-like display with timeZone, using Intl.
 * Parses strings as GMT+7 (backend sends Vietnam time).
 * @param {string|Date|dayjs.Dayjs|null|undefined} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export const formatLocale = (value, options = {}) => {
  if (value == null) return '';
  const d = parseGMT7(value);
  if (!d) return '';
  const date = d.toDate();
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: TZ,
    ...options,
  }).format(date);
};

/**
 * Like formatLocale but for date+time (short).
 */
export const formatLocaleDateTime = (value) =>
  formatLocale(value, {
    dateStyle: 'short',
    timeStyle: 'short',
  });

/**
 * Like formatLocale but date only.
 */
export const formatLocaleDate = (value) =>
  formatLocale(value, { dateStyle: 'short' });

export { dayjs };
export default { parseGMT7, formatDateTime, formatDate, formatLocale, formatLocaleDateTime, formatLocaleDate, dayjs };
