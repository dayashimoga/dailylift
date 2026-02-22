# DailyLift: Deployment, Monetization, and Automation Guide

This document serves as the ultimate reference for configuring the infrastructure, revenue streams, and automated social media presence of the DailyLift application. If you are setting up the project from scratch or transferring ownership, follow these steps exactly.

---

## 🏗️ 1. Hosting & Domain Setup

### 1.1 Purchasing the Domain
1. Purchase a domain name from a registrar like **Porkbun**, Namecheap, or GoDaddy (e.g., `quickutils.top`).
2. Do not set up DNS records at the registrar yet. We will transfer DNS management entirely to Netlify.

### 1.2 Deploying on Netlify
1. Log into [Netlify](https://app.netlify.com/) and click **Add new site** -> **Import an existing project**.
2. Connect your GitHub account and select your `dailylift` repository.
3. Use the following build settings:
   - **Base directory:** *(leave blank)*
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy Site**. Netlify will build the HTML and publish it to a temporary `.netlify.app` URL.

### 1.3 Configuring Custom Domain & DNS
1. In the Netlify dashboard for your site, go to **Domain management**.
2. Click **Add custom domain** and type your purchased domain (`quickutils.top`).
3. Netlify will prompt you to set up Netlify DNS. Proceed through the wizard to generate the 4 custom Name Servers (e.g., `dns1.p01.nsone.net`).
4. Log into your domain registrar (Porkbun) and locate the **Name Servers (NS)** settings for your domain.
5. Replace the default name servers with the 4 Netlify name servers.
6. **Wait up to 24 hours.** Global DNS propagation takes time.
7. Once propagated, Netlify will automatically provision a free Let's Encrypt **SSL Certificate**, changing your site from "Not Secure" to a secure padlock.

---

## 💰 2. Monetization Setup

### 2.1 Amazon Associates (Affiliate Links)
We monetize the recommended books section by earning a commission on clicks and purchases.
1. Sign up for [Amazon Associates](https://affiliate-program.amazon.com/).
2. Fill out your tax and payment information.
3. Locate your **Store ID / Tracking ID** (e.g., `quickutils-21`).
4. In your codebase, open `src/index.html` and locate the book recommendations section.
5. Search Amazon for the books (*Atomic Habits*, *Deep Work*, etc.), generate affiliate links using the Amazon SiteStripe toolbar, and replace the `href=""` attributes in the HTML.

### 2.2 Google AdSense (Banner Ads)
We earn passive revenue based on ad impressions and clicks.
1. Go to [Google AdSense](https://adsense.google.com/start/) and sign in with your Google account.
2. Add your custom domain (`https://quickutils.top`) under the "Sites" tab.
3. Google will ask you to verify ownership. You can do this by dropping a `<meta name="google-adsense-account">` tag into the `<head>` of your `src/index.html`.
4. Locate your **Publisher ID** (e.g., `ca-pub-1234567890`).
5. In `src/index.html`, uncomment the Google AdSense script in the `<head>` and replace `YOUR_PUBLISHER_ID` with your actual ID.
6. AdSense placeholders (`<ins class="adsbygoogle">`) exist throughout the layout. They will remain blank until Google officially approves your site (takes 3 to 14 days).

---

## 🤖 3. Social Media Automation (Twitter / X)

Our project uses GitHub Actions to randomly select a quote from `data/quotes-collection.json` and publish it to Twitter every midnight UTC.

### Attempt 1: The Twitter API (Not Recommended)
Twitter recently restricted its Free API Tier, making basic posting highly difficult or hidden behind a "Pay-Per-Use" credit-card wall which returns `402 CreditsDepleted` errors.
- If you have an legacy "Free" API tier (1,500 posts), you can supply `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, and `TWITTER_ACCESS_SECRET` to the script.
- Because of X's aggressive monetization, **Method 2 is highly recommended.**

### Attempt 2: IFTTT Webhooks (Recommended & Used in Codebase)
We bypass the Twitter API paywall completely by utilizing a free automation bridge called IFTTT.

#### Step 1: Set up the IFTTT Applet
1. Create a free account at [IFTTT.com](https://ifttt.com).
2. Click **Create** to build a new Applet.
3. **If This:** Search for *Webhooks*, select *Receive a web request*, and name the Event exactly: `daily_quote`.
4. **Then That:** Search for *Twitter*, select *Post a tweet*, and connect your automated Twitter account.
5. In the Tweet text box, enter exactly:
   ```text
   ✨ Today's Quote:

   "{{Value1}}"
   — {{Value2}}

   🌐 More at {{Value3}}

   #motivation #quotes #dailyquotes #inspiration
   ```

#### Step 2: Connect the Webhook to GitHub
1. Go to [maker.ifttt.com](https://maker.ifttt.com) and click **Settings**.
2. Locate the URL. Your Secret Key is the string at the very end (after `/use/`).
3. Copy the Key.
4. Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions.
5. Create a new repository secret named `IFTTT_WEBHOOK_KEY` and paste your key.

#### Step 3: Verify Automation
Your `post-social.js` script is natively programmed to find the `IFTTT_WEBHOOK_KEY` environment variable. 
To test it immediately, go to your GitHub repository -> Actions tab -> **Daily Quote Update** -> **Run workflow**. If successful, the GitHub runner will show a `200 Success` code, and the quote will instantly appear on your Twitter timeline!
