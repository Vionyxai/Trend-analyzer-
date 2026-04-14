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
//
// The entire Claude call is wrapped in try/catch.
// If it fails for any reason the post gets classified as 'unknown'
// and the workflow continues — this node will never crash.
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
      const response = await $helpers.httpRequest({
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 20,
          messages: [
            {
              role: 'user',
              content: `Classify this Instagram caption into exactly one category. Reply with only the category name — no punctuation, no explanation, nothing else.

Categories:
- storytelling (personal narrative, emotional journey, story arc, relatable experience)
- talking_head (direct advice, tips, how-to, opinion, motivational speech to camera)
- text_over_video (short caption, visual-first content, text overlaid on footage, minimal words)

Caption:
"${caption.substring(0, 500)}"

Category:`,
            },
          ],
        }),
      });

      const raw = response.content[0].text.trim().toLowerCase().replace(/[^a-z_]/g, '');

      if (VALID_TYPES.includes(raw)) {
        classifiedType = raw;
      }
    } catch (error) {
      // Claude call failed — default to 'unknown', do not crash
      classifiedType = 'unknown';
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
