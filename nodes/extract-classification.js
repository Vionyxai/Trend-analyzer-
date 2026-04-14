// =============================================================
// NODE 4b: EXTRACT CLASSIFICATION
// n8n settings: Run Once for All Items
// =============================================================
//
// Runs after the HTTP Request node that called Claude API.
// Extracts the classification label from Claude's response and
// merges it back with the original post data from Signal Filter.
//
// Workflow position: Signal Filter → HTTP Request (Claude) → THIS NODE
// =============================================================

const VALID_TYPES = ['storytelling', 'talking_head', 'text_over_video'];

// Original post data comes from the Signal Filter node
const originalPosts = $('Signal Filter').all();
const claudeResponses = $input.all();

const results = [];

for (let i = 0; i < claudeResponses.length; i++) {
  const claudeResponse = claudeResponses[i].json;
  const originalPost   = (originalPosts[i] || claudeResponses[i]).json;

  let classifiedType = 'unknown';

  try {
    const raw = claudeResponse.content[0].text
      .trim()
      .toLowerCase()
      .replace(/[^a-z_]/g, '');

    if (VALID_TYPES.includes(raw)) {
      classifiedType = raw;
    }
  } catch (e) {
    classifiedType = 'unknown';
  }

  results.push({
    json: {
      ...originalPost,
      classified_type: classifiedType,
    },
  });
}

return results;
