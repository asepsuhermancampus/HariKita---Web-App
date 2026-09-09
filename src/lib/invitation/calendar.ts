export interface CalendarEventDetails {
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO string e.g. "2026-11-20T08:00:00Z"
  endDate: string; // ISO string e.g. "2026-11-20T10:00:00Z"
}

export function formatIcsDate(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const mins = pad(d.getUTCMinutes());
  const secs = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hours}${mins}${secs}Z`;
}

export function generateGoogleCalendarUrl(event: CalendarEventDetails): string {
  const start = formatIcsDate(event.startDate);
  const end = formatIcsDate(event.endDate);
  const dates = `${start}/${end}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: dates,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsContent(event: CalendarEventDetails): string {
  const start = formatIcsDate(event.startDate);
  const end = formatIcsDate(event.endDate);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HariKita Kebumen//Invitation Calendar//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
