export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // Use 12-hour format
    timeZone: "Africa/Nairobi", // Set to Nairobi timezone
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}
