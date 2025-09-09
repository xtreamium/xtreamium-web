import { DateTime } from "luxon";

export const convertEpochToSpecificTimezone = (
  timeEpoch: number,
  offset: number = 0
) => {
  const d = new Date(timeEpoch * 1000);
  const utc = d.getTime() + d.getTimezoneOffset() * 60000; //This converts to UTC 00:00
  const nd = new Date(utc + 3600000 * offset);
  return nd.toLocaleDateString();
};

export const roundDateDown = (
  date: Date,
  intervalMilliseconds: number
): Date => {
  const modTicks = date.getTime() % intervalMilliseconds;
  const delta = modTicks === 0 ? 0 : date.getTime() - modTicks;
  return new Date(delta);
};

export const roundToNextHour = (date: Date): Date => {
  date.setHours(date.getHours() + 1);
  date.setMinutes(0, 0, 0);
  date.setSeconds(0);

  return date;
};

export const convertUTCToLocal = (date: Date): Date => {
  const localOffset = date.getTimezoneOffset() * 60000;
  const localTime = date.getTime();

  return new Date(localTime - localOffset);
};
export const convertLocalToUTC = (date: Date): Date => {
  const localOffset = date.getTimezoneOffset() * 60000;
  const localTime = date.getTime();
  return new Date(localTime + localOffset);
};

export const dateToTimeString = (date: Date): string => {
  const dt = DateTime.fromJSDate(date);
  return dt.toLocaleString(DateTime.TIME_24_SIMPLE);
};
