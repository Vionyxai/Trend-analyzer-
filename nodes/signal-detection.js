// =============================================================
// NODE 2: SIGNAL DETECTION
// n8n settings: Run Once for All Items
// =============================================================
//
// Scores every post from Apify and decides whether it passes.
// Outputs ALL items — the Filter node downstream drops pass: false.
//
// CONFIRMED Apify fields used:
//   videoPlayCount, likesCount, commentsCount, caption,
//   ownerUsername, url, hashtags, timestamp
//
// Fields that DO NOT exist in Apify output (never read these):
//   followerCount, platform, contentType
//
// FOLLOWER COUNT PROXY (Apify does not return follower count):
//   Large accounts are filtered via three combined signals:
//   1. MAX_LIKES     — large accounts consistently exceed 5k likes/post
//   2. MAX_VIEWS     — large accounts always get high absolute view counts
//   3. MIN_ENGAGEMENT_RATE — large accounts have passive audiences,
//                            so their likes/views ratio stays low
// =============================================================

// --- Thresholds (tune these as real data flows in) -----------
const MIN_VIEWS           = 10000;   // floor: need some real traction
const MAX_VIEWS           = 250000;  // ceiling: large account proxy + already viral
const MIN_LIKES           = 500;     // floor: confirm real response
const MAX_LIKES           = 5000;    // ceiling: large account proxy
const MIN_COMMENT_RATE    = 0.002;   // commentsCount / videoPlayCount (tuned from 0.003)
const STRONG_COMMENT_RATE = 0.008;   // threshold for strong signal
const MIN_ENGAGEMENT_RATE = 0.08;    // likesCount / videoPlayCount (raised from 0.05)
const MIN_ASCII_RATIO     = 0.85;    // caption must be ≥85% ASCII (English filter)

// --- Helper: English language check -------------------------
function isEnglish(text) {
  if (!text || text.length === 0) return true;
  const chars = text.split('');
  const asciiCount = chars.filter(c => c.charCodeAt(0) < 128).length;
  return (asciiCount / chars.length) >= MIN_ASCII_RATIO;
}

// --- Helper: safe number ------------------------------------
function num(val) {
  return Number(val) || 0;
}

// --- Main loop ----------------------------------------------
const results = [];

for (const item of $input.all()) {
  const post = item.json;

  const views    = num(post.videoPlayCount);
  const likes    = num(post.likesCount);
  const comments = num(post.commentsCount);
  const caption  = post.caption || '';

  // 1. English filter
  if (!isEnglish(caption)) {
    results.push({ json: { ...post, pass: false, fail_reason: 'non_english' } });
    continue;
  }

  // 2. Views floor
  if (views < MIN_VIEWS) {
    results.push({ json: { ...post, pass: false, fail_reason: 'low_views' } });
    continue;
  }

  // 3. Views ceiling (large account proxy + already-viral filter)
  if (views > MAX_VIEWS) {
    results.push({ json: { ...post, pass: false, fail_reason: 'too_viral_or_large_account' } });
    continue;
  }

  // 4. Likes ceiling (large account proxy)
  if (likes > MAX_LIKES) {
    results.push({ json: { ...post, pass: false, fail_reason: 'large_account' } });
    continue;
  }

  // 5. Likes floor
  if (likes < MIN_LIKES) {
    results.push({ json: { ...post, pass: false, fail_reason: 'low_likes' } });
    continue;
  }

  // 6. Comment rate
  const commentRate = views > 0 ? comments / views : 0;
  if (commentRate < MIN_COMMENT_RATE) {
    results.push({ json: { ...post, pass: false, fail_reason: 'low_comment_rate' } });
    continue;
  }

  // 7. Engagement rate (large account proxy — passive audiences fail this)
  const engagementRate = views > 0 ? likes / views : 0;
  if (engagementRate < MIN_ENGAGEMENT_RATE) {
    results.push({ json: { ...post, pass: false, fail_reason: 'low_engagement' } });
    continue;
  }

  // 8. Assign signal strength
  let signalStrength;
  if (commentRate >= STRONG_COMMENT_RATE && engagementRate >= 0.12) {
    signalStrength = 'strong';
  } else if (commentRate >= STRONG_COMMENT_RATE || engagementRate >= 0.10) {
    signalStrength = 'moderate';
  } else {
    signalStrength = 'early';
  }

  results.push({
    json: {
      ...post,
      pass: true,
      signal_strength: signalStrength,
      comment_rate: commentRate,
      engagement_rate: engagementRate,
    }
  });
}

return results;
