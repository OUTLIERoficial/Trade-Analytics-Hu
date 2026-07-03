---
name: OUTLIER object storage upload pattern
description: How trade screenshot uploads work across web and mobile clients in OUTLIER
---

Both web and mobile clients use the same 3-step flow for uploading trade chart screenshots:
1. `POST /api/storage/uploads/request-url` with `{ name, contentType }` → returns `{ uploadURL, objectPath }`.
2. `PUT` the file bytes directly to `uploadURL`.
3. View/display the image via `${baseUrl}/api/storage${objectPath}`.

Trades store images as a JSON-stringified array of object paths in the `imageUrls` field (and mirror the first one into legacy `screenshotUrl`). `CreateTradeBody` requires `accountId`; `UpdateTradeBody` does not (account is immutable on edit).

**Why:** keeping upload logic consistent avoids divergent auth/URL handling between web and Expo (mobile uses `Authorization: Bearer <outlier_sid>` from AsyncStorage; web uses cookie session).

**How to apply:** when adding any new image/file upload feature in OUTLIER (web or mobile), reuse this exact request-url → PUT → view-path flow rather than inventing a new storage endpoint.
