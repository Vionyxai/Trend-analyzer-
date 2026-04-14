// =============================================================
// NODE 4a: PREPARE CLAUDE REQUEST
// n8n settings: Run Once for All Items
// =============================================================
// Runs BEFORE the Claude API HTTP Request node.
// Adds a clean claude_prompt field to each post so the HTTP
// Request node can reference it as a simple expression.
// =============================================================

const results = [];

for (const item of $input.all()) {
  const post = item.json;
  const caption = (post.caption || '').trim();

  // Strip double quotes from caption to keep the JSON body clean
  const safeCaption = caption.substring(0, 500).replace(/"/g, "'");

  const claudePrompt = 'Classify this Instagram caption into one category. Reply with one word only — no punctuation, nothing else.\n\nOptions: storytelling, talking_head, text_over_video\n\nCaption: "' + safeCaption + '"\n\nCategory:';

  results.push({
    json: {
      ...post,
      claude_prompt: claudePrompt,
    },
  });
}

return results;
