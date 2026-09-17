import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toWibDateString,
  getStartOfDayWIB,
  getEndOfDayWIB,
  addCalendarDaysWIB,
  diffCalendarDaysWIB,
  isValidWibDateString,
  WIB_OFFSET_MINUTES,
} from "../src/lib/date-utils";

test("WIB offset constant is UTC+7", () => {
  assert.equal(WIB_OFFSET_MINUTES, 420);
});

test("toWibDateString passes through already-canonical YYYY-MM-DD", () => {
  assert.equal(toWibDateString("2026-11-20"), "2026-11-20");
});

test("toWibDateString rejects impossible calendar dates", () => {
  assert.throws(() => toWibDateString("2026-02-30"), RangeError);
  assert.throws(() => toWibDateString("2026-13-01"), RangeError);
  assert.throws(() => toWibDateString(""), RangeError);
});

test("toWibDateString converts a UTC instant before 17:00Z to same WIB day", () => {
  // 2026-11-20T09:00:00Z = 16:00 WIB pada 20 Nov
  assert.equal(toWibDateString("2026-11-20T09:00:00Z"), "2026-11-20");
});

test("toWibDateString rolls late-night UTC instants into the next WIB day", () => {
  // 2026-11-20T18:00:00Z = 01:00 WIB pada 21 Nov
  assert.equal(toWibDateString("2026-11-20T18:00:00Z"), "2026-11-21");
});

test("getStartOfDayWIB returns the instant 17:00Z of the previous calendar day", () => {
  const start = getStartOfDayWIB("2026-11-20");
  assert.equal(start.toISOString(), "2026-11-19T17:00:00.000Z");
});

test("getEndOfDayWIB returns 23:59:59.999 WIB (16:59:59.999Z)", () => {
  const end = getEndOfDayWIB("2026-11-20");
  assert.equal(end.toISOString(), "2026-11-20T16:59:59.999Z");
});

test("getStartOfDayWIB and getEndOfDayWIB span exactly one 24h calendar day", () => {
  const start = getStartOfDayWIB("2026-11-20").getTime();
  const end = getEndOfDayWIB("2026-11-20").getTime();
  assert.equal(end - start, 24 * 60 * 60 * 1000 - 1);
});

test("addCalendarDaysWIB handles month and year rollovers", () => {
  assert.equal(addCalendarDaysWIB("2026-11-20", 3), "2026-11-23");
  assert.equal(addCalendarDaysWIB("2026-12-30", 3), "2027-01-02");
  assert.equal(addCalendarDaysWIB("2026-11-05", -7), "2026-10-29");
});

test("addCalendarDaysWIB rejects non-integer day offsets", () => {
  assert.throws(() => addCalendarDaysWIB("2026-11-20", 1.5), RangeError);
});

test("diffCalendarDaysWIB computes signed whole-day difference", () => {
  assert.equal(diffCalendarDaysWIB("2026-11-23", "2026-11-20"), 3);
  assert.equal(diffCalendarDaysWIB("2026-11-20", "2026-11-23"), -3);
  assert.equal(diffCalendarDaysWIB("2026-11-20", "2026-11-20"), 0);
});

test("diffCalendarDaysWIB is stable across a WIB midnight boundary", () => {
  // 17 Nov 16:00Z = 17 Nov 23:00 WIB ; 17 Nov 17:00Z = 18 Nov 00:00 WIB
  assert.equal(diffCalendarDaysWIB("2026-11-17T16:00:00Z", "2026-11-17T17:00:00Z"), -1);
});

test("isValidWibDateString guards type and format", () => {
  assert.equal(isValidWibDateString("2026-11-20"), true);
  assert.equal(isValidWibDateString("2026-02-30"), false);
  assert.equal(isValidWibDateString("20-11-2026"), false);
  assert.equal(isValidWibDateString(20261120), false);
  assert.equal(isValidWibDateString(null), false);
});
