# Instagram Trend Detection — n8n Node Code

Paste the code below into the corresponding n8n Code nodes. Every node must be set to **Run Once for All Items**.

---

## Pre-flight checklist

- [ ] Apify HTTP Request URL points to the **dataset items** endpoint (not the run endpoint)
- [ ] Apify scrape type is set to **Scrape posts** (not "Scrape details of a hashtag")
- [ ] `ANTHROPIC_API_KEY` added in n8n → Settings → Environment Variables
- [ ] Twilio node message field contains **only** `{{ $json.message_text }}` — no extra characters after the closing bracket
- [ ] Filter node (Node 3) is set to pass items where `pass` equals `true`

---

## Node 2 — Signal Detection

**File:** `nodes/signal-detection.js`

**n8n settings:** Code node → Run Once for All Items

Paste the full contents of `signal-detection.js` into the code editor.

### What it does
- Checks every post against 7 filters in order
- New in this version: **MAX_VIEWS ceiling (250,000)** as a second large-account proxy — accounts with 70k–159k+ followers consistently get views above this threshold
- New in this version: **English language filter** — captions with less than 85% ASCII characters are dropped
- Engagement rate floor raised to **8%** (from 5%) — large accounts with passive audiences consistently fail this
- Outputs all items; the Filter node drops anything with `pass: false`

### Thresholds (tune as real data flows in)
| Constant | Value | Why |
|---|---|---|
| MIN_VIEWS | 10,000 | Need real traction |
| MAX_VIEWS | 250,000 | Large account + already-viral filter |
| MIN_LIKES | 500 | Confirm real response |
| MAX_LIKES | 5,000 | Large account proxy |
| MIN_COMMENT_RATE | 0.002 | Tuned down from 0.003 after real-data test |
| MIN_ENGAGEMENT_RATE | 0.08 | Raised from 0.05 — filters passive large-account audiences |
| MIN_ASCII_RATIO | 0.85 | English-only filter |

---

## Node 3 — Signal Filter

**n8n built-in Filter node** (no code required)

Condition: `pass` equals `true`

---

## Node 4 — Content Classification

**File:** `nodes/content-classification.js`

**n8n settings:** Code node → Run Once for All Items

Paste the full contents of `content-classification.js` into the code editor.

### What it does
- Calls Claude API (Haiku model — fast and cheap) for each post
- Reads the caption and returns one of: `storytelling`, `talking_head`, `text_over_video`
- Falls back to `unknown` on any error — never crashes the workflow
- Requires `ANTHROPIC_API_KEY` in n8n environment variables

### Setup
1. Go to n8n → Settings → Environment Variables
2. Add: `ANTHROPIC_API_KEY` = your key from console.anthropic.com

---

## Node 5 — Content Router

**File:** `nodes/content-router.js`

**n8n settings:** Code node → Run Once for All Items

Paste the full contents of `content-router.js` into the code editor.

### What it does
- Adds a `route` field based on `classified_type`
- Passes all items through as a single output
- Switch node is intentionally NOT used — it does not save routing rules reliably in n8n v2

---

## Node 6 — SMS Builder

**File:** `nodes/sms-builder.js`

**n8n settings:** Code node → Run Once for All Items

Paste the full contents of `sms-builder.js` into the code editor.

### What it does
- Builds the `message_text` field for every post
- Every field is null-safe — will never crash on missing Apify data
- Platform hardcoded as `Instagram` (Apify does not return this field)
- Format-specific action tip appended to every message

### Example output
```
👀 EARLY SIGNAL
Format: Storytelling
Creator: @username
Platform: Instagram

Views: 42,500
Likes: 3,800
Comments: 210
Reach: 0.49% commented

Hook: I almost quit three times before this happened...

Tip: Try a 3-part story arc: hook → tension → resolution. Make it personal.
```

---

## Node 7 — Send Alert (Twilio)

**n8n built-in Twilio node** (no code required)

Set the message field to exactly:
```
{{ $json.message_text }}
```

**Nothing after the closing bracket.** Any extra character (including `}}`) will appear in every SMS.

---

## Confirmed Apify fields

These are the only fields returned by the Apify Instagram Scraper that this system uses:

| Field | Used in |
|---|---|
| `videoPlayCount` | Signal Detection, SMS Builder |
| `likesCount` | Signal Detection, SMS Builder |
| `commentsCount` | Signal Detection, SMS Builder |
| `caption` | Signal Detection, Classification, SMS Builder |
| `ownerUsername` | SMS Builder |
| `url` | Available but not currently used |
| `hashtags` | Available but not currently used |
| `timestamp` | Available but not currently used |

**Fields that do NOT exist in Apify output:** `followerCount`, `platform`, `contentType`
