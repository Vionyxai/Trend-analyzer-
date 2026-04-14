// =============================================================
// NODE 6: SMS BUILDER
// n8n settings: Run Once for All Items
// =============================================================
//
// Builds the final message_text field for every passing post.
// Every field access is null-safe — this node will never crash
// on missing or undefined Apify data.
//
// Output field: message_text
// Twilio node expression: {{ $json.message_text }}
//   (nothing after the closing bracket — bug #3 fix)
//
// Platform is hardcoded as "Instagram" because Apify does not
// return a platform field (bug #7 fix).
// =============================================================

// --- Helpers ------------------------------------------------
function safeNum(val) {
  return Number(val) || 0;
}

function fmt(val) {
  return safeNum(val).toLocaleString();
}

function titleCase(str) {
  return (str || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// --- Signal label -------------------------------------------
function getSignalLabel(strength) {
  if (strength === 'strong')   return '🔥 STRONG SIGNAL';
  if (strength === 'moderate') return '📈 SIGNAL DETECTED';
  return '👀 EARLY SIGNAL';
}

// --- Action tip per format ----------------------------------
function getActionTip(classifiedType) {
  if (classifiedType === 'storytelling') {
    return 'Try a 3-part story arc: hook → tension → resolution. Make it personal.';
  }
  if (classifiedType === 'talking_head') {
    return 'Lead with a bold claim or contrarian take in the first 2 seconds.';
  }
  if (classifiedType === 'text_over_video') {
    return 'Use bold text callouts on screen — let the visuals do the talking.';
  }
  return 'Study the hook and pacing — identify what made this land and replicate it.';
}

// --- Main loop ----------------------------------------------
const results = [];

for (const item of $input.all()) {
  const post = item.json;

  const signalStrength  = post.signal_strength  || 'early';
  const classifiedType  = post.classified_type  || 'unknown';
  const username        = post.ownerUsername    || 'unknown';
  const views           = safeNum(post.videoPlayCount);
  const likes           = safeNum(post.likesCount);
  const comments        = safeNum(post.commentsCount);
  const caption         = post.caption          || '';
  const commentRate     = Number(post.comment_rate) || 0;

  const signalLabel  = getSignalLabel(signalStrength);
  const formatLabel  = titleCase(classifiedType);
  const actionTip    = getActionTip(classifiedType);
  const hook         = caption.substring(0, 100).trim();
  const reachPct     = (commentRate * 100).toFixed(2);

  const message_text =
`${signalLabel}
Format: ${formatLabel}
Creator: @${username}
Platform: Instagram

Views: ${fmt(views)}
Likes: ${fmt(likes)}
Comments: ${fmt(comments)}
Reach: ${reachPct}% commented

Hook: ${hook}

Tip: ${actionTip}`;

  results.push({
    json: {
      ...post,
      message_text,
    },
  });
}

return results;
