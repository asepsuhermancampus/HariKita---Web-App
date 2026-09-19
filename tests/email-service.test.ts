import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const ORIGINAL_KEY = process.env.RESEND_API_KEY;
const ORIGINAL_DEV = process.env.OTP_DEV_MODE;

before(() => {
  delete process.env.RESEND_API_KEY;
  process.env.OTP_DEV_MODE = "true";
});

after(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = ORIGINAL_KEY;
  if (ORIGINAL_DEV === undefined) delete process.env.OTP_DEV_MODE;
  else process.env.OTP_DEV_MODE = ORIGINAL_DEV;
});

test("sendOtpEmail in dev mode returns devCode without sending", async () => {
  const { sendOtpEmail } = await import("../src/server/services/email-service");
  const res = await sendOtpEmail("test@example.com", "123456", "REGISTER");
  assert.equal(res.sent, false);
  assert.equal(res.devMode, true);
  assert.equal(res.devCode, "123456");
});

test("sendPinChangedEmail in dev mode returns devMode true", async () => {
  const { sendPinChangedEmail } = await import("../src/server/services/email-service");
  const res = await sendPinChangedEmail("test@example.com", "Budi");
  assert.equal(res.sent, false);
  assert.equal(res.devMode, true);
});
