import { test } from "node:test";
import assert from "node:assert/strict";
import { generateGoogleCalendarUrl, generateIcsContent } from "../src/lib/invitation/calendar";

test("generateGoogleCalendarUrl creates valid Google Calendar intent URL", () => {
  const url = generateGoogleCalendarUrl({
    title: "Akad Nikah Bima & Citra",
    description: "Undangan Pernikahan Bima Arya Pratama & Citra Ayu Lestari di HariKita Kebumen",
    location: "Gedung Pertemuan Setda Kebumen, Jl. Veteran No. 2",
    startDate: "2026-11-20T08:00:00Z",
    endDate: "2026-11-20T10:00:00Z",
  });

  assert.ok(url.startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE"));
  assert.ok(url.includes("text=Akad+Nikah+Bima+%26+Citra") || url.includes("text=Akad%20Nikah%20Bima%20%26%20Citra"));
  assert.ok(url.includes("dates=20261120T080000Z%2F20261120T100000Z") || url.includes("dates=20261120T080000Z/20261120T100000Z"));
  assert.ok(url.includes("location=Gedung+Pertemuan+Setda+Kebumen") || url.includes("location=Gedung%20Pertemuan%20Setda%20Kebumen"));
});

test("generateIcsContent creates valid iCal .ics event payload", () => {
  const ics = generateIcsContent({
    title: "Resepsi Siang Bima & Citra",
    description: "Hari Bahagia Pernikahan Bima & Citra di Kebumen",
    location: "Mexolie Hotel Kebumen",
    startDate: "2026-11-20T11:00:00Z",
    endDate: "2026-11-20T14:00:00Z",
  });

  assert.ok(ics.includes("BEGIN:VCALENDAR"));
  assert.ok(ics.includes("BEGIN:VEVENT"));
  assert.ok(ics.includes("SUMMARY:Resepsi Siang Bima & Citra"));
  assert.ok(ics.includes("LOCATION:Mexolie Hotel Kebumen"));
  assert.ok(ics.includes("DTSTART:20261120T110000Z"));
  assert.ok(ics.includes("DTEND:20261120T140000Z"));
  assert.ok(ics.includes("END:VEVENT"));
  assert.ok(ics.includes("END:VCALENDAR"));
});
