/**
 * post-social.js — Posts daily quote to social media
 * Uses Twitter API v2 (requires TWITTER_API_KEY and TWITTER_API_SECRET as env vars)
 * Run via GitHub Actions: node scripts/post-social.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CURRENT_FILE = path.join(__dirname, '..', 'data', 'current-quote.json');
const SITE_URL = process.env.SITE_URL || 'https://dailylift.site';

// Twitter API credentials from GitHub Secrets
const TWITTER_BEARER = process.env.TWITTER_BEARER_TOKEN || '';

async function main() {
    console.log('📱 Social media posting...');

    // Read current quote
    let quote;
    try {
        quote = JSON.parse(fs.readFileSync(CURRENT_FILE, 'utf-8'));
    } catch (e) {
        console.error('❌ Cannot read current-quote.json:', e.message);
        process.exit(1);
    }

    const tweetText = `✨ Today's Quote:\n\n"${quote.text}"\n— ${quote.author}\n\n🌐 More at ${SITE_URL}\n\n#motivation #quotes #dailyquotes #inspiration`;

    console.log('📝 Prepared post:');
    console.log(tweetText);
    console.log('');

    // Twitter / X Post
    if (TWITTER_BEARER) {
        console.log('🐦 Posting to Twitter/X...');
        try {
            // NOTE: This is a placeholder. Actual Twitter API v2 posting requires
            // OAuth 2.0 user context with tweet.write scope. You'll need:
            // 1. Create a Twitter Developer App at developer.twitter.com
            // 2. Generate OAuth 2.0 tokens with tweet.write permission
            // 3. Store as TWITTER_BEARER_TOKEN in GitHub Secrets
            //
            // The actual POST request would be:
            // POST https://api.twitter.com/2/tweets
            // Body: { "text": tweetText }
            // Headers: { "Authorization": "Bearer " + TWITTER_BEARER }

            console.log('⚠️ Twitter posting requires OAuth 2.0 setup.');
            console.log('   Set TWITTER_BEARER_TOKEN in GitHub Secrets.');
            console.log('   See: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets');
        } catch (e) {
            console.error('❌ Twitter post failed:', e.message);
        }
    } else {
        console.log('ℹ️ TWITTER_BEARER_TOKEN not set — skipping Twitter post');
    }

    // IFTTT Webhook (alternative for social posting)
    const IFTTT_KEY = process.env.IFTTT_WEBHOOK_KEY || '';
    if (IFTTT_KEY) {
        console.log('🔗 Triggering IFTTT webhook...');
        try {
            const postData = JSON.stringify({
                value1: quote.text,
                value2: quote.author,
                value3: SITE_URL
            });

            const options = {
                hostname: 'maker.ifttt.com',
                path: `/trigger/daily_quote/with/key/${IFTTT_KEY}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            await new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    res.on('data', () => { });
                    res.on('end', () => {
                        console.log('✅ IFTTT webhook triggered (status:', res.statusCode + ')');
                        resolve();
                    });
                });
                req.on('error', reject);
                req.write(postData);
                req.end();
            });
        } catch (e) {
            console.error('❌ IFTTT webhook failed:', e.message);
        }
    } else {
        console.log('ℹ️ IFTTT_WEBHOOK_KEY not set — skipping IFTTT');
    }

    console.log('\n✨ Social media posting complete.');
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
