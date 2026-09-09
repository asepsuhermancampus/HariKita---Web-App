import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatAccountNumber,
  getBankCardTheme,
  generateWhatsAppGiftConfirmationUrl,
} from "../src/lib/invitation/bankCard";

test("formatAccountNumber splits digits into clean 4-character spaced groups with dots or bullets", () => {
  assert.equal(formatAccountNumber("19827398124"), "1982 • 7398 • 124");
  assert.equal(formatAccountNumber("136001239847"), "1360 • 0123 • 9847");
  assert.equal(formatAccountNumber("5412"), "5412");
});

test("getBankCardTheme returns distinct luxurious color gradient tokens for major Indonesian banks", () => {
  const bca = getBankCardTheme("BCA");
  assert.equal(bca.badge, "BCA PLATINUM");
  assert.ok(bca.gradient.includes("#141824") || bca.gradient.includes("slate"));

  const mandiri = getBankCardTheme("Bank Mandiri");
  assert.equal(mandiri.badge, "MANDIRI PRIORITAS");
  assert.ok(mandiri.gradient.includes("amber") || mandiri.gradient.includes("#2A1D0B"));

  const bsi = getBankCardTheme("BSI");
  assert.equal(bsi.badge, "BSI HASANAH");
  assert.ok(bsi.gradient.includes("emerald") || bsi.gradient.includes("#0A261D"));

  const generic = getBankCardTheme("Bank Lain");
  assert.equal(generic.badge, "PREMIUM TRANSFER");
});

test("generateWhatsAppGiftConfirmationUrl creates valid click-to-chat WA link", () => {
  const wa = generateWhatsAppGiftConfirmationUrl({
    phoneNumber: "081987654321",
    coupleNames: "Bima & Citra",
    senderName: "Bapak Joko & Keluarga",
    bankName: "BCA",
  });

  assert.ok(wa.startsWith("https://wa.me/6281987654321"));
  assert.ok(wa.includes("text=") && (wa.includes("Bima+%26+Citra") || wa.includes("Bima%20%26%20Citra")));
  assert.ok(wa.includes("BCA"));
});
