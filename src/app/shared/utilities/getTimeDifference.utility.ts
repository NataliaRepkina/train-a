export function getTimeDifference(startDate: Date | string, endDate: Date | string): string {
  let start = startDate;
  let end = endDate;

  if (typeof start === 'string') {
    start = new Date(start);
  }
  if (typeof end === 'string') {
    end = new Date(end);
  }

  const durationMs = end.getTime() - start.getTime();

  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${String(durationHours).padStart(2, '0')}:${String(durationMinutes).padStart(2, '0')}`;
}
