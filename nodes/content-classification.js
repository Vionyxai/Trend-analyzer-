// =============================================================
// NODE 4: CONTENT CLASSIFICATION
// n8n settings: Run Once for All Items
// =============================================================
//
// Calls Claude API to classify each post's caption into one of:
//   storytelling   — personal narrative, story arc, emotional journey
//   talking_head   — direct address, tips, advice, how-to
//   text_over_video — minimal caption, visual/text-on-screen content
//
// Uses claude-haiku (fast + cheap). max_tokens: 20 (label only).
// Caption truncated to 500 chars to minimise cost.
//
// SETUP REQUIRED:
//   Paste your Anthropic API key below where it says YOUR_KEY_HERE.
//   Get your key at: console.anthropic.com → API Keys
// =============================================================

const ANTHROPIC_API_KEY = 'YOUR_KEY_HERE'; // ← paste your key here

const VALID_TYPES = ['storytelling', 'talking_head', 'text_over_video'];

const results = [];

for (const item of $input.all()) {
  const post = item.json;
  const caption = (post.caption || '').trim();

  let classifiedType = 'unknown';

  if (caption.length > 0) {
    try {
      const prompt = `Classify this Instagram caption into exactly one category. Reply with only the category name — no punctuation, no explanation, nothing else.

Categories:
- storytelling (personal narrative, emotional journey, story arc, relatable experience)
- talking_head (direct advice, tips, how-to, opinion, motivational speech to camera)
- text_over_video (short caption, visual-first content, text overlaid on footage, minimal words)

Caption:
"${caption.substring(0, 500)}"

Category:`;

      // Use native fetch — available in Node.js 18+ which n8n v2 requires
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 20,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        // Surface HTTP error code in classified_type temporarily for debugging
        classifiedType = `api_error_${res.status}`;
      } else {
        const data = await res.json();
        const raw = data.content[0].text.trim().toLowerCase().replace(/[^a-z_]/g, '');
        if (VALID_TYPES.includes(raw)) {
          classifiedType = raw;
        }
      }

    } catch (error) {
      // Surface the error message temporarily so it shows in the SMS for debugging
      // Once working, this can be changed back to just: classifiedType = 'unknown'
      const msg = (error.message || String(error)).substring(0, 40).replace(/\s+/g, '_');
      classifiedType = `err_${msg}`;
    }
  }

  results.push({
    json: {
      ...post,
      classified_type: classifiedType,
    },
  });
}

return results;
