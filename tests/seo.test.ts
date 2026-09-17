import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SITE_URL,
  SITE_NAME,
  absoluteUrl,
  localBusinessJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
} from "../src/lib/seo";

test("SITE_URL is defined and has no trailing slash", () => {
  assert.ok(typeof SITE_URL === "string" && SITE_URL.length > 0);
  assert.ok(!SITE_URL.endsWith("/"), "SITE_URL must not end with a slash");
});

test("absoluteUrl builds absolute URLs and normalizes leading slash", () => {
  assert.equal(absoluteUrl("/legal/privacy"), `${SITE_URL}/legal/privacy`);
  assert.equal(absoluteUrl("help"), `${SITE_URL}/help`);
  assert.equal(absoluteUrl("/"), `${SITE_URL}/`);
});

test("localBusinessJsonLd returns valid schema.org LocalBusiness", () => {
  const ld = localBusinessJsonLd();
  assert.equal(ld["@context"], "https://schema.org");
  assert.equal(ld["@type"], "LocalBusiness");
  assert.equal(ld.name, SITE_NAME);
  assert.equal(ld.url, SITE_URL);
  assert.ok(ld.address && ld.address.addressLocality === "Kebumen");
  assert.ok(ld.areaServed && String(ld.areaServed.name).includes("Kebumen"));
});

test("faqJsonLd maps items to FAQPage mainEntity", () => {
  const ld = faqJsonLd([
    { question: "Q1?", answer: "A1" },
    { question: "Q2?", answer: "A2" },
  ]);
  assert.equal(ld["@type"], "FAQPage");
  assert.equal(ld.mainEntity.length, 2);
  assert.equal(ld.mainEntity[0].name, "Q1?");
  assert.equal(ld.mainEntity[0].acceptedAnswer.text, "A1");
});

test("breadcrumbJsonLd assigns sequential positions and absolute items", () => {
  const ld = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Legal", path: "/legal/privacy" },
  ]);
  assert.equal(ld["@type"], "BreadcrumbList");
  assert.equal(ld.itemListElement.length, 2);
  assert.equal(ld.itemListElement[0].position, 1);
  assert.equal(ld.itemListElement[1].position, 2);
  assert.equal(ld.itemListElement[1].item, `${SITE_URL}/legal/privacy`);
});
