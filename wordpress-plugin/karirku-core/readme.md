# KarirKu Core (prototype 0.1.0)

WordPress plugin for KarirKu multi-instrument research data collection.

## Install
1. Download this folder as a ZIP (or package the `karirku-core` directory).
2. In WordPress, go to Plugins → Add New → Upload Plugin.
3. Activate **KarirKu Core**.
4. Open **KarirKu → Pengaturan** and set the frontend URL.
5. Add `[karirku_app height="950"]` to the WordPress page where the app should appear.

Optional Google Sheets relay:
- Add the Apps Script Web App URL and a shared secret in plugin settings.
- The plugin sends research payloads server-to-server. The payload intentionally excludes name/email.
- The Apps Script endpoint must validate the same shared secret and return JSON: `{"success":true}`.

## REST endpoint
`POST /wp-json/karirku/v1/submission`

Example JSON:
```json
{
  "instrument_slug": "riasec",
  "instrument_version": "1.0",
  "started_at": "2026-11-02T09:00:00+07:00",
  "duration_seconds": 420,
  "consent": {"given": true, "version": "1.0"},
  "identity": {"full_name": "Optional participant name", "email": ""},
  "demographics": {"age": 18, "education_status": "SMA"},
  "responses": {"q01": 5, "q02": 4},
  "scores": {"R": 20, "I": 25, "A": 18, "S": 30, "E": 22, "C": 24},
  "result": {"profile_code": "SIC", "career_recommendations": ["..."]},
  "feedback": {"accuracy": 4, "relevance": 5, "comment": ""}
}
```

The server creates the participant code and submission UUID. Personal identifiers are written to `wp_karirku_identities`; research responses and results are written to `wp_karirku_submissions` and linked only by internal participant ID. The research dashboard does not display names/emails.

## Database tables
- `wp_karirku_participants`: generated participant code and participant status.
- `wp_karirku_identities`: optional name/email, separately permission-gated in the admin UI.
- `wp_karirku_instruments`: instrument registry and version.
- `wp_karirku_submissions`: one completed instrument submission per row, with demographics, item responses, scores, results, consent evidence, feedback and Sheets sync state.

## Important prototype limitations
- This is a first integration scaffold, not yet production-ready.
- The current RIASEC frontend has not yet been changed to POST submissions to this endpoint or to consume the server-issued participant code.
- The iframe shortcode passes the REST endpoint in the `karirku_api` query parameter. The frontend must read this parameter and submit a JSON payload to it.
- Configure the exact frontend origin in WordPress CORS policy before enabling cross-origin submission. Review hosting/CDN caching and HTTPS.
- Public submissions have basic IP rate limiting; production deployment should add stronger abuse controls, request signing/nonce strategy, privacy notice, retention/deletion workflow, backup policy, and server-side validation for each instrument.
- The included identity table is intentionally separate but not a substitute for an approved data-management and ethics protocol.
- Do not store passwords, sensitive special-category data, or direct identifiers in the research payload.
