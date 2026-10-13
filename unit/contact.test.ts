import assert from "node:assert/strict";
import test from "node:test";
import {
  createFormTimingToken,
  processContactSubmission,
  sendToGoogleSheet,
  validateContact,
  type ContactEnvironment,
  type ContactInput,
} from "../server/utils/contact.ts";

const validInput: ContactInput = {
  name: "Test Person",
  business: "Test Business",
  email: "test@example.com",
  phone: "555-0100",
  website: "",
  interest: "New Website",
  package: "The Works",
  message: "A local test inquiry.",
};

test("contact validation allows an omitted website and accepts HTTP or HTTPS", () => {
  for (const website of ["", "http://example.com", "https://example.com"]) {
    const result = validateContact({ ...validInput, website });
    assert.deepEqual(result.errors, {});
    assert.equal(result.data?.website, website);
    assert.equal(result.data?.package, "The Works");
  }

  const invalid = validateContact({ ...validInput, website: "example.com" });
  assert.equal(
    invalid.errors.website,
    "Enter a full website address beginning with http:// or https://.",
  );
});

test("contact validation rejects an unknown package without blanking the valid interest", () => {
  const result = validateContact({
    ...validInput,
    package: "Unknown package",
  } as unknown as ContactInput);
  assert.equal(result.errors.package, "Choose a valid website package.");
  assert.equal(result.errors.interest, undefined);
});

test("Google Sheets delivery requires a JSON response with ok true", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ ok: false, error: "Unable to process request" }),
        { status: 200 },
      );
    await assert.rejects(
      sendToGoogleSheet(
        validateContact(validInput).data!,
        "https://example.com/sheet",
        "secret",
      ),
      /rejected/,
    );

    globalThis.fetch = async () => new Response("not json", { status: 200 });
    await assert.rejects(
      sendToGoogleSheet(
        validateContact(validInput).data!,
        "https://example.com/sheet",
        "secret",
      ),
      /invalid response/,
    );

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 });
    await sendToGoogleSheet(
      validateContact(validInput).data!,
      "https://example.com/sheet",
      "secret",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("submission does not report success when Sheets rejects and email fails", async () => {
  const originalFetch = globalThis.fetch;
  const secret = "test-signing-secret";
  const environment: ContactEnvironment = {
    googleFormEndpoint: "https://example.com/sheet",
    googleFormSecret: "sheet-secret",
    resendApiKey: "resend-key",
    emailFrom: "hello@example.com",
    notificationEmail: "owner@example.com",
    turnstileSecretKey: "turnstile-secret",
    formSigningSecret: secret,
    minimumFormAgeSeconds: 0,
    maximumFormAgeSeconds: 60,
  };
  const responses = [
    new Response(
      JSON.stringify({
        success: true,
        action: "contact",
        hostname: "localhost",
      }),
      { status: 200 },
    ),
    new Response(JSON.stringify({ ok: false }), { status: 200 }),
    new Response("", { status: 500 }),
  ];

  try {
    globalThis.fetch = async () => responses.shift()!;
    const formToken = createFormTimingToken(secret, 0).token;
    await assert.rejects(
      processContactSubmission(
        { ...validInput, formToken, turnstileToken: "verified" },
        { clientAddress: "127.0.0.1", environment },
      ),
      AggregateError,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
