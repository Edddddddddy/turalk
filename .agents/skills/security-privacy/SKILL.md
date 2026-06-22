---
name: security-privacy
description: Protect Turalk's real-identity, account, moderation, and user-generated-content boundaries. Use for identity, auth, admin, audit, uploads, content rendering, or sensitive data flows.
---

# When to use

Use whenever a change handles identity, credentials, permissions, moderation, uploads, links, or user-generated content.

# Do

- Preserve the core boundary: verified in the backend, anonymous in public views.
- Minimize identity storage; abstract verification behind a provider interface instead of one vendor.
- Store no plaintext identity number, identity image, or raw biometric data.
- Send high-risk operations to `AuditLog` with minimal, redacted metadata.
- Require separate permission and separate audit for any identity lookup.
- Keep real identity unavailable to the default admin role and normal admin queries.
- Preserve reporting, review, removal, collapsing, rate limiting, banning, and appeal capabilities instead of mechanical keyword blocking.
- Address XSS, malicious links, upload type/size/content validation, storage isolation, and safe rendering for user-generated content.

# Don't

- Do not generate realistic identity numbers, phone numbers, or email addresses as test data.
- Do not log secrets, raw tokens, identity payloads, or unrestricted request bodies.
- Do not expose provider responses through public APIs.
- Do not treat simple keyword matching as the content governance system.

# Checklist

- Data collection and exposure are minimal.
- Authorization, audit, retention, and redaction are explicit.
- Public responses cannot leak identity data.
- UGC and upload threat paths are covered.
- Security/privacy impact is reported.
