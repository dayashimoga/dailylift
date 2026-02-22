/**
 * post-social.js — Posts daily quote to social media
 * Uses IFTTT Webhook native integration
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CURRENT_FILE = path.join(__dirname, '..', 'data', 'current-quote.json');
const SITE_URL = process.env.SITE_URL || 'https://dailylift.site';

// IFTTT Webhook Key
const IFTTT_KEY = process.env.IFTTT_WEBHOOK_KEY || '';

async function main() {
    console.log('📱 Social media posting...');

    let quote;
    try {
        quote = JSON.parse(fs.readFileSync(CURRENT_FILE, 'utf-8'));
    } catch (e) {
        console.error('❌ Cannot read current-quote.json:', e.message);
        process.exit(1);
    }

    console.log('📝 Prepared quote for IFTTT:');
    console.log(`"${quote.text}" — ${quote.author}`);
    console.log('');

    if (IFTTT_KEY) {
        console.log('🔗 Triggering IFTTT webhook for Twitter posting...');
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
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            console.log('✅ IFTTT webhook triggered successfully (status:', res.statusCode + ')');
                            resolve();
                        } else {
                            console.error('❌ IFTTT webhook returned non-success status:', res.statusCode);
                            reject(new Error(`HTTP Status ${res.statusCode}`));
                        }
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
        console.log('ℹ️ IFTTT_WEBHOOK_KEY not set — skipping social media post');
    }

    console.log('\n✨ Social media automation complete.');
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
