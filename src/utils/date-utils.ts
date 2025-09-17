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

// 30-minute interval utilities for EPG
export const THIRTY_MINUTES_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

export const getPrevious30MinuteBoundary = (timestamp: number): number => {
  const date = new Date(timestamp);
  const minutes = date.getMinutes();
  const roundedMinutes = minutes < 30 ? 0 : 30;
  
  const boundary = new Date(date);
  boundary.setMinutes(roundedMinutes, 0, 0);
  
  return boundary.getTime();
};

export const getNext30MinuteBoundary = (timestamp: number): number => {
  const current = getPrevious30MinuteBoundary(timestamp);
  return current + THIRTY_MINUTES_MS;
};

export const calculateTimelineWidth = (
  startTime: number,
  endTime: number,
  intervalWidth: number = 120 // pixels per 30-minute interval
): number => {
  const duration = endTime - startTime;
  const intervals = duration / THIRTY_MINUTES_MS;
  return Math.max(20, intervals * intervalWidth); // minimum 20px width
};

export const generate30MinuteIntervals = (
  startBoundary: number,
  totalDurationMs: number
): number[] => {
  const intervals: number[] = [];
  let current = startBoundary;
  const end = startBoundary + totalDurationMs;
  
  while (current < end) {
    intervals.push(current);
    current += THIRTY_MINUTES_MS;
  }
  
  return intervals;
};
