export const hrTimeToMicroseconds = ([seconds, nanoseconds]: [number, number]): number => {
  return seconds * 1e6 + nanoseconds / 1e3;
}
