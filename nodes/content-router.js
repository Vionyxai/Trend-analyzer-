// =============================================================
// NODE 5: CONTENT ROUTER
// n8n settings: Run Once for All Items
// =============================================================
//
// Adds a `route` field based on classified_type and passes all
// items through as a single output.
//
// NOTE: Switch node is NOT used — it would not save routing rules
// reliably in n8n v2. This Code node is the replacement.
// =============================================================

const ROUTE_MAP = {
  storytelling:    'storytelling',
  talking_head:    'talking_head',
  text_over_video: 'text_over_video',
};

const results = [];

for (const item of $input.all()) {
  const post = item.json;
  const classifiedType = post.classified_type || 'unknown';

  results.push({
    json: {
      ...post,
      route: ROUTE_MAP[classifiedType] || 'unknown',
    },
  });
}

return results;
