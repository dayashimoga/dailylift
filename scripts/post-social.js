/**
 * post-social.js — Posts daily quote to social media
 * Uses Twitter API v2 with OAuth 1.0a
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

const CURRENT_FILE = path.join(__dirname, '..', 'data', 'current-quote.json');
const SITE_URL = process.env.SITE_URL || 'https://dailylift.site';

// OAuth 1.0a keys
const consumerKey = process.env.TWITTER_API_KEY || '';
const consumerSecret = process.env.TWITTER_API_SECRET || '';
const tokenKey = process.env.TWITTER_ACCESS_TOKEN || '';
const tokenSecret = process.env.TWITTER_ACCESS_SECRET || '';

async function main() {
    console.log('📱 Social media posting...');

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

    if (consumerKey && consumerSecret && tokenKey && tokenSecret) {
        console.log('🐦 Posting to Twitter/X...');

        const oauth = OAuth({
            consumer: { key: consumerKey, secret: consumerSecret },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64');
            },
        });

        const request_data = {
            url: 'https://api.twitter.com/2/tweets',
            method: 'POST',
        };

        const token = {
            key: tokenKey,
            secret: tokenSecret,
        };

        const postData = JSON.stringify({ text: tweetText });
        const authHeader = oauth.toHeader(oauth.authorize(request_data, token));

        const options = {
            hostname: 'api.twitter.com',
            path: '/2/tweets',
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        try {
            await new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let d = '';
                    res.on('data', (chunk) => { d += chunk; });
                    res.on('end', () => {
                        if (res.statusCode === 201) {
                            console.log('✅ Twitter post successful!');
                            resolve();
                        } else {
                            console.error('❌ Twitter post failed. Status:', res.statusCode);
                            console.error('Response:', d);
                            reject(new Error(`HTTP ${res.statusCode}`));
                        }
                    });
                });
                req.on('error', reject);
                req.write(postData);
                req.end();
            });
        } catch (e) {
            console.error('❌ Twitter post exception:', e.message);
        }
    } else {
        console.log('ℹ️ Twitter API Keys not fully set — skipping Twitter post');
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
